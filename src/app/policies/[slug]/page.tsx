import { redirect } from 'next/navigation';

interface Props {
  params: {
    slug: string;
  };
}

export default function LegacyPolicyRedirectPage({ params }: Props) {
  const { slug } = params;

  if (slug === 'terms-and-conditions' || slug === 'terms') {
    redirect('/terms-and-conditions');
  }

  if (slug === 'privacy-policy' || slug === 'privacy') {
    redirect('/privacy-policy');
  }

  if (slug === 'shipping-and-delivery-policy' || slug === 'shipping-and-delivery' || slug === 'shipping') {
    redirect('/shipping-and-delivery');
  }

  if (
    slug === 'refund-return-exchange-policy' ||
    slug === 'returns-and-exchange' ||
    slug === 'returns' ||
    slug === 'refund-policy' ||
    slug === 'cancellation-policy'
  ) {
    redirect('/returns-and-exchange');
  }

  if (slug === 'faqs' || slug === 'faq') {
    redirect('/faqs');
  }

  redirect('/terms-and-conditions');
}
