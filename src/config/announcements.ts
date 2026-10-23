export interface AnnouncementMessage {
  id: string;
  icon: 'truck' | 'tag' | 'sparkles' | 'rotate' | 'gift';
  text: string;
  href?: string;
}

/**
 * Announcement Ticker Messages Config
 * NOTE: Confirm exact promotional offer amounts, shipping thresholds, and return policies with client before production release.
 */
export const ANNOUNCEMENT_MESSAGES: AnnouncementMessage[] = [
  {
    id: 'cod-india',
    icon: 'truck',
    text: 'CASH ON DELIVERY (COD) AVAILABLE ACROSS INDIA',
  },
  {
    id: 'free-shipping',
    icon: 'gift',
    text: 'FREE EXPRESS SHIPPING ON ORDERS ABOVE ₹1,999',
  },
  {
    id: 'festive-edit',
    icon: 'sparkles',
    text: 'FESTIVE EDIT NOW LIVE — HANDCRAFTED PURE SILK & ORGANZA',
  },
  {
    id: 'discount-code',
    icon: 'tag',
    text: "USE CODE 'FESTIVE10' FOR 10% OFF YOUR FIRST ORDER",
  },
  {
    id: 'easy-returns',
    icon: 'rotate',
    text: 'HASSLE-FREE 7-DAY SIZE EXCHANGES & EASY RETURNS',
  },
];
