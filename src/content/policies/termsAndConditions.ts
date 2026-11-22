import { siteConfig } from '@/lib/siteConfig';
import { PolicyDocument } from './types';

export const termsAndConditions: PolicyDocument = {
  slug: 'terms-and-conditions',
  title: 'Terms & Conditions',
  subtitle: 'Legal Agreement for Using The Girls Collections Platform',
  lastUpdated: 'November 2026',
  intro: [
    `Welcome to The Girls Collections. If you continue to browse and use this website (thegirlscollections.com), you are agreeing to comply with and be bound by the following terms and conditions of use, which together with our Privacy Policy govern The Girls Collections' relationship with you in relation to this website.`,
    `The term "The Girls Collections", "us", or "we" refers to the owner of the website, having its physical boutique located at ${siteConfig.address}. The term "you" refers to the user, viewer, or customer of our website.`,
  ],
  clauses: [
    {
      id: 'general-use',
      number: '1',
      title: 'General Terms of Website Use',
      paragraphs: [
        'The content of the pages of this website is for your general information and use only. It is subject to change without notice.',
        'Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness, or suitability of the information and materials found or offered on this website for any particular purpose. You acknowledge that such information and materials may contain inaccuracies or errors and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law.',
        'Your use of any information or materials on this website is entirely at your own risk, for which we shall not be liable. It shall be your own responsibility to ensure that any products, services, or information available through this website meet your specific requirements.',
      ],
    },
    {
      id: 'intellectual-property',
      number: '2',
      title: 'Intellectual Property & Copyright',
      paragraphs: [
        'This website contains material which is owned by or licensed to us. This material includes, but is not limited to, the design, layout, look, appearance, graphics, photographs, embroidery motifs, brand identity, and typography. Reproduction is strictly prohibited other than in accordance with the copyright notice, which forms part of these terms and conditions.',
        'All trademarks, logos, and service marks reproduced in this website which are not the property of, or licensed to, the operator are acknowledged on the website.',
      ],
    },
    {
      id: 'unauthorised-use',
      number: '3',
      title: 'Unauthorised Use & External Links',
      paragraphs: [
        'Unauthorised use of this website may give rise to a claim for damages and/or be a criminal offence under the Information Technology Act and Indian Penal Code.',
        'From time to time, this website may also include links to other external websites (such as courier tracking or payment partners). These links are provided for your convenience to provide further information. They do not signify that we endorse the website(s). We have no responsibility for the content of the linked website(s).',
        'You may not create a link to this website from another website or document without the prior written consent of The Girls Collections.',
      ],
    },
    {
      id: 'no-exchange-online',
      number: '4',
      title: 'No Exchange Policy for Online Orders',
      paragraphs: [
        'NO EXCHANGE on any product purchased online. Only our Returns policy applies to online orders.',
        'Because our couture ethnic wear, festive lehengas, and designer garments are curated in limited quantities with dedicated quality inspections prior to dispatch, we do not provide replacement exchanges for online shipments. If you require a different size or piece, you must initiate an eligible return within the return window and place a fresh order.',
        'In-store exchange is available exclusively at our physical boutique in Gandhi Bazaar, Bengaluru, subject to product eligibility and current store inventory.',
      ],
    },
    {
      id: 'payment-terms',
      number: '5',
      title: 'Payment Terms (Prepaid & Cash on Delivery)',
      paragraphs: [
        'Prepaid Orders: Customers may pay the full order amount securely online through our PCI-DSS certified payment gateway partner, Razorpay (supporting UPI, Credit Cards, Debit Cards, Net Banking, and Wallets).',
        `Cash on Delivery (COD) Orders: COD orders require a minimum ₹${siteConfig.codAdvance} advance paid online at checkout to confirm and validate the booking. The remaining balance amount is payable in cash or UPI directly to the delivery personnel upon delivery. The ₹${siteConfig.codAdvance} advance is completely adjusted against your order total invoice.`,
        `Unconfirmed COD orders without the advance deposit within the reservation window are automatically released to prevent inventory holding.`,
      ],
    },
    {
      id: 'colour-variation',
      number: '6',
      title: 'Product Colour & Visual Representation',
      paragraphs: [
        'Actual product colour may slightly vary from the photos due to professional studio lighting, flash photography, and your individual device display or screen settings.',
        'While we strive to depict the true shades, zari lustres, and handwork textures with extreme fidelity, minor tonal variations are inherent to digital screens and natural handcrafted fabrics.',
      ],
    },
    {
      id: 'coupons-promotions',
      number: '7',
      title: 'Coupons, Promo Codes & Offers',
      paragraphs: [
        'Personal promo codes and coupon vouchers issued to you are personal, non-transferable, and may not be posted, shared, or distributed on third-party coupon aggregator websites, forums, or browser extensions.',
        'Our first-order promotional discount (e.g. 10% off) is strictly valid once per customer/household. It applies to both COD and prepaid orders across eligible collections.',
        'The Girls Collections reserves the right to void any order placed with unauthorized or scraped coupon codes.',
      ],
    },
    {
      id: 'cancellation-refunds',
      number: '8',
      title: 'Order Cancellation & Refund Process',
      paragraphs: [
        'Orders can only be cancelled before they are dispatched from our fulfillment center. Once handed over to the courier partner, an order cannot be cancelled in transit.',
        'All eligible cancellations and return refunds are manual refunds processed directly by our administrative and accounts team to your original payment method (or customer bank account for COD orders).',
        'Refund processing timeline: 5–7 business days from the date of cancellation approval or quality inspection pass at our warehouse.',
      ],
    },
    {
      id: 'accounts-verification',
      number: '9',
      title: 'Customer Accounts & Phone Verification',
      paragraphs: [
        'Customers are solely responsible for ensuring that all contact details, recipient names, delivery addresses, and PIN codes provided are accurate and complete.',
        'Mandatory phone number verification via secure OTP is required at checkout to validate order authenticity, protect customers against fraudulent orders, and facilitate real-time courier delivery coordination.',
      ],
    },
    {
      id: 'governing-law',
      number: '10',
      title: 'Governing Law & Legal Jurisdiction',
      paragraphs: [
        'Your use of this website and any dispute arising out of such use of the website or transactions conducted through it is subject to the laws of the Republic of India.',
        'The courts at Bengaluru, Karnataka shall have exclusive jurisdiction over any legal claims, disputes, or proceedings arising under or in connection with these Terms & Conditions.',
      ],
    },
    {
      id: 'contact-support',
      number: '11',
      title: 'Contact Information',
      paragraphs: [
        `If you have questions regarding these Terms & Conditions, please contact us:`,
        `• Legal Entity: ${siteConfig.legalName}`,
        `• Email: ${siteConfig.email}`,
        `• Phone: +91 ${siteConfig.phone}`,
        `• Address: ${siteConfig.address}`,
      ],
    },
  ],
};

export default termsAndConditions;
