import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const [dbUser] = await db
    .select({ onboardingCompleted: schema.users.onboarding_completed })
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  if (dbUser && dbUser.onboardingCompleted === false) {
    redirect('/onboarding');
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1E293B]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8 border-b border-[#E2E8F0] pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#0F172A]">My Account</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your orders and saved details</p>
          </div>
          <nav className="flex space-x-4">
            <Link
              href="/profile/orders"
              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-[#0F172A] text-white"
            >
              Orders
            </Link>
          </nav>
        </div>
        {children}
      </div>
    </div>
  );
}

