import { siteConfig } from '@/lib/siteConfig';
import { PolicyDocument } from './types';

export const privacyPolicy: PolicyDocument = {
  slug: 'privacy-policy',
  title: 'Privacy Policy',
  subtitle: 'How we collect, use, and protect your personal information',
  lastUpdated: 'November 26, 2026',
  intro: [
    `The Girls Collections respects your privacy. This Privacy Policy explains clearly what information we collect, how we use it, and your rights under Indian law (including the Digital Personal Data Protection Act, 2023).`,
  ],
  clauses: [
    {
      id: 'data-collected',
      number: '1',
      title: 'Information We Collect',
      paragraphs: [
        'We only collect information needed to process and deliver your orders:',
      ],
      bullets: [
        'Name, email address, and mobile phone number.',
        'Full shipping address and PIN code.',
        'Device location — ONLY if you explicitly allow it when tapping "Detect My Location" at checkout.',
        'Order history, selected sizes, and cart items.',
      ],
    },
    {
      id: 'how-we-use-data',
      number: '2',
      title: 'How We Use Your Information',
      paragraphs: [
        'We use your details solely to:',
      ],
      bullets: [
        'Confirm your orders and send invoices and AWB tracking updates.',
        'Deliver your packages to your doorstep.',
        'Verify your phone number and assist you with returns or support.',
      ],
    },
    {
      id: 'trusted-partners',
      number: '3',
      title: 'Trusted Partners We Share Data With',
      paragraphs: [
        'We never sell or rent your personal data. We share only the minimum details needed with:',
      ],
      bullets: [
        'Razorpay: To process online payments securely. We never store your card or UPI PIN.',
        'Shiprocket: To pick up and deliver your order and provide live tracking.',
        'Resend: To send your order confirmation, shipping, and delivery emails.',
      ],
    },
    {
      id: 'cookies',
      number: '4',
      title: 'Cookies & Local Storage',
      paragraphs: [
        'We use essential cookies and browser storage to keep items in your shopping bag, remember your sign-in session, and save your Women/Kids browsing preference.',
        'You can clear or disable cookies anytime in your browser settings.',
      ],
    },
    {
      id: 'your-rights',
      number: '5',
      title: 'Your Rights',
      paragraphs: [
        'You have the right to access, correct, or request deletion of your personal data stored with us.',
        `To request any update or deletion, email ${siteConfig.email} or call +91 ${siteConfig.phone}.`,
      ],
    },
    {
      id: 'contact-privacy',
      number: '6',
      title: 'Privacy & Grievance Contact',
      paragraphs: [
        `Email: ${siteConfig.email}`,
        `Phone: +91 ${siteConfig.phone}`,
        `Address: ${siteConfig.address}`,
        `Hours: ${siteConfig.hours}`,
      ],
    },
  ],
};

export default privacyPolicy;
