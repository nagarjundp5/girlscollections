import { Metadata } from 'next';
import PolicyLayout from '@/components/policies/PolicyLayout';
import { shippingAndDelivery } from '@/content/policies/shippingAndDelivery';

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy | The Girls Collections',
  description: 'Pan-India shipping rules, free shipping above ₹1000, 1-2 business days dispatch, and Shiprocket delivery tracking.',
  alternates: {
    canonical: 'https://thegirlscollections.com/shipping-and-delivery',
  },
};

export default function ShippingAndDeliveryPage() {
  return <PolicyLayout policy={shippingAndDelivery} />;
}
