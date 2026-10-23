import type { Metadata } from 'next';
import './globals.css';
import StorefrontShell from '@/components/StorefrontShell';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';
import { ClerkProvider } from '@clerk/nextjs';
import { AuthSessionProvider } from '@/context/AuthContext';
import { ShopProvider } from '@/context/ShopContext';
import { SearchOverlay } from '@/components/SearchOverlay';
import { CartDrawer } from '@/components/CartDrawer';
import QuickViewModal from '@/components/QuickViewModal';
import ToastContainer from '@/components/ToastContainer';
import WhatsAppButton from '@/components/WhatsAppButton';
import FloatingLuxuryDock from '@/components/FloatingLuxuryDock';
import { Cormorant_Garamond, Jost } from 'next/font/google';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

const jost = Jost({
  subsets: ['latin'],
  variable: '--font-jost',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: "The Girls Collections — Premium Women's & Kids Ethnic Wear",
    template: "%s | The Girls Collections",
  },
  description:
    "Curated D2C luxury fashion brand selling traditional and contemporary sarees, lehengas, kurtis, and handcrafted pure silk kids pattu frocks.",
  keywords: [
    "The Girls Collections",
    "women ethnic wear",
    "kids ethnic wear",
    "pattu frocks",
    "organza sarees",
    "zari lehengas",
    "handloom kurtis",
    "luxury Indian fashion",
  ],
  authors: [{ name: "The Girls Collections" }],
  openGraph: {
    title: "The Girls Collections — Women & Kids Ethnic Luxe",
    description: "Handcrafted sarees, lehengas, and kids pure silk pattu frocks.",
    siteName: "The Girls Collections",
    locale: "en_IN",
    type: "website",
  },
};

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider publishableKey={publishableKey} afterSignOutUrl="/">
      <html
        lang="en"
        suppressHydrationWarning
        className={`${cormorant.variable} ${jost.variable}`}
      >
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.addEventListener('error', function(e) {
                  if (e && e.message && e.message.indexOf('Clerk') !== -1) {
                    e.stopImmediatePropagation();
                  }
                }, true);
                window.addEventListener('unhandledrejection', function(e) {
                  if (e && e.reason && (String(e.reason).indexOf('Clerk') !== -1 || String(e.reason).indexOf('failed_to_load_clerk_js') !== -1)) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                  }
                }, true);
              `,
            }}
          />
        </head>
        <body
          suppressHydrationWarning
          className="antialiased min-h-screen flex flex-col bg-ivory text-deep p-0 m-0 font-sans selection:bg-blush selection:text-navy"
        >
          <SmoothScrollProvider>
            <AuthSessionProvider>
              <ShopProvider>
                <StorefrontShell>{children}</StorefrontShell>

                {/* Clerk Smart CAPTCHA anchor */}
                <div id="clerk-captcha" />
              </ShopProvider>
            </AuthSessionProvider>
          </SmoothScrollProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
