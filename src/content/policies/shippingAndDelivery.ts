import { siteConfig } from '@/lib/siteConfig';
import { PolicyDocument } from './types';

export const shippingAndDelivery: PolicyDocument = {
  slug: 'shipping-and-delivery',
  title: 'Shipping & Delivery Policy',
  subtitle: 'Pan-India Express Logistics, Timelines & COD Policy',
  lastUpdated: 'November 2026',
  intro: [
    `At The Girls Collections, we ensure that every handcrafted ethnic ensemble, festive lehenga, and designer frock is meticulously packaged and delivered safely to your doorstep. We partner with India's leading surface and air express courier services via Shiprocket to serve over 24,000 PIN codes across the nation.`,
  ],
  clauses: [
    {
      id: 'shipping-charges',
      number: '1',
      title: 'Shipping Charges & Free Shipping Policy',
      paragraphs: [
        `• Free Express Shipping: We offer 100% Free Shipping on all prepaid and COD orders valued above ₹${siteConfig.freeShippingThreshold}.`,
        `• Orders below ₹${siteConfig.freeShippingThreshold}: A nominal flat shipping charge of ₹99 applies across India to cover insured transit packaging.`,
        `• Promotional Offers: First-order promo codes and promotional discounts apply as configured during special seasonal drops.`,
      ],
    },
    {
      id: 'dispatch-timeline',
      number: '2',
      title: 'Order Dispatch Timelines',
      paragraphs: [
        `All ready-to-wear orders undergo an extensive hand-finishing and quality assurance inspection before being packaged in our branded garment boxes.`,
        `• Dispatch Window: Orders are dispatched within ${siteConfig.dispatchDays} from our flagship boutique and fulfillment studio in Gandhi Bazaar, Basavanagudi, Bengaluru.`,
        `• Dispatches take place Monday through Saturday. Orders placed on Sundays or regional public holidays will be dispatched on the next working business day.`,
      ],
    },
    {
      id: 'delivery-timeline',
      number: '3',
      title: 'Estimated Delivery Times',
      paragraphs: [
        `Estimated transit time once dispatched is typically ${siteConfig.deliveryDays}, categorized by zone:`,
        `• Bengaluru & Karnataka: 1–3 business days.`,
        `• South Indian Metros (Chennai, Hyderabad, Kochi): 2–4 business days.`,
        `• Other Metros (Mumbai, Delhi-NCR, Kolkata, Pune, Ahmedabad): 3–5 business days.`,
        `• Rest of India & Regional Towns: 4–7 business days.`,
        `• Remote or Northeast Areas: 5–8 business days depending on local postal accessibility.`,
      ],
    },
    {
      id: 'tracking-awb',
      number: '4',
      title: 'Real-Time Courier Tracking (Shiprocket AWB)',
      paragraphs: [
        'The moment your package is picked up by the courier carrier, an automated confirmation is dispatched to your registered email and mobile number containing your live Air Waybill (AWB) number and carrier name (e.g. BlueDart, Delhivery, DTDC, Xpressbees).',
        'You can track your parcel live anytime by visiting your Account > Orders page on our website or by navigating directly to our Track Order page (/track).',
      ],
    },
    {
      id: 'serviceable-pan-india',
      number: '5',
      title: 'PAN-India Serviceability & Coverage',
      paragraphs: [
        'We proudly service customers all across India. You can easily verify serviceability and estimated transit times for your specific location using the PIN Code Checker located on each product page or at checkout.',
      ],
    },
    {
      id: 'delays-force-majeure',
      number: '6',
      title: 'Unforeseen Logistics Delays (Force Majeure)',
      paragraphs: [
        'While our courier partners maintain a 98%+ on-time delivery record, occasional unforeseen delays may occur due to adverse weather events, natural disruptions, national holidays, regional curfews, or peak festive transportation backlogs.',
        'In such events, our customer support team actively coordinates with logistics managers to prioritize your consignment and keep you updated.',
      ],
    },
    {
      id: 'address-accuracy',
      number: '7',
      title: 'Delivery Address & Recipient Accuracy',
      paragraphs: [
        'Please ensure your shipping address includes complete details: house/flat number, building or apartment name, street, nearby landmark, and the accurate 6-digit PIN code.',
        'An active, reachable phone number is essential as delivery personnel will reach out before arrival or dispatch OTP confirmation for secure handover.',
      ],
    },
    {
      id: 'cod-advance-flow',
      number: '8',
      title: `Cash on Delivery (COD) Flow & ₹${siteConfig.codAdvance} Advance`,
      paragraphs: [
        `To ensure authentic deliveries and curb fraudulent returns or false bookings, Cash on Delivery (COD) requires a non-refundable advance deposit of ₹${siteConfig.codAdvance} paid securely online at checkout.`,
        `• The ₹${siteConfig.codAdvance} advance is completely adjusted against your order total invoice.`,
        `• The remaining balance is paid directly to the courier executive upon physical delivery of your package (via cash or courier UPI QR scan).`,
      ],
    },
    {
      id: 'shipping-contact',
      number: '9',
      title: 'Logistics Support & Inquiries',
      paragraphs: [
        `Need help with a delayed parcel, change of address, or delivery reschedule? Contact our dedicated logistics desk:`,
        `• WhatsApp: +91 ${siteConfig.phone} (Fastest)`,
        `• Email: ${siteConfig.email}`,
        `• Phone Support: +91 ${siteConfig.phone} (10:30 AM – 8:30 PM IST)`,
      ],
    },
  ],
};

export default shippingAndDelivery;
