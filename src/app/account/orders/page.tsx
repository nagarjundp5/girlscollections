import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function AccountOrdersRedirect() {
  redirect('/profile/orders');
}
