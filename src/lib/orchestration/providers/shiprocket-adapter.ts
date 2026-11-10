import { writeAuditLog } from '../audit-service';
import { callShiprocketApi } from './shiprocket-logger';
import { redis } from '@/lib/redis';
import { firestoreService } from '@/lib/firestore';

export interface ShiprocketCreateOrderPayload {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: Array<{ name: string; quantity: number; price: number; slug?: string; category?: string }>;
  subtotal: number;
  total: number;
  paymentType: 'cod' | 'prepaid';
  remainingAmount: number; // in paise
}

export interface ShippingProviderResult {
  provider: 'borzo' | 'shiprocket';
  shipmentId: string;
  awbCode: string;
  courierName: string;
  trackingUrl: string;
  labelUrl?: string;
  rawResponse: any;
}

const SHIPROCKET_API_URL = 'https://apiv2.shiprocket.in/v1/external';
const REDIS_TOKEN_KEY = 'shiprocket:token';
const TOKEN_TTL_SECONDS = 9 * 24 * 60 * 60; // 9 days

let memoryToken: { token: string; expiresAt: number } | null = null;
let singleFlightLoginPromise: Promise<string> | null = null;

async function fetchFreshToken(orderId?: string): Promise<string> {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error('SHIPROCKET_CREDENTIALS_MISSING: SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD not configured');
  }

  const loginPayload = { email, password };
  const { ok, data } = await callShiprocketApi<{ token?: string; message?: string }>({
    endpoint: 'auth/login',
    url: `${SHIPROCKET_API_URL}/auth/login`,
    options: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginPayload),
    },
    orderId,
    requestPayload: { email, password: '***REDACTED***' },
  });

  if (!ok || !data.token) {
    throw new Error(`SHIPROCKET_AUTH_FAILED: ${data.message || JSON.stringify(data)}`);
  }

  const token = data.token;
  memoryToken = {
    token,
    expiresAt: Date.now() + TOKEN_TTL_SECONDS * 1000,
  };

  try {
    if (redis) {
      await redis.set(REDIS_TOKEN_KEY, token, { ex: TOKEN_TTL_SECONDS });
    }
  } catch (rErr) {
    console.warn('[ShiprocketAdapter] Redis token cache warning (memory fallback active):', rErr);
  }

  return token;
}

async function getShiprocketToken(orderId?: string, forceRefresh = false): Promise<string> {
  if (!forceRefresh) {
    if (memoryToken && memoryToken.expiresAt > Date.now()) {
      return memoryToken.token;
    }

    try {
      if (redis) {
        const cached = await redis.get<string>(REDIS_TOKEN_KEY);
        if (cached && typeof cached === 'string') {
          memoryToken = {
            token: cached,
            expiresAt: Date.now() + TOKEN_TTL_SECONDS * 1000,
          };
          return cached;
        }
      }
    } catch (rErr) {
      console.warn('[ShiprocketAdapter] Redis token fetch note:', rErr);
    }
  }

  // Single-flight refresh so parallel worker jobs do not log in twice simultaneously
  if (!singleFlightLoginPromise) {
    singleFlightLoginPromise = fetchFreshToken(orderId).finally(() => {
      singleFlightLoginPromise = null;
    });
  }

  return singleFlightLoginPromise;
}

export async function clearShiprocketTokenCache() {
  memoryToken = null;
  try {
    if (redis) {
      await redis.del(REDIS_TOKEN_KEY);
    }
  } catch {}
}

