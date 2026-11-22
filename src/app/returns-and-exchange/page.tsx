import { Metadata } from 'next';
import PolicyLayout from '@/components/policies/PolicyLayout';
import { returnsAndExchange } from '@/content/policies/returnsAndExchange';

export const metadata: Metadata = {
  title: 'Returns & Exchange Policy | The Girls Collections',
  description: 'Online orders no exchange policy, 7-day return window, unboxing video requirement, and in-store exchange in Gandhi Bazaar.',
  alternates: {
    canonical: 'https://thegirlscollections.com/returns-and-exchange',
  },
};

export default function ReturnsAndExchangePage() {
  return <PolicyLayout policy={returnsAndExchange} />;
}
