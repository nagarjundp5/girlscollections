import { siteConfig } from '@/lib/siteConfig';
import { PolicyDocument } from './types';

export const termsAndConditions: PolicyDocument = {
  slug: 'terms-and-conditions',
  title: 'Terms & Conditions',
  subtitle: 'Simple, transparent rules for shopping at The Girls Collections',
  lastUpdated: 'November 26, 2026',
  intro: [
    `Welcome to The Girls Collections (thegirlscollections.com). By browsing or placing an order on our website, you agree to these Terms & Conditions.`,
    `These terms apply to all online orders and visits to our flagship boutique at ${siteConfig.address}.`,
  ],
  clauses: [
    {
      id: 'order-confirmation',
      number: '1',
      title: 'Order Confirmation & Pricing',
      paragraphs: [
        'All prices are listed in Indian Rupees (INR) and include applicable taxes.',
        'Once you place an order, we send an order confirmation email to your registered email address with your Order ID and item details.',
        'All orders are subject to stock availability. If an item becomes unavailable after you order, we will contact you promptly and issue a full refund.',
      ],
    },
    {
      id: 'payments-cod-prepaid',
      number: '2',
      title: 'Payments: Prepaid & Cash on Delivery (COD)',
      paragraphs: [
        'Prepaid Orders: You pay the full order amount online via Razorpay (UPI, Credit Card, Debit Card, or Net Banking).',
        `Cash on Delivery (COD): A fixed ₹${siteConfig.codAdvance} advance must be paid online at checkout to confirm your order. The remaining balance is paid to the Shiprocket delivery agent when your parcel arrives.`,
        `The ₹${siteConfig.codAdvance} COD advance is adjusted against your total bill. However, if you cancel after dispatch or refuse delivery, the ₹${siteConfig.codAdvance} advance is non-refundable.`,
      ],
    },
    {
      id: 'shipping-and-offers',
      number: '3',
      title: 'Shipping, Free Delivery & First-Order Offer',
      paragraphs: [
        `Free Shipping: Orders above ₹${siteConfig.freeShippingThreshold} qualify for free shipping across India.`,
        'First-Order Offer: New customers get free delivery plus 10% off on their first order, valid for both COD and Prepaid orders.',
        'Delivery is fulfilled via Shiprocket. Once dispatched, your AWB tracking link is emailed to you and shown in your account profile.',
      ],
    },
    {
      id: 'cancellations',
      number: '4',
      title: 'Order Cancellations',
      paragraphs: [
        `You may cancel your order before it is dispatched by emailing ${siteConfig.email} or calling +91 ${siteConfig.phone} with your Order ID.`,
        'Approved pre-dispatch cancellations are recorded in our system for a manual refund.',
        'Orders cannot be cancelled once handed over to the courier. For COD orders cancelled after dispatch, the ₹200 advance is non-refundable.',
      ],
    },
    {
      id: 'returns-no-reverse-pickup',
      number: '5',
      title: 'Returns & Exchanges (No Reverse Pickup)',
      paragraphs: [
        'We do NOT offer automatic reverse pickup. There is no online return or exchange button.',
        `To request a return or exchange within ${siteConfig.returnWindowDays} days of delivery, you MUST first email ${siteConfig.email} (with your Order ID, photos, and issue) OR call +91 ${siteConfig.phone}.`,
        'Returns and exchanges are accepted and processed only after you contact us and our team confirms your request.',
        'Items must be unused, unwashed, and returned with all original tags and packaging. Refunds are issued manually after the returned item passes our quality check. Shipping charges and payment gateway fees are non-refundable.',
      ],
    },
    {
      id: 'colours-and-sizes',
      number: '6',
      title: 'Product Colours & Sizing',
      paragraphs: [
        'We photograph every garment carefully in natural lighting. However, actual product colours may vary slightly from photos due to screen brightness and photography lighting.',
        'Please check the Size Guide on each product page before ordering. Minor handcrafted variations in embroidery or weave are part of authentic ethnic wear.',
      ],
    },
    {
      id: 'payment-security',
      number: '7',
      title: 'Payment Security',
      paragraphs: [
        'All online payments are processed securely through Razorpay using encrypted PCI-DSS compliant checkout.',
        'We never store your card numbers, CVV, or UPI PIN on our servers.',
      ],
    },
    {
      id: 'grievance-and-law',
      number: '8',
      title: 'Grievance Contact & Governing Law',
      paragraphs: [
        `For any order issue, complaint, or grievance, please contact us: Email ${siteConfig.email} | Phone +91 ${siteConfig.phone}.`,
        `Store Hours: ${siteConfig.hours}.`,
        'These terms are governed by the laws of India. Any disputes are subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka.',
      ],
    },
  ],
};

export default termsAndConditions;