export class ShiprocketAdapter {
  static async createOrder(payload: ShiprocketCreateOrderPayload): Promise<ShippingProviderResult> {
    const isDryRun =
      process.env.SHIPROCKET_DRY_RUN === 'true' ||
      process.env.DRY_RUN_SHIPPING === 'true';

    // ── Input Validation ──
    const cleanPincode = (payload.shippingAddress?.pincode || '').replace(/\D/g, '');
    if (!/^\d{6}$/.test(cleanPincode)) {
      throw new Error(`INVALID_SHIPPING_DETAILS: PIN code must be exactly 6 digits. Got: "${payload.shippingAddress?.pincode}"`);
    }

    let cleanPhone = (payload.customerPhone || '').replace(/\D/g, '');
    if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
      cleanPhone = cleanPhone.slice(2);
    }
    if (cleanPhone.length !== 10) {
      throw new Error(`INVALID_SHIPPING_DETAILS: Phone must be 10 digits for Indian shipping. Got: "${payload.customerPhone}"`);
    }

    // ── Weight & Dimensions Calculation (Sane defaults: kids 0.4 kg, women 0.6 kg, 20x15x5 cm) ──
    const hasKidsItem = payload.items.some(
      (item) =>
        item.category?.toLowerCase().includes('kid') ||
        item.slug?.toLowerCase().includes('kid') ||
        item.name?.toLowerCase().includes('kid')
    );
    const weightKg = hasKidsItem ? 0.4 : 0.6;
    const lengthCm = 20;
    const breadthCm = 15;
    const heightCm = 5;

    const isCod = payload.paymentType === 'cod';
    if (isCod && (payload.remainingAmount === undefined || payload.remainingAmount === null || Number.isNaN(payload.remainingAmount))) {
      throw new Error(`CRITICAL: remainingAmount is invalid (${payload.remainingAmount}) for COD order ${payload.orderNumber}. Halting to prevent double-charge.`);
    }

    const targetCollectAmount = isCod ? payload.remainingAmount : payload.total;
    const diffPaise = payload.subtotal - targetCollectAmount;

    let discountRupees = 0;
    let shippingChargesRupees = 0;

    if (diffPaise > 0) {
      discountRupees = Math.round(diffPaise / 100);
    } else if (diffPaise < 0) {
      shippingChargesRupees = Math.round(Math.abs(diffPaise) / 100);
    }

    const shiprocketPayload = {
      order_id: payload.orderNumber,
      order_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary',
      billing_customer_name: payload.customerName,
      billing_last_name: '',
      billing_address: payload.shippingAddress.line1,
      billing_address_2: payload.shippingAddress.line2 || '',
      billing_city: payload.shippingAddress.city,
      billing_pincode: cleanPincode,
      billing_state: payload.shippingAddress.state,
      billing_country: 'India',
      billing_email: payload.customerEmail,
      billing_phone: cleanPhone,
      shipping_is_billing: true,
      order_items: payload.items.map((i) => ({
        name: i.name,
        sku: i.slug || i.name.slice(0, 30),
        units: i.quantity,
        selling_price: Math.round(i.price / 100),
      })),
      payment_method: isCod ? 'COD' : 'Prepaid',
      sub_total: Math.round(payload.subtotal / 100),
      discount: discountRupees,
      shipping_charges: shippingChargesRupees,
      length: lengthCm,
      breadth: breadthCm,
      height: heightCm,
      weight: weightKg,
    };

    // ── Dry Run Handling ──
    if (isDryRun) {
      console.log(`[ShiprocketAdapter] DRY_RUN active. Order payload prepared:`, {
        ...shiprocketPayload,
        billing_phone: '******' + cleanPhone.slice(-4),
        billing_address: '*** REDACTED ***',
        billing_address_2: '*** REDACTED ***',
      });

      const mockAwb = `SR-DRY-${payload.orderNumber}`;
      const mockShipmentId = `DRY-${payload.orderNumber}`;
      const mockTrackingUrl = `https://shiprocket.co/tracking/${mockAwb}`;

      // Mirror dry run status to Firestore order_status
      try {
        await firestoreService.setDoc('order_status', payload.orderId, {
          order_id: payload.orderId,
          order_number: payload.orderNumber,
          shiprocket_order_id: mockShipmentId,
          shipment_id: mockShipmentId,
          awb: mockAwb,
          courier_name: 'Delhivery Surface (Dry Run)',
          tracking_url: mockTrackingUrl,
          status: 'shipped',
          is_dry_run: true,
          updated_at: new Date().toISOString(),
        }, { merge: true });
      } catch (fsErr) {
        console.warn('[ShiprocketAdapter] Firestore mirror note (dry run):', fsErr);
      }

      return {
        provider: 'shiprocket',
        shipmentId: mockShipmentId,
        awbCode: mockAwb,
        courierName: 'Delhivery Surface (Dry Run)',
        trackingUrl: mockTrackingUrl,
        labelUrl: `https://shiprocket.co/label/${mockAwb}`,
        rawResponse: { status: 'dry_run_success', dryRun: true },
      };
    }

