import { siteConfig } from '@/lib/siteConfig';
import { PolicyDocument } from './types';

export const shippingAndDelivery: PolicyDocument = {
  slug: 'shipping-and-delivery',
  title: 'Shipping & Delivery Policy',
  subtitle: 'Pan-India delivery via Shiprocket, shipping charges & COD rules',
  lastUpdated: 'November 26, 2026',
  intro: [
    `We ship across India via Shiprocket from our flagship boutique in Gandhi Bazaar, Basavanagudi, Bengaluru.`,
  ],
  clauses: [
    {
      id: 'shipping-charges',
      number: '1',
      title: 'Free Shipping & First-Order Offer',
      paragraphs: [
        `Free Shipping: Orders above ₹${siteConfig.freeShippingThreshold} qualify for free shipping across India.`,
        `First-Order Offer: New customers enjoy free delivery plus 10% off on their first order — valid for both COD and Prepaid orders.`,
        `Orders below ₹${siteConfig.freeShippingThreshold} (when not using the first-order offer) carry a flat ₹99 shipping fee.`,
      ],
    },
    {
      id: 'dispatch-and-delivery',
      number: '2',
      title: 'Dispatch & Delivery Timelines',
      paragraphs: [
        `Dispatch Time: Ready-to-wear orders are checked, packed, and dispatched within ${siteConfig.dispatchDays} (Monday to Saturday).`,
        `Delivery Time: Typical delivery takes ${siteConfig.deliveryDays} depending on your PIN code:`,
      ],
      bullets: [
        'Bengaluru & Karnataka: 1–3 business days.',
        'South Indian Metros: 2–4 business days.',
        'Other Metros (Mumbai, Delhi-NCR, Kolkata, Pune): 3–5 business days.',
        'Rest of India: 4–7 business days.',
      ],
    },
    {
      id: 'shiprocket-tracking',
      number: '3',
      title: 'Tracking Your Order (Shiprocket AWB)',
      paragraphs: [
        'All deliveries are handled through Shiprocket courier partners.',
        'Once your order ships, we email you your AWB number, courier name, and live tracking link.',
        'You can also view your AWB tracking link anytime in your Account Profile under My Orders, or on our Track Order page.',
      ],
    },
    {
      id: 'cod-delivery-rules',
      number: '4',
      title: 'Cash on Delivery (COD) Delivery Rules',
      paragraphs: [
        `For COD orders, a fixed ₹${siteConfig.codAdvance} advance is paid online at checkout to confirm your order.`,
        'The remaining balance is paid directly to the Shiprocket delivery agent at delivery.',
        `The ₹${siteConfig.codAdvance} advance is non-refundable if the order is cancelled after dispatch or refused at the doorstep.`,
      ],
    },
    {
      id: 'contact-shipping',
      number: '5',
      title: 'Need Help with Your Delivery?',
      paragraphs: [
        `Email: ${siteConfig.email}`,
        `Phone: +91 ${siteConfig.phone}`,
        `Address: ${siteConfig.address}`,
        `Hours: ${siteConfig.hours}`,
      ],
    },
  ],
};

export default shippingAndDelivery;
