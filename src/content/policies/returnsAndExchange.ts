import { siteConfig } from '@/lib/siteConfig';
import { PolicyDocument } from './types';

export const returnsAndExchange: PolicyDocument = {
  slug: 'returns-and-exchange',
  title: 'Returns & Exchange Policy',
  subtitle: 'Clear, Transparent Return Guidelines for Online & Boutique Purchases',
  lastUpdated: 'November 2026',
  intro: [
    `At The Girls Collections, our dedication is to ensure you and your loved ones receive ethnic garments crafted with exceptional quality and pristine craftsmanship. To maintain transparent operational standards and prevent hygiene/damage disputes, please review our official return and exchange conditions before completing your purchase.`,
  ],
  clauses: [
    {
      id: 'no-exchange-online-rule',
      number: '1',
      title: 'Online Orders: No Exchange Policy',
      paragraphs: [
        'Online orders: NO EXCHANGE on any product purchased online. Only the Returns policy applies to online orders.',
        'Due to our limited seasonal collections and high demand for exclusive designer pieces, we do not support direct size or color exchanges through our courier network for online orders. If you need an alternative size, please return the eligible item within the return window for a refund and place a new order on the website.',
        `In-store exchange is available exclusively at our physical boutique in Gandhi Bazaar, Bengaluru, subject to product eligibility and current store inventory.`,
      ],
    },
    {
      id: 'return-window',
      number: '2',
      title: `${siteConfig.returnWindowDays}-Day Return Window`,
      paragraphs: [
        `Returns are accepted only within ${siteConfig.returnWindowDays} calendar days from the date of confirmed delivery by our courier partner.`,
        `Return requests raised after ${siteConfig.returnWindowDays} days cannot be processed by our system or fulfillment center under any circumstances.`,
      ],
    },
    {
      id: 'return-eligibility',
      number: '3',
      title: 'Eligibility & Garment Condition Requirements',
      paragraphs: [
        'To be eligible for a return and subsequent refund, the garment must satisfy the following strict criteria:',
      ],
      bullets: [
        'Unused & Unworn: The item must be completely unworn, unwashed, and free of any perfume, deodorant, makeup stains, body odor, or animal hair.',
        'Original Tags Attached: All original brand tags, security barcodes, neck labels, and price tags must be intact, untampered, and firmly attached.',
        'Original Packaging: The product must be returned inside its original brand garment cover, zip pouch, and protective courier box.',
        'Complete Ensemble: For multi-piece ensembles (e.g. 3-piece lehengas, kurti-pant-dupatta sets, accessories), all components must be returned together.',
      ],
    },
    {
      id: 'unboxing-video-requirement',
      number: '4',
      title: 'Mandatory Unboxing Video for Damaged / Wrong Items',
      paragraphs: [
        'We photograph and inspect every single item prior to sealing. However, if you claim to have received an item that is damaged, defective, has missing components, or is the wrong size/style, a continuous, uncut 360-degree unboxing video is MANDATORY.',
        'The video must clearly demonstrate the unopened sealed courier bag with the AWB shipping label visible, followed by opening the package and immediately inspecting the garment defects.',
        'This unboxing video must be submitted to us via WhatsApp (+91 98443 71705) or email within 24 hours of delivery. Claims without a continuous unboxing video cannot be approved.',
      ],
    },
    {
      id: 'non-returnable-items',
      number: '5',
      title: 'Non-Returnable Items',
      paragraphs: [
        'The following categories of items are strictly non-returnable and non-refundable:',
      ],
      bullets: [
        'Custom-stitched garments, tailored pieces, altered necklines, or items with customized size alterations.',
        'Items marked as "Final Sale", "Clearance Drop", or purchased under heavy promotional clearance discounts.',
        'Accessories, brooches, hair clips, and delicate headwear for hygiene safety.',
        'Items showing visible signs of wear, dry-cleaning smell, or altered seam allowances.',
      ],
    },
    {
      id: 'quality-check-refunds',
      number: '6',
      title: 'Quality Check & Manual Refund Processing',
      paragraphs: [
        'Upon doorstep pickup, the return parcel is shipped back to our central inspection facility in Bengaluru.',
        'Quality Check (QC): Our master tailors and inspection team will inspect the item within 48 hours of receipt. If the garment passes QC, the return will be approved.',
        'Manual Refund Execution: All refunds are processed manually by our accounts team to ensure accuracy. The refund will be credited directly to your original payment method (or customer bank account for COD orders) within 5–7 business days.',
        'For COD orders, our support executive will reach out to collect your verified Bank Account / UPI ID for NEFT/IMPS transfer.',
      ],
    },
    {
      id: 'in-store-exchange',
      number: '7',
      title: 'In-Store Exchange at Gandhi Bazaar Boutique',
      paragraphs: [
        `If you are based in or visiting Bengaluru, you may bring your unwashed, tagged online purchase to our physical boutique for an in-person exchange:`,
        `• Location: ${siteConfig.address}`,
        `• Requirements: Bring your original order confirmation SMS/email and the unworn item with all tags intact within ${siteConfig.returnWindowDays} days of delivery.`,
        `• Store staff will assist you with sizing, trials, or exchanging for any equal- or higher-value item currently in store stock.`,
      ],
    },
    {
      id: 'how-to-request-return',
      number: '8',
      title: 'How to Request a Return',
      paragraphs: [
        `To initiate a return request, please follow these simple steps:`,
        `1. Email us at ${siteConfig.email} or WhatsApp us at +91 ${siteConfig.phone}.`,
        `2. Provide your Order ID (e.g. TGC-XXXXXX), registered phone number, and name of the item.`,
        `3. State the reason for return and attach clear photos (plus the unboxing video if reporting transit damage).`,
        `4. Once our support team approves your request, our courier partner will arrange a doorstep reverse pickup within 24–48 hours.`,
      ],
    },
  ],
};

export default returnsAndExchange;
