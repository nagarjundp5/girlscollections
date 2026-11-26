export interface SiteConfig {
  email: string;
  phone: string;
  telLink: string;
  whatsappLink: string;
  whatsappNumber: string;
  address: string;
  mapsLink: string;
  legalName: string;
  codAdvance: number;
  returnWindowDays: number;
  dispatchDays: string;
  deliveryDays: string;
  resendFromEmail: string;
  hours: string;
  instagram: string;
  freeShippingThreshold: number;
}

export const siteConfig: SiteConfig = {
  email: "thegirlscollections01@gmail.com",
  phone: "98443 71705",
  telLink: "+919844371705",
  whatsappLink: "https://wa.me/919844371705",
  whatsappNumber: "919844371705",
  address:
    "North Hanuman Temple, 3, NAT Street, DV Gundappa Rd, Gandhi Bazaar, Basavanagudi, Bengaluru, Karnataka 560004",
  mapsLink:
    "https://www.google.com/maps/search/?api=1&query=North+Hanuman+Temple%2C+3%2C+NAT+Street%2C+DV+Gundappa+Rd%2C+Gandhi+Bazaar%2C+Basavanagudi%2C+Bengaluru%2C+Karnataka+560004",
  legalName: "The Girls Collections",
  codAdvance: 200,
  returnWindowDays: 7,
  dispatchDays: "1-2 business days",
  deliveryDays: "3-7 business days",
  resendFromEmail: "The Girls Collections <order@thegirlscollections.com>",
  hours: "Mon - Sat: 10:30 AM - 9:00 PM | Sun: 11:00 AM - 8:30 PM",
  instagram: "@thegirlscollections",
  freeShippingThreshold: 1999,
};

export default siteConfig;
