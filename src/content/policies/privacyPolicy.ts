import { siteConfig } from '@/lib/siteConfig';
import { PolicyDocument } from './types';

export const privacyPolicy: PolicyDocument = {
  slug: 'privacy-policy',
  title: 'Privacy Policy',
  subtitle: 'Digital Personal Data Protection (DPDP) Act 2023 Compliant',
  lastUpdated: 'November 2026',
  intro: [
    `The Girls Collections ("we", "our", or "us") values and respects your privacy. This Privacy Policy outlines our transparent practices regarding the collection, processing, storage, and protection of personal data in compliance with the Digital Personal Data Protection Act, 2023 (India) and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.`,
    `By accessing our website (thegirlscollections.com) and utilizing our services, you acknowledge and agree to the data collection and processing methods described herein.`,
  ],
  clauses: [
    {
      id: 'information-collected',
      number: '1',
      title: 'Information We Collect',
      paragraphs: [
        'We collect only the data necessary to provide a smooth, dependable shopping and delivery experience. This includes:',
      ],
      bullets: [
        'Identity & Contact Details: Your full name, email address, and mobile phone number.',
        'Shipping & Delivery Details: Complete physical delivery address, city, state, postal PIN code, and landmark. Device location/GPS is accessed only if you explicitly choose the "Detect My Location" feature.',
        'Order & Preference History: Records of items purchased, bag contents, sizes selected, wishlist items, and invoice summaries.',
        'Device & Technical Information: IP address, device type, operating system, browser specifications, and anonymous site navigation patterns.',
      ],
    },
    {
      id: 'purpose-of-processing',
      number: '2',
      title: 'Purpose & Legal Grounds for Processing',
      paragraphs: [
        'Your personal data is processed strictly for lawful commercial purposes, specifically:',
      ],
      bullets: [
        'Processing, confirming, and dispatching orders placed on our platform.',
        'Sharing shipping coordinates with licensed courier partners for doorstep delivery and real-time tracking updates.',
        'Providing responsive customer support via phone, WhatsApp, and email.',
        'Sending critical transaction alerts (OTP verification, order confirmations, dispatch notices, and delivery tracking).',
        'Sending curated collection updates and wishlist reminder emails (every promotional email includes a direct, one-click opt-out / unsubscribe link).',
      ],
    },
    {
      id: 'third-party-processors',
      number: '3',
      title: 'Third-Party Service Providers & Data Processors',
      paragraphs: [
        'We share minimal necessary data strictly with trusted, certified enterprise technology partners who assist in our business operations:',
      ],
      bullets: [
        'Razorpay: RBI-licensed payment gateway handling encrypted online transactions. Razorpay processes all card, net banking, and UPI data directly.',
        'Shiprocket: Logistics aggregator coordinating multi-carrier deliveries across India (including Delhivery, BlueDart, DTDC).',
        'Clerk: Secure authentication service managing encrypted customer credentials.',
        'phone.email: Secure telecom gateway facilitating instant SMS OTP mobile verification.',
        'Resend: Transactional email delivery service powering receipt and delivery notifications.',
        'Cloudinary: Global media CDN optimizing high-resolution product photography.',
        'Hosting & Database Infrastructure: Vercel (cloud hosting) and Neon (PostgreSQL database) with strict regional data encryption.',
      ],
    },
    {
      id: 'no-sale-pledge',
      number: '4',
      title: 'Absolute No-Sale Pledge & Payment Security',
      paragraphs: [
        'We NEVER sell, rent, monetize, or lease your personal data to data brokers, marketing lists, or third-party advertisers.',
        'We NEVER store your sensitive financial information, such as complete credit card numbers, debit card numbers, CVV codes, or UPI MPINs. All payment transactions occur inside Razorpay’s 256-bit SSL encrypted, PCI-DSS Level 1 certified environment.',
      ],
    },
    {
      id: 'cookies-storage',
      number: '5',
      title: 'Cookies & Local Storage',
      paragraphs: [
        'We utilize essential session cookies and browser local storage to preserve your shopping bag across visits, remember your category filter preferences (e.g. Women or Kids), and maintain authenticated login sessions.',
        'You can configure your browser to block or alert you about cookies; however, disabling essential cookies may prevent cart persistence and checkout functionality.',
      ],
    },
    {
      id: 'data-security',
      number: '6',
      title: 'Data Security & Encryption',
      paragraphs: [
        'We implement strict organizational, administrative, and technological security measures, including HTTPS/TLS 1.3 encryption in transit, encrypted databases at rest, tokenized sessions, and role-based access controls to safeguard your data against unauthorized access, loss, or alteration.',
      ],
    },
    {
      id: 'data-retention',
      number: '7',
      title: 'Data Retention Periods',
      paragraphs: [
        'We retain your personal information only for as long as necessary to fulfill the purposes outlined in this policy, satisfy statutory taxation and accounting obligations under Indian commercial law, and resolve disputes.',
        'When data is no longer legally required, it is irreversibly anonymized or securely deleted.',
      ],
    },
    {
      id: 'user-rights-dpdp',
      number: '8',
      title: 'Your Rights Under the DPDP Act 2023',
      paragraphs: [
        'Under the Digital Personal Data Protection Act, 2023, you hold the following rights regarding your personal information:',
      ],
      bullets: [
        'Right to Access: You may request a summary of the personal data held about you.',
        'Right to Correction & Updating: You can request correction of inaccurate or incomplete information.',
        'Right to Erasure / Deletion: You can request deletion of your account and associated personal data, subject to legal recordkeeping requirements.',
        'Right to Withdraw Consent: You may revoke consent for non-essential communications at any time.',
        `To exercise any of these statutory rights, please send an email from your registered address to ${siteConfig.email}. Our privacy compliance team will respond within 7 business days.`,
      ],
    },
    {
      id: 'children-data',
      number: '9',
      title: "Protection of Children's Privacy",
      paragraphs: [
        "While The Girls Collections specializes in festive wear for girls and children alongside women's couture, all purchases and website registrations must be conducted by adults (parents or legal guardians) aged 18 and above.",
        'We do not knowingly collect personal data directly from minors without verified parental consent.',
      ],
    },
    {
      id: 'policy-changes',
      number: '10',
      title: 'Policy Updates & Notifications',
      paragraphs: [
        'We reserve the right to amend this Privacy Policy periodically to reflect technological advancements, operational changes, or statutory regulations. Any changes will be posted on this page with an updated "Last updated" date.',
      ],
    },
    {
      id: 'grievance-officer',
      number: '11',
      title: 'Grievance Redressal & Contact',
      paragraphs: [
        'In accordance with the Information Technology Act, 2000 and DPDP Act, 2023, the details of our Grievance Redressal Officer are as follows:',
        `• Name: Grievance Redressal Officer, The Girls Collections`,
        `• Email: ${siteConfig.email}`,
        `• Phone: +91 ${siteConfig.phone}`,
        `• Address: ${siteConfig.address}`,
      ],
    },
  ],
};

export default privacyPolicy;
