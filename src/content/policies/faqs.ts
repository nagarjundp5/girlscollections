import { siteConfig } from '@/lib/siteConfig';

export interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export const faqsData: {
  lastUpdated: string;
  categories: Array<{
    name: string;
    items: FAQItem[];
  }>;
} = {
  lastUpdated: 'November 2026',
  categories: [
    {
      name: 'Orders & Payments',
      items: [
        {
          question: 'What payment methods do you accept?',
          answer:
            'We accept all major payment methods via Razorpay: UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards (Visa, MasterCard, RuPay, Amex), Net Banking across 50+ banks, and Cash on Delivery (COD).',
          category: 'Orders & Payments',
        },
        {
          question: `Why is an advance payment of ₹${siteConfig.codAdvance} required for Cash on Delivery (COD)?`,
          answer:
            `To confirm your order and prevent fraudulent bookings, COD orders require a ₹${siteConfig.codAdvance} advance paid online at checkout. This ₹${siteConfig.codAdvance} is completely adjusted against your order total, and you only pay the remaining balance to the courier upon delivery.`,
          category: 'Orders & Payments',
        },
        {
          question: 'Can I use personal coupon codes?',
          answer:
            'Yes! You can apply eligible promotional coupons (such as our 10% first-order discount FESTIVE10) directly in the checkout summary. Note that personal promo codes cannot be shared on third-party voucher sites.',
          category: 'Orders & Payments',
        },
        {
          question: 'How do I cancel my order?',
          answer:
            `You can cancel an order any time before it is dispatched by contacting us at ${siteConfig.email} or WhatsApp at +91 ${siteConfig.phone}. Once dispatched, orders cannot be cancelled in transit.`,
          category: 'Orders & Payments',
        },
      ],
    },
    {
      name: 'Shipping & Delivery',
      items: [
        {
          question: 'How long does dispatch and delivery take?',
          answer:
            `We dispatch orders within ${siteConfig.dispatchDays}. Delivery across India takes ${siteConfig.deliveryDays} depending on your location (1–3 days in Karnataka and South metros, 3–7 days nationwide).`,
          category: 'Shipping & Delivery',
        },
        {
          question: 'Do you offer free shipping?',
          answer:
            `Yes! We provide Free Express Shipping across India on all orders valued above ₹${siteConfig.freeShippingThreshold}. For orders below ₹${siteConfig.freeShippingThreshold}, a flat fee of ₹99 is charged.`,
          category: 'Shipping & Delivery',
        },
        {
          question: 'How do I track my order?',
          answer:
            'Once dispatched, an automated tracking SMS and email with your Shiprocket AWB link is sent to you. You can also track your shipment live at any time on our website under Account > Orders or at /track.',
          category: 'Shipping & Delivery',
        },
        {
          question: 'Do you ship to my PIN code?',
          answer:
            'We service over 24,000 PIN codes across all Indian states and Union Territories. You can use the PIN code checker on any product page to check exact delivery estimates.',
          category: 'Shipping & Delivery',
        },
      ],
    },
    {
      name: 'Returns & Exchanges',
      items: [
        {
          question: 'Can I exchange a product purchased online for a different size?',
          answer:
            'Online orders: NO EXCHANGE on any product purchased online. Only our Returns policy applies. If you need a different size, please return the eligible item within 7 days for a refund and place a fresh order.',
          category: 'Returns & Exchanges',
        },
        {
          question: 'What is the return window?',
          answer:
            `Returns are accepted within ${siteConfig.returnWindowDays} days of confirmed delivery for unused, unworn, unwashed items with all original tags attached and packaging intact.`,
          category: 'Returns & Exchanges',
        },
        {
          question: 'Why is an unboxing video required for damaged or wrong items?',
          answer:
            'To protect both parties against fraudulent courier tampering or transit damage claims, a continuous 360-degree unboxing video recorded from the unopened sealed package is mandatory for any defect claims.',
          category: 'Returns & Exchanges',
        },
        {
          question: 'Can I exchange my online order in-store?',
          answer:
            `Yes! You can visit our physical flagship boutique in Gandhi Bazaar, Bengaluru within ${siteConfig.returnWindowDays} days of delivery with your unused, tagged garment and order receipt to exchange for eligible store items.`,
          category: 'Returns & Exchanges',
        },
        {
          question: 'How and when will I receive my refund?',
          answer:
            'Once the return arrives at our Bengaluru warehouse and passes quality inspection, manual refunds are processed by our team to your original payment method (or bank account for COD) within 5–7 business days.',
          category: 'Returns & Exchanges',
        },
      ],
    },
    {
      name: 'Sizing & Custom Fitting',
      items: [
        {
          question: 'How do I find my size?',
          answer:
            'We follow standard Indian garment sizing. Click the "Size Guide" link on any product page to view detailed chest, waist, and length measurements in inches and centimeters.',
          category: 'Sizing & Custom Fitting',
        },
        {
          question: 'What is the complimentary Custom Fitting / Alteration service?',
          answer:
            'We offer complimentary basic alterations (such as waist nipping or minor length adjustments). Simply toggle "Yes (Custom Measurements)" on the product page and message your exact measurements via WhatsApp within 24 hours of placing your order.',
          category: 'Sizing & Custom Fitting',
        },
        {
          question: 'Why does the color look slightly different on my screen?',
          answer:
            'Actual product color may vary slightly due to studio lighting, camera sensors, and your phone or monitor display color settings. We provide detailed descriptions to help guide your choice.',
          category: 'Sizing & Custom Fitting',
        },
      ],
    },
    {
      name: 'Visiting Our Store',
      items: [
        {
          question: 'Where is The Girls Collections physical boutique located?',
          answer:
            `Our store is located at ${siteConfig.address}. We welcome you to experience our fabrics and fits in person!`,
          category: 'Visiting Our Store',
        },
        {
          question: 'What are the store timings?',
          answer:
            `We are open Monday to Saturday from 10:30 AM to 9:00 PM, and Sundays from 11:00 AM to 8:30 PM.`,
          category: 'Visiting Our Store',
        },
      ],
    },
  ],
};

export default faqsData;
