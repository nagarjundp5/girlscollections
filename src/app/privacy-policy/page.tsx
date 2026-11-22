import { Metadata } from 'next';
import PolicyLayout from '@/components/policies/PolicyLayout';
import { privacyPolicy } from '@/content/policies/privacyPolicy';

export const metadata: Metadata = {
  title: 'Privacy Policy | The Girls Collections',
  description: 'Digital Personal Data Protection (DPDP) Act 2023 compliant privacy policy for The Girls Collections, Bengaluru.',
  alternates: {
    canonical: 'https://thegirlscollections.com/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
  return <PolicyLayout policy={privacyPolicy} />;
}
