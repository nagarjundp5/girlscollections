import * as React from 'react';
import { siteConfig } from '@/lib/siteConfig';
import { getSizeLabel } from '@/data/masterSizes';

export interface OrderConfirmationEmailProps {
  orderNumber: string;
  orderDate?: string;
  customerName: string;
  customerPhone?: string | null;
  items: Array<{ name: string; size: string; quantity: number; price: number; image?: string }>;
  totalPaise: number;
  shippingChargePaise: number;
  discountAmountPaise: number;
  fulfillmentType: string;
  pickupCode: string | null;
  shippingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  } | null;
  paymentMode?: 'prepaid' | 'cod';
  advancePaid?: number;
  codBalance?: number;
  awb?: string;
  courierName?: string;
}

export function OrderConfirmationEmail({
  orderNumber,
  orderDate,
  customerName,
  customerPhone,
  items,
  totalPaise,
  shippingChargePaise,
  discountAmountPaise,
  fulfillmentType,
  pickupCode,
  shippingAddress,
  paymentMode = 'prepaid',
  advancePaid = 0,
  codBalance = 0,
  awb,
  courierName,
}: OrderConfirmationEmailProps) {
  const isPickup = fulfillmentType === 'pickup' || fulfillmentType === 'store_pickup';
  const isCod = paymentMode === 'cod';
  const totalRupees = (totalPaise / 100).toFixed(2);
  const shippingRupees = (shippingChargePaise / 100).toFixed(2);
  const discountRupees = (discountAmountPaise / 100).toFixed(2);
  const subtotalPaise = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const subtotalRupees = (subtotalPaise / 100).toFixed(2);
  const paidOnlineRupees = ((isCod ? (advancePaid || 20000) : totalPaise) / 100).toFixed(2);
  const codBalanceRupees = ((isCod ? (codBalance || Math.max(0, totalPaise - (advancePaid || 20000))) : 0) / 100).toFixed(2);
  const formattedDate =
    orderDate ||
    new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/thegirlscollections';

  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        backgroundColor: '#FAF6EE',
        fontFamily: "'Nunito Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
        color: '#1A1A2E',
      }}
    >
      <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#FAF6EE', padding: '24px 12px' }}>
        <tr>
          <td align="center">
            <table
              width="600"
              cellPadding="0"
              cellSpacing="0"
              style={{
                maxWidth: '600px',
                width: '100%',
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                overflow: 'hidden',
                border: '1px solid #E8DCC8',
              }}
            >
              {/* Brand Header */}
              <tr>
                <td
                  style={{
                    backgroundColor: '#1A1E3A',
                    padding: '24px 28px',
                    textAlign: 'center',
                  }}
                >
                  <img
                    src="https://www.thegirlscollections.com/logo.png?v=3"
                    alt="The Girls Collections"
                    width="120"
                    style={{ display: 'inline-block', border: 'none', outline: 'none' }}
                  />
                  <p
                    style={{
                      margin: '8px 0 0',
                      fontSize: '11px',
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      color: '#D4B878',
                    }}
                  >
                    Order Confirmation &amp; Tax Invoice
                  </p>
                </td>
              </tr>

              {/* Order Meta */}
              <tr>
                <td style={{ padding: '28px 28px 16px' }}>
                  <h1 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: 700, color: '#1A1E3A' }}>
                    Thank you, {customerName}!
                  </h1>
                  <p style={{ margin: '0 0 18px', fontSize: '14px', color: '#4A4A5A', lineHeight: 1.6 }}>
                    Your order <strong style={{ color: '#1A1E3A' }}>{orderNumber}</strong> placed on{' '}
                    <strong>{formattedDate}</strong> is confirmed.
                  </p>

                  {/* Customer & Shipping Box */}
                  <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: '22px' }}>
                    <tr>
                      <td
                        style={{
                          backgroundColor: '#FAF6EE',
                          border: '1px solid #E8DCC8',
                          borderRadius: '10px',
                          padding: '16px 18px',
                        }}
                      >
                        {isPickup ? (
                          <div>
                            <p style={{ margin: '0 0 4px', fontSize: '11px', letterSpacing: '1.4px', textTransform: 'uppercase', color: '#6B6B7B', fontWeight: 700 }}>
                              In-Store Pickup Code
                            </p>
                            <p style={{ margin: '0 0 10px', fontSize: '24px', fontWeight: 800, color: '#1A1E3A', letterSpacing: '3px' }}>
                              {pickupCode}
                            </p>
                            <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6, color: '#1A1A2E' }}>
                              <strong>Boutique:</strong> {siteConfig.legalName}, {siteConfig.address}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p style={{ margin: '0 0 6px', fontSize: '11px', letterSpacing: '1.4px', textTransform: 'uppercase', color: '#6B6B7B', fontWeight: 700 }}>
                              Shipping Details
                            </p>
                            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: '#1A1A2E' }}>
                              <strong>{customerName}</strong>
                              {customerPhone ? ` • ${customerPhone}` : ''}
                              <br />
                              {shippingAddress?.line1}
                              {shippingAddress?.line2 ? `, ${shippingAddress.line2}` : ''}
                              <br />
                              {shippingAddress?.city}, {shippingAddress?.state} – {shippingAddress?.pincode}
                            </p>
                          </div>
                        )}

                        {awb && (
                          <p style={{ margin: '10px 0 0', fontSize: '13px', color: '#1A1E3A' }}>
                            <strong>Courier:</strong> {courierName || 'Shiprocket'} • <strong>AWB:</strong> {awb}
                          </p>
                        )}
                      </td>
                    </tr>
                  </table>

                  {/* Itemized Table */}
                  <p style={{ margin: '0 0 10px', fontSize: '11px', letterSpacing: '1.6px', textTransform: 'uppercase', color: '#6B6B7B', fontWeight: 700, borderBottom: '1px solid #EAE5DE', paddingBottom: '6px' }}>
                    Order Items
                  </p>
                  <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: '20px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #EAE5DE', fontSize: '11px', color: '#6B6B7B', textTransform: 'uppercase' }}>
                        <th align="left" style={{ padding: '6px 0' }}>Item</th>
                        <th align="center" style={{ padding: '6px 8px' }}>Size</th>
                        <th align="center" style={{ padding: '6px 8px' }}>Qty</th>
                        <th align="right" style={{ padding: '6px 0' }}>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #F3EFE8' }}>
                          <td style={{ padding: '10px 0', fontSize: '14px', color: '#1A1A2E' }}>
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                width="36"
                                height="44"
                                style={{ verticalAlign: 'middle', borderRadius: '4px', marginRight: '8px', objectFit: 'cover' }}
                              />
                            )}
                            <span>{item.name}</span>
                          </td>
                          <td align="center" style={{ padding: '10px 8px', fontSize: '13px', color: '#4A4A5A' }}>
                            {getSizeLabel(item.size)}
                          </td>
                          <td align="center" style={{ padding: '10px 8px', fontSize: '13px', color: '#4A4A5A' }}>
                            {item.quantity}
                          </td>
                          <td align="right" style={{ padding: '10px 0', fontSize: '14px', fontWeight: 700, color: '#1A1E3A' }}>
                            ₹{((item.price * item.quantity) / 100).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Totals & Payment Breakdown */}
                  <table width="100%" cellPadding="0" cellSpacing="0" style={{ borderTop: '1px solid #E8DCC8', paddingTop: '12px' }}>
                    <tr>
                      <td style={{ padding: '5px 0', fontSize: '14px', color: '#4A4A5A' }}>Subtotal</td>
                      <td align="right" style={{ padding: '5px 0', fontSize: '14px', color: '#1A1A2E' }}>₹{subtotalRupees}</td>
                    </tr>
                    {discountAmountPaise > 0 && (
                      <tr>
                        <td style={{ padding: '5px 0', fontSize: '14px', color: '#0F766E' }}>Discount (10% First Order / Promo)</td>
                        <td align="right" style={{ padding: '5px 0', fontSize: '14px', color: '#0F766E', fontWeight: 600 }}>-₹{discountRupees}</td>
                      </tr>
                    )}
                    <tr>
                      <td style={{ padding: '5px 0', fontSize: '14px', color: '#4A4A5A' }}>Shipping</td>
                      <td align="right" style={{ padding: '5px 0', fontSize: '14px', color: '#1A1A2E' }}>
                        {shippingChargePaise > 0 ? `₹${shippingRupees}` : 'FREE'}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '10px 0 6px', fontSize: '16px', fontWeight: 700, color: '#1A1E3A', borderTop: '1px solid #EAE5DE' }}>
                        Order Total
                      </td>
                      <td align="right" style={{ padding: '10px 0 6px', fontSize: '18px', fontWeight: 800, color: '#1A1E3A', borderTop: '1px solid #EAE5DE' }}>
                        ₹{totalRupees}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '4px 0', fontSize: '13px', color: '#4A4A5A' }}>Payment Mode</td>
                      <td align="right" style={{ padding: '4px 0', fontSize: '13px', fontWeight: 700, color: '#1A1E3A' }}>
                        {isCod ? 'Cash on Delivery (COD)' : 'Prepaid (Razorpay)'}
                      </td>
                    </tr>
                    {isCod && (
                      <>
                        <tr>
                          <td style={{ padding: '4px 0', fontSize: '13px', color: '#0F766E', fontWeight: 600 }}>Paid online</td>
                          <td align="right" style={{ padding: '4px 0', fontSize: '13px', color: '#0F766E', fontWeight: 700 }}>
                            ₹{paidOnlineRupees}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: '4px 0', fontSize: '13px', color: '#B45309', fontWeight: 600 }}>To pay on delivery</td>
                          <td align="right" style={{ padding: '4px 0', fontSize: '13px', color: '#B45309', fontWeight: 700 }}>
                            ₹{codBalanceRupees}
                          </td>
                        </tr>
                      </>
                    )}
                  </table>

                  {/* Delivery & Return Note */}
                  <div
                    style={{
                      marginTop: '20px',
                      padding: '14px 16px',
                      backgroundColor: '#FAF6EE',
                      border: '1px solid #E8DCC8',
                      borderRadius: '10px',
                      fontSize: '13px',
                      lineHeight: 1.6,
                      color: '#1A1A2E',
                    }}
                  >
                    <p style={{ margin: '0 0 6px' }}>
                      <strong>Expected Delivery:</strong> Dispatched in {siteConfig.dispatchDays}; delivered in{' '}
                      {siteConfig.deliveryDays} via Shiprocket. Your AWB tracking link will follow once shipped.
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>Returns &amp; Exchanges:</strong> No reverse pickup. Please email{' '}
                      <a href={`mailto:${siteConfig.email}`} style={{ color: '#1A1E3A', fontWeight: 600 }}>{siteConfig.email}</a>{' '}
                      or call{' '}
                      <a href={`tel:${siteConfig.telLink}`} style={{ color: '#1A1E3A', fontWeight: 600 }}>+91 {siteConfig.phone}</a>{' '}
                      within {siteConfig.returnWindowDays} days of delivery before sending any item back.
                    </p>
                  </div>
                </td>
              </tr>

              {/* Footer */}
              <tr>
                <td
                  style={{
                    backgroundColor: '#FCFAF8',
                    padding: '20px 28px',
                    borderTop: '1px solid #EAE5DE',
                    fontSize: '12px',
                    color: '#4A4A5A',
                    lineHeight: 1.6,
                  }}
                >
                  <p style={{ margin: '0 0 6px' }}>
                    <strong>{siteConfig.legalName}</strong> • {siteConfig.address}
                  </p>
                  <p style={{ margin: '0 0 6px' }}>
                    Email:{' '}
                    <a href={`mailto:${siteConfig.email}`} style={{ color: '#1A1E3A' }}>{siteConfig.email}</a>{' '}
                    | Phone:{' '}
                    <a href={`tel:${siteConfig.telLink}`} style={{ color: '#1A1E3A' }}>+91 {siteConfig.phone}</a>
                  </p>
                  <p style={{ margin: 0 }}>
                    Follow us on Instagram:{' '}
                    <a href={instagramUrl} style={{ color: '#E0527F', fontWeight: 700, textDecoration: 'none' }}>
                      @thegirlscollections
                    </a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  );
}
