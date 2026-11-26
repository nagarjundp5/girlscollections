import { siteConfig } from '@/lib/siteConfig';
import { PolicyDocument } from './types';

export const returnsAndExchange: PolicyDocument = {
  slug: 'returns-and-exchange',
  title: 'Returns & Exchange Policy',
  subtitle: 'Clear, step-by-step guidelines for returns, exchanges & refunds',
  lastUpdated: 'November 26, 2026',
  intro: [
    `We want you to love every outfit from The Girls Collections. Please read our simple return and exchange rules below before ordering.`,
  ],
  clauses: [
    {
      id: 'no-reverse-pickup',
      number: '1',
      title: 'No Reverse Pickup — Contact Us First',
      paragraphs: [
        'We do NOT provide reverse pickup.',
        `For any return or exchange, you MUST first email ${siteConfig.email} (with your Order ID, clear photos, and the issue) OR call us on +91 ${siteConfig.phone}.`,
        'Returns and exchanges are accepted ONLY after you contact us this way and receive confirmation from our team.',
      ],
    },
    {
      id: 'no-online-exchange-button',
      number: '2',
      title: 'How Exchanges Work',
      paragraphs: [
        'There is no automatic or online exchange button on the website.',
        'An exchange is processed only after you email or call us and our team confirms availability and approval.',
        `You may also visit our Gandhi Bazaar boutique (${siteConfig.address}) for in-person exchanges, subject to store stock.`,
      ],
    },
    {
      id: 'return-window',
      number: '3',
      title: `${siteConfig.returnWindowDays}-Day Return Window`,
      paragraphs: [
        `You must contact us within ${siteConfig.returnWindowDays} days from the date of delivery.`,
        `Requests sent after ${siteConfig.returnWindowDays} days from delivery cannot be accepted.`,
      ],
    },
    {
      id: 'item-condition',
      number: '4',
      title: 'Item Condition Requirements',
      paragraphs: [
        'To qualify for a return or exchange, your item must meet all of these rules:',
      ],
      bullets: [
        'Unused & unwashed: No wear, stains, perfume, or alterations.',
        'Original tags attached: All price tags, labels, and barcodes must be intact.',
        'Original packaging: Include the garment cover, pouch, and all pieces of a set.',
      ],
    },
    {
      id: 'refunds-and-fees',
      number: '5',
      title: 'Manual Refunds After Quality Check',
      paragraphs: [
        'Once we receive your returned item, our team inspects it for condition and tags.',
        'Refunds are issued manually to your original payment method or bank account only after the item passes our quality check.',
        'Shipping charges and payment gateway fees are non-refundable.',
        `For Cash on Delivery (COD) orders cancelled after dispatch, the ₹${siteConfig.codAdvance} advance is non-refundable.`,
      ],
    },
    {
      id: 'cancellations-before-dispatch',
      number: '6',
      title: 'Cancellations Before Dispatch',
      paragraphs: [
        `Need to cancel before we ship? Email ${siteConfig.email} or call +91 ${siteConfig.phone} right away with your Order ID.`,
        'Approved pre-dispatch cancellations are queued in our admin system for a manual refund.',
      ],
    },
    {
      id: 'contact-help',
      number: '7',
      title: 'Contact Us for Returns & Exchanges',
      paragraphs: [
        `Email: ${siteConfig.email} (include Order ID, photos, and issue)`,
        `Phone: +91 ${siteConfig.phone}`,
        `Boutique Hours: ${siteConfig.hours}`,
      ],
    },
  ],
};

export default returnsAndExchange;
