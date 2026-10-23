'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin');
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-3 text-zinc-400 font-medium select-none">
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 z-[99999] animate-pulse" />
      <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Redirecting to Admin Panel...</span>
    </div>
  );
}
