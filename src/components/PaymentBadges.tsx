'use client';

import React from 'react';

export const VisaBadge: React.FC = () => (
  <svg viewBox="0 0 38 12" className="h-3 w-auto max-w-[36px]" fill="none" aria-label="Visa">
    <text x="2" y="10" fontFamily="sans-serif" fontWeight="900" fontStyle="italic" fontSize="11.5" fill="#1A1F71" letterSpacing="0.5">
      VISA
    </text>
    <polygon points="2,2 5,2 3.5,6 1.5,6" fill="#F7B600" />
  </svg>
);

export const MastercardBadge: React.FC = () => (
  <svg viewBox="0 0 24 16" className="h-3.5 w-auto" fill="none" aria-label="Mastercard">
    <circle cx="8" cy="8" r="6" fill="#EB001B" />
    <circle cx="16" cy="8" r="6" fill="#F79E1B" fillOpacity="0.9" />
    <path d="M12 3.55a5.98 5.98 0 0 1 2 4.45 5.98 5.98 0 0 1-2 4.45 5.98 5.98 0 0 1-2-4.45 5.98 5.98 0 0 1 2-4.45z" fill="#FF5F00" />
  </svg>
);

export const RuPayBadge: React.FC = () => (
  <svg viewBox="0 0 38 12" className="h-3 w-auto max-w-[36px]" fill="none" aria-label="RuPay">
    <text x="1" y="9.5" fontFamily="sans-serif" fontWeight="800" fontSize="10" fill="#097275">
      Ru
    </text>
    <text x="13.5" y="9.5" fontFamily="sans-serif" fontWeight="800" fontStyle="italic" fontSize="10" fill="#F37021">
      Pay
    </text>
    <polygon points="31,2 33,2 30.5,10 28.5,10" fill="#097275" />
    <polygon points="34,2 36,2 33.5,10 31.5,10" fill="#F37021" />
  </svg>
);

export const AmexBadge: React.FC = () => (
  <svg viewBox="0 0 32 16" className="h-3.5 w-auto" fill="none" aria-label="American Express">
    <rect width="32" height="16" rx="2" fill="#006FCF" />
    <text x="16" y="11" textAnchor="middle" fontFamily="sans-serif" fontWeight="900" fontSize="7" fill="#FFFFFF" letterSpacing="0.8">
      AMEX
    </text>
  </svg>
);

export const UpiBadge: React.FC = () => (
  <svg viewBox="0 0 32 14" className="h-3 w-auto" fill="none" aria-label="UPI">
    <polygon points="1,12 6,12 10,2 5,2" fill="#097F5B" />
    <polygon points="6,12 11,12 15,2 10,2" fill="#F47B20" />
    <text x="15.5" y="10.5" fontFamily="sans-serif" fontWeight="900" fontSize="9" fill="#1C1417">
      UPI
    </text>
  </svg>
);

export const GooglePayBadge: React.FC = () => (
  <svg viewBox="0 0 36 14" className="h-3.5 w-auto" fill="none" aria-label="Google Pay">
    <path
      d="M5.5 3.2c1.1 0 2 .4 2.7 1.1l2-2C9 1.1 7.4.5 5.5.5 2.1.5-.6 3.2-.6 6.6s2.7 6.1 6.1 6.1c3.5 0 5.9-2.5 5.9-6 0-.5 0-.8-.1-1.2H5.5V8h3.4c-.2.9-.8 1.7-1.6 2.2L9 12c1.9-1.8 3-4.5 3-7.5"
      fill="#4285F4"
    />
    <text x="13.5" y="10" fontFamily="sans-serif" fontWeight="700" fontSize="9" fill="#5F6368">
      Pay
    </text>
  </svg>
);

export const PhonePeBadge: React.FC = () => (
  <svg viewBox="0 0 38 14" className="h-3.5 w-auto" fill="none" aria-label="PhonePe">
    <rect width="13" height="13" rx="6.5" fill="#5F259F" y="0.5" />
    <text x="6.5" y="10" textAnchor="middle" fontFamily="sans-serif" fontWeight="900" fontSize="9" fill="#FFFFFF">
      पे
    </text>
    <text x="15" y="10" fontFamily="sans-serif" fontWeight="800" fontSize="7.5" fill="#5F259F">
      PhonePe
    </text>
  </svg>
);

export const PaytmBadge: React.FC = () => (
  <svg viewBox="0 0 34 12" className="h-3 w-auto" fill="none" aria-label="Paytm">
    <text x="0" y="9.5" fontFamily="sans-serif" fontWeight="900" fontSize="10" fill="#002E6E">
      Pay
    </text>
    <text x="18" y="9.5" fontFamily="sans-serif" fontWeight="900" fontSize="10" fill="#00BAF2">
      tm
    </text>
  </svg>
);

export const RazorpayBadge: React.FC = () => (
  <svg viewBox="0 0 40 12" className="h-3 w-auto max-w-[38px]" fill="none" aria-label="Razorpay">
    <polygon points="4,1 0,11 3,11 5.5,5 7.5,11 10.5,11 5.5,1" fill="#0C2340" />
    <polygon points="5,3 2,11 4.5,11 6.5,6 8.5,11 10.5,11" fill="#3395FF" />
    <text x="11.5" y="9" fontFamily="sans-serif" fontWeight="800" fontSize="7.5" fill="#0C2340">
      Razorpay
    </text>
  </svg>
);

export const BADGES = [
  { name: 'Visa', component: VisaBadge },
  { name: 'Mastercard', component: MastercardBadge },
  { name: 'RuPay', component: RuPayBadge },
  { name: 'American Express', component: AmexBadge },
  { name: 'UPI', component: UpiBadge },
  { name: 'Google Pay', component: GooglePayBadge },
  { name: 'PhonePe', component: PhonePeBadge },
  { name: 'Paytm', component: PaytmBadge },
  { name: 'Razorpay', component: RazorpayBadge },
];

export default function PaymentBadges() {
  return (
    <div className="w-full flex flex-col items-center justify-center space-y-3">
      <p className="text-xs md:text-sm font-sans font-semibold text-[#1A1E3A] uppercase tracking-[0.06em]">
        Secure Checkout With
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl">
        {BADGES.map(({ name, component: Component }) => (
          <div
            key={name}
            className="w-[44px] h-[28px] bg-white rounded-md border border-[#EAE5DE] shadow-2xs flex items-center justify-center overflow-hidden shrink-0 select-none hover:border-[#B8903A]/60 transition-colors"
            title={name}
          >
            <Component />
          </div>
        ))}
      </div>
      <p className="text-[11px] sm:text-xs font-sans text-[#1C1417]/65 tracking-wide text-center">
        Credit Card | Debit Card | Net Banking | UPI | COD
      </p>
    </div>
  );
}