    if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) {
      console.warn('[ShiprocketAdapter] Shiprocket credentials missing. Falling back to mock creation.');
      const mockAwb = `SR-MOCK-${payload.orderNumber}`;
      return {
        provider: 'shiprocket',
        shipmentId: `SR-${payload.orderNumber}`,
        awbCode: mockAwb,
        courierName: 'Delhivery Surface',
        trackingUrl: `https://shiprocket.co/tracking/${mockAwb}`,
        labelUrl: `https://shiprocket.co/label/${mockAwb}`,
        rawResponse: { status: 'mock_shiprocket_created' },
      };
    }

    // ── Live Creation with 401 Self-Healing Token Refresh ──
    let token = await getShiprocketToken(payload.orderNumber);

    let createRes = await callShiprocketApi({
      endpoint: 'orders/create/adhoc',
      url: `${SHIPROCKET_API_URL}/orders/create/adhoc`,
      options: {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shiprocketPayload),
      },
      orderId: payload.orderNumber,
      requestPayload: shiprocketPayload,
    });

    // If 401 Unauthorized, clear token and retry once with fresh token
    if (createRes.status === 401) {
      console.warn('[ShiprocketAdapter] Token expired (401). Refreshing token and retrying createOrder...');
      await clearShiprocketTokenCache();
      token = await getShiprocketToken(payload.orderNumber, true);

      createRes = await callShiprocketApi({
        endpoint: 'orders/create/adhoc',
        url: `${SHIPROCKET_API_URL}/orders/create/adhoc`,
        options: {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(shiprocketPayload),
        },
        orderId: payload.orderNumber,
        requestPayload: shiprocketPayload,
      });
    }

    if (!createRes.ok || !createRes.data.order_id) {
      throw new Error(`SHIPROCKET_CREATE_ORDER_FAILED: ${createRes.data.message || JSON.stringify(createRes.data)}`);
    }

    const shiprocketOrderId = createRes.data.order_id;
    const shipmentId = String(createRes.data.shipment_id || shiprocketOrderId);

    // 2. Generate AWB
    let awbCode = '';
    let courierName = 'Standard Shipping';

    const awbPayload = { shipment_id: shipmentId };
    const awbRes = await callShiprocketApi({
      endpoint: 'courier/assign/awb',
      url: `${SHIPROCKET_API_URL}/courier/assign/awb`,
      options: {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(awbPayload),
      },
      orderId: payload.orderNumber,
      requestPayload: awbPayload,
    });

    if (awbRes.ok && awbRes.data.response?.data?.awb_code) {
      awbCode = awbRes.data.response.data.awb_code;
      courierName = awbRes.data.response.data.courier_name || courierName;
    } else {
      console.warn(`[ShiprocketAdapter] AWB assignment deferred for order ${payload.orderNumber}: ${JSON.stringify(awbRes.data)}`);
    }

    // 3. Generate Label
    let labelUrl = '';
    const labelPayload = { shipment_id: [shipmentId] };
    const labelRes = await callShiprocketApi({
      endpoint: 'courier/generate/label',
      url: `${SHIPROCKET_API_URL}/courier/generate/label`,
      options: {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(labelPayload),
      },
      orderId: payload.orderNumber,
      requestPayload: labelPayload,
    });

    if (labelRes.ok && labelRes.data.label_url) {
      labelUrl = labelRes.data.label_url;
    }

    // 4. Request Pickup
    const pickupPayload = { shipment_id: [shipmentId] };
    await callShiprocketApi({
      endpoint: 'orders/show/fulfillment/pickup',
      url: `${SHIPROCKET_API_URL}/orders/show/fulfillment/pickup`,
      options: {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pickupPayload),
      },
      orderId: payload.orderNumber,
      requestPayload: pickupPayload,
    });

    // 5. Query Shiprocket Track API for official tracking URL if present
    let trackingUrl = awbCode
      ? `https://shiprocket.co/tracking/${awbCode}`
      : `https://shiprocket.co/tracking/${shiprocketOrderId}`;

    if (awbCode) {
      try {
        const trackRes = await callShiprocketApi({
          endpoint: `courier/track/awb/${awbCode}`,
          url: `${SHIPROCKET_API_URL}/courier/track/awb/${awbCode}`,
          options: {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          },
          orderId: payload.orderNumber,
        });
        if (trackRes.ok && trackRes.data?.tracking_data?.track_url) {
          trackingUrl = trackRes.data.tracking_data.track_url;
        }
      } catch (trackErr) {
        console.warn('[ShiprocketAdapter] Track API query note (using fallback):', trackErr);
      }
    }

    // 6. Mirror to Firestore order_status (and order_tracking)
    try {
      await firestoreService.setDoc('order_status', payload.orderId, {
        order_id: payload.orderId,
        order_number: payload.orderNumber,
        shiprocket_order_id: String(shiprocketOrderId),
        shipment_id: String(shipmentId),
        awb: awbCode,
        courier_name: courierName,
        tracking_url: trackingUrl,
        label_url: labelUrl || null,
        status: 'shipped',
        updated_at: new Date().toISOString(),
      }, { merge: true });
    } catch (fsErr) {
      console.warn('[ShiprocketAdapter] Firestore mirror note on shipment creation:', fsErr);
    }

    await writeAuditLog({
      orderId: payload.orderId,
      action: 'SHIPROCKET_ORDER_CREATED',
      details: {
        shiprocketOrderId,
        shipmentId,
        awbCode,
        courierName,
        trackingUrl,
        collectibleAmountRupees: Math.round(targetCollectAmount / 100),
        discountSent: discountRupees,
        shippingChargesSent: shippingChargesRupees,
      },
    });

    return {
      provider: 'shiprocket',
      shipmentId: String(shipmentId),
      awbCode: awbCode || String(shipmentId),
      courierName,
      trackingUrl,
      labelUrl: labelUrl || undefined,
      rawResponse: createRes.data,
    };
  }

  static async cancelOrder(shiprocketOrderId: string): Promise<{ success: boolean; error?: string }> {
    if (process.env.SHIPROCKET_DRY_RUN === 'true' || process.env.DRY_RUN_SHIPPING === 'true') {
      console.log(`[ShiprocketAdapter] DRY_RUN active — simulating cancellation of Shiprocket order ${shiprocketOrderId}`);
      return { success: true };
    }

    if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) {
      return { success: true };
    }

    try {
      const token = await getShiprocketToken();
      const cancelPayload = { ids: [shiprocketOrderId] };

      const { ok, data } = await callShiprocketApi<{ message?: string; status?: number }>({
        endpoint: 'orders/cancel',
        url: `${SHIPROCKET_API_URL}/orders/cancel`,
        options: {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cancelPayload),
        },
        requestPayload: cancelPayload,
      });

      if (!ok) {
        return { success: false, error: data?.message || JSON.stringify(data) };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || String(err) };
    }
  }
}
