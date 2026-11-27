import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NotificationPreferencesCard } from '@/components/NotificationPreferencesCard';

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
    <div className="min-h-screen bg-[#FBF8F4] text-[#1A1E3A] font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8 border-b border-[#EADFD6] pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-[#1A1E3A]">My account</h1>
            <p className="text-sm text-[#6B6F85] mt-1">View details and track your orders.</p>
          </div>
          <nav className="flex space-x-3">
            <Link
              href="/profile/orders"
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-[#D94F7E] hover:bg-[#C23F6D] text-white transition-colors"
            >
              My orders
            </Link>
          </nav>
        </div>
        <div className="mb-8">
          <NotificationPreferencesCard />
        </div>
        {children}
      </div>
    </div>
  );
}

