'use client';

import React, { useEffect, useState, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, PackageSearch, Settings, LogOut, Tag, Menu, X, Bell, Users, Loader2, Heart, Clock, Database, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useAuth, useUser, useClerk, SignIn } from '@clerk/nextjs';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Categories', href: '/admin/categories', icon: Tag },
  { label: 'Products', href: '/admin/products', icon: PackageSearch },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Wishlist', href: '/admin/wishlist', icon: Heart },
  { label: 'Inventory Holds', href: '/admin/inventory-holds', icon: Clock },
  { label: 'Discounts', href: '/admin/discounts', icon: Tag },
  { label: 'Diagnostics', href: '/admin/diagnostics', icon: Database },
  { label: 'Staff Roles', href: '/admin/staff', icon: ShieldCheck },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

const ADMIN_ALLOWLIST = [
  'nagarjundp256@gmail.com',
  'admin@tgc.in',
  'nnvg2608@gmail.com',
  'drftnclothing@gmail.com',
  'chethansc47@gmail.com',
];

interface AdminLoadingContextType {
  isGlobalLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const AdminLoadingContext = createContext<AdminLoadingContextType>({
  isGlobalLoading: false,
  startLoading: () => {},
  stopLoading: () => {},
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Global Route & Action Navigation Loading State
  const [isNavigating, setIsNavigating] = useState(false);
  const [navTarget, setNavTarget] = useState<string | null>(null);
  const [manualLoadingCount, setManualLoadingCount] = useState(0);

  const startLoading = () => setManualLoadingCount((c) => c + 1);
  const stopLoading = () => setManualLoadingCount((c) => Math.max(0, c - 1));
  const isLoadingActive = isNavigating || manualLoadingCount > 0;

  useEffect(() => {
    // When pathname changes, route transition has resolved
    setIsNavigating(false);
    setNavTarget(null);
    setIsMobileOpen(false);
  }, [pathname]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname === href) {
      e.preventDefault();
      return;
    }
    if (isNavigating) {
      e.preventDefault();
      return;
    }
    setIsNavigating(true);
    setNavTarget(href);
  };

  const handleLogout = async () => {
    setIsNavigating(true);
    document.cookie = 'tgc_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    try {
      await fetch('/api/admin/login', { method: 'DELETE' });
      await signOut();
    } catch (e) {}
    router.push('/admin');
  };

