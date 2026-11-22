import { Metadata } from 'next';
import PolicyLayout from '@/components/policies/PolicyLayout';
import { termsAndConditions } from '@/content/policies/termsAndConditions';

export const metadata: Metadata = {
  title: 'Terms & Conditions | The Girls Collections',
  description: 'Official terms and conditions for shopping online and in-store at The Girls Collections, Bengaluru.',
  alternates: {
    canonical: 'https://thegirlscollections.com/terms-and-conditions',
  },
};

export default function TermsAndConditionsPage() {
  return <PolicyLayout policy={termsAndConditions} />;
}
