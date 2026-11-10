import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { ShiprocketAdapter } from '../src/lib/orchestration/providers/shiprocket-adapter';

async function main() {
  console.log('\n--- [Shiprocket Dry Run Test] ---');
  console.log(`SHIPROCKET_DRY_RUN: ${process.env.SHIPROCKET_DRY_RUN}`);

  const sampleOrder = {
    orderId: '00000000-0000-0000-0000-000000000001',
    orderNumber: 'TGC-TEST-1001',
    customerName: 'Priya Sharma',
    customerEmail: 'priya@example.com',
    customerPhone: '+919876543210',
    shippingAddress: {
      line1: '123 MG Road, Indiranagar',
      line2: 'Near Metro Station',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
    },
    items: [
      { name: 'Anarkali Kurta Set', quantity: 1, price: 249900, slug: 'anarkali-kurta-set', category: 'Kurta Sets' },
    ],
    subtotal: 249900,
    total: 249900,
    paymentType: 'prepaid' as const,
    remainingAmount: 0,
  };

  const result = await ShiprocketAdapter.createOrder(sampleOrder);
  console.log('\n✅ Dry Run Result:');
  console.log('   Provider    :', result.provider);
  console.log('   Shipment ID :', result.shipmentId);
  console.log('   AWB Code    :', result.awbCode);
  console.log('   Courier Name:', result.courierName);
  console.log('   Tracking URL:', result.trackingUrl);
  console.log('\nDry run succeeded without spending wallet money or creating real courier shipment.\n');
}

main().catch(console.error);