  // 1. Loading State
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-3 text-zinc-400 font-medium select-none">
        <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 z-[99999] animate-pulse" />
        <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
        <span className="text-xs uppercase tracking-widest font-bold">Verifying Admin Authorization...</span>
      </div>
    );
  }

  const userEmail = (user?.primaryEmailAddress?.emailAddress || user?.emailAddresses[0]?.emailAddress || '').toLowerCase().trim();
  const hasAdminCookie = typeof document !== 'undefined' && document.cookie.includes('tgc_admin_session=true');
  const isEmailAllowed = Boolean(userEmail && ADMIN_ALLOWLIST.includes(userEmail));

  const role = user?.publicMetadata?.role;
  const isAdmin = role === 'admin' || isEmailAllowed || hasAdminCookie;
  const isStaff = role === 'staff';

  // 2. Unauthenticated User -> Render Clerk Sign In directly
  if (!userId && !hasAdminCookie) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold tracking-[0.15em] text-white uppercase mb-2">
            THE GIRLS COLLECTIONS <span className="text-amber-400 font-light text-xs align-top">ADMIN</span>
          </h1>
          <p className="text-zinc-500 text-xs tracking-widest uppercase">Sign in with authorized Gmail account</p>
        </div>
        <div className="w-full max-w-md bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl shadow-2xl flex justify-center">
          <SignIn routing="hash" />
        </div>
      </div>
    );
  }

  // 3. Authenticated but unauthorized email -> Access Denied Screen
  if (userId && !isAdmin && !isStaff) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 text-center animate-fade-in">
        <div className="max-w-md w-full bg-zinc-900 border border-red-900/40 p-8 rounded-2xl shadow-2xl space-y-6">
          <div className="w-12 h-12 bg-red-950/60 border border-red-800/50 rounded-full flex items-center justify-center mx-auto text-red-500">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Access Restricted</h2>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Signed in as <span className="text-amber-400 font-mono font-bold">{userEmail}</span>. This account is not authorized for Admin Panel access.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            Sign Out &amp; Switch Account
          </button>
        </div>
      </div>
    );
  }

  // Filter navigation items based on user role
  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (isStaff) {
      return item.href === '/admin' || item.href === '/admin/categories' || item.href === '/admin/products';
    }
    return true;
  });

  return (
    <AdminLoadingContext.Provider value={{ isGlobalLoading: isLoadingActive, startLoading, stopLoading }}>
      <div className="min-h-[100dvh] w-full bg-[#F9F9F8] flex flex-col md:flex-row text-zinc-900 font-sans relative">
        {/* ── Global High-Visibility Top Progress Bar ── */}
        {isLoadingActive && (
          <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 z-[99999] animate-pulse transition-all duration-300" />
        )}

        {/* Desktop Sidebar */}
        <aside className="w-full md:w-64 bg-white border-r border-zinc-200/80 flex-shrink-0 flex flex-col hidden md:flex">
          <div className="p-6 border-b border-zinc-100 flex items-center justify-center">
            <Link href="/admin" className="text-sm font-black tracking-[0.15em] text-zinc-900 uppercase">
              TGC <span className="text-zariGold font-bold text-xs align-top font-mono">ADMIN</span>
            </Link>
          </div>

          <nav className="flex-1 py-6 px-4 space-y-2">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const isTargetingThis = navTarget === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  aria-disabled={isNavigating || isActive}
                  className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-bold tracking-wider uppercase transition-all ${
                    isActive
                      ? 'bg-zinc-900 text-white shadow-sm cursor-default'
                      : isNavigating
                      ? 'text-zinc-400 opacity-60 pointer-events-none'
                      : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {isTargetingThis && (
                    <Loader2 className="w-3.5 h-3.5 ml-auto animate-spin text-brand-red" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-zinc-100">
            <button
              onClick={handleLogout}
              disabled={isNavigating}
              className="flex items-center gap-3 px-4 py-3 w-full text-left rounded text-sm font-bold tracking-wider uppercase text-zinc-400 hover:bg-zinc-50 hover:text-brand-red transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </aside>

        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-200 bg-white">
          <button onClick={() => setIsMobileOpen(true)} className="text-zinc-500 hover:text-zinc-900 p-2">
            <Menu className="w-6 h-6" />
          </button>
          <Link href="/admin" className="text-sm font-black tracking-[0.15em] text-zinc-900 uppercase">
            TGC <span className="text-zariGold font-bold text-xs align-top font-mono">ADMIN</span>
          </Link>
          <button onClick={handleLogout} className="text-zinc-500 hover:text-brand-red p-2">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Slide-Over Drawer Menu */}
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            {/* Backdrop overlay */}
            <div 
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            />

            {/* Drawer content box */}
            <aside className="relative w-64 max-w-[80vw] h-full bg-white border-r border-zinc-200 p-6 flex flex-col justify-between z-10 animate-slide-in-from-left">
              <div>
                {/* Drawer header */}
                <div className="flex items-center justify-between border-b border-zinc-100 pb-5 mb-6">
                  <span className="text-sm font-black tracking-widest text-zinc-900 uppercase">
                    TGC <span className="text-zariGold text-[9px] align-top">MENU</span>
                  </span>
                  <button onClick={() => setIsMobileOpen(false)} className="text-zinc-400 hover:text-zinc-900 p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Drawer navigation list */}
                <nav className="space-y-1">
                  {visibleNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    const isTargetingThis = navTarget === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={(e) => handleNavClick(e, item.href)}
                        className={`flex items-center gap-3.5 px-4 py-3 rounded text-xs font-bold tracking-widest uppercase transition-all ${
                          isActive
                            ? 'bg-zinc-900 text-white'
                            : isNavigating
                            ? 'text-zinc-400 opacity-60 pointer-events-none'
                            : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                        {isTargetingThis && (
                          <Loader2 className="w-3.5 h-3.5 ml-auto animate-spin text-brand-red" />
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Logout button at drawer footer */}
              <div className="border-t border-zinc-100 pt-5">
                <button
                  onClick={handleLogout}
                  disabled={isNavigating}
                  className="flex items-center gap-3.5 px-4 py-3 w-full text-left rounded text-xs font-bold tracking-widest uppercase text-zinc-400 hover:text-brand-red transition-colors disabled:opacity-50 disabled:pointer-events-none"
                >
                  <LogOut className="w-4 h-4" />
                  Logout Account
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#F9F9F8] relative animate-fade-in">
          {children}
        </main>
      </div>
    </AdminLoadingContext.Provider>
  );
}
