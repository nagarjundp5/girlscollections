import * as React from 'react';
import { siteConfig } from '@/lib/siteConfig';
import { getSizeLabel } from '@/data/masterSizes';

interface DeliveryStatusEmailProps {
  orderNumber: string;
  customerName: string;
  status: 'shipped' | 'out_for_delivery' | 'cancelled';
  items: Array<{ name: string; size: string; quantity: number; price: number }>;
  totalPaise: number;
  courierPartner?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
}

export function DeliveryStatusEmail({
  orderNumber,
  customerName,
  status,
  items,
  totalPaise,
  courierPartner,
  trackingNumber,
  trackingUrl,
}: DeliveryStatusEmailProps) {
  const totalRupees = (totalPaise / 100).toFixed(2);
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/thegirlscollections';
  const resolvedTrackingUrl =
    trackingUrl ||
    (trackingNumber ? `https://shiprocket.co/tracking/${trackingNumber}` : 'https://www.thegirlscollections.com/track');

  let title = 'Order Update';
  let message = 'There is an update regarding your order.';

  if (status === 'shipped') {
    title = 'Your order has shipped!';
    message = 'Good news! Your order has been packed and handed over to our courier partner. It is now on its way to you.';
  } else if (status === 'out_for_delivery') {
    title = 'Out for Delivery Today';
    message = 'Get ready! Our delivery partner is out with your parcel and will arrive at your address today.';
  } else if (status === 'cancelled') {
    title = 'Order Cancelled';
    message = 'Your order has been cancelled. If a refund applies, our team will process it manually after verification.';
  }

  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        backgroundColor: '#FAF6EE',
        fontFamily: "'Nunito Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
        color: '#1A1A2E',
      }}
    >
      <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#FAF6EE', padding: '24px 12px' }}>
        <tr>
          <td align="center">
            <table
              width="600"
              cellPadding="0"
              cellSpacing="0"
              style={{
                maxWidth: '600px',
                width: '100%',
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                overflow: 'hidden',
                border: '1px solid #E8DCC8',
              }}
            >
              <tr>
                <td style={{ backgroundColor: '#1A1E3A', padding: '24px 28px', textAlign: 'center' }}>
                  <img src="https://www.thegirlscollections.com/logo.png?v=3" alt="The Girls Collections" width="120" style={{ display: 'inline-block', border: 'none' }} />
                </td>
              </tr>

              <tr>
                <td style={{ padding: '28px' }}>
                  <h1 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: 700, color: status === 'cancelled' ? '#B91C1C' : '#1A1E3A' }}>
                    {title}
                  </h1>
                  <p style={{ margin: '0 0 18px', fontSize: '14px', color: '#4A4A5A' }}>
                    Order <strong style={{ color: '#1A1E3A' }}>{orderNumber}</strong>
                  </p>
                  <p style={{ margin: '0 0 12px', fontSize: '15px', color: '#1A1A2E' }}>Hi {customerName},</p>
                  <p style={{ margin: '0 0 22px', fontSize: '15px', lineHeight: 1.6, color: '#4A4A5A' }}>{message}</p>

                  {status !== 'cancelled' && (courierPartner || trackingNumber) && (
                    <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: '22px' }}>
                      <tr>
                        <td style={{ backgroundColor: '#FAF6EE', border: '1px solid #E8DCC8', borderRadius: '10px', padding: '16px 18px' }}>
                          <p style={{ margin: '0 0 6px', fontSize: '11px', letterSpacing: '1.4px', textTransform: 'uppercase', color: '#6B6B7B', fontWeight: 700 }}>
                            Tracking Details
                          </p>
                          <p style={{ margin: '0 0 12px', fontSize: '14px', color: '#1A1A2E', lineHeight: 1.6 }}>
                            {courierPartner && <span><strong>Courier:</strong> {courierPartner}<br /></span>}
                            {trackingNumber && <span><strong>AWB Number:</strong> {trackingNumber}</span>}
                          </p>
                          <a
                            href={resolvedTrackingUrl}
                            style={{
                              display: 'inline-block',
                              backgroundColor: '#E0527F',
                              color: '#FFFFFF',
                              padding: '10px 18px',
                              borderRadius: '10px',
                              fontSize: '13px',
                              fontWeight: 700,
                              textDecoration: 'none',
                            }}
                          >
                            Track Your Parcel →
                          </a>
                        </td>
                      </tr>
                    </table>
                  )}

                  <p style={{ margin: '0 0 10px', fontSize: '11px', letterSpacing: '1.6px', textTransform: 'uppercase', color: '#6B6B7B', fontWeight: 700, borderBottom: '1px solid #EAE5DE', paddingBottom: '6px' }}>
                    Order Summary
                  </p>
                  <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: '16px' }}>
                    {items.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ padding: '8px 0', fontSize: '14px', color: '#1A1A2E' }}>
                          {item.name} ({getSizeLabel(item.size)}) × {item.quantity}
                        </td>
                        <td align="right" style={{ padding: '8px 0', fontSize: '14px', fontWeight: 700, color: '#1A1E3A' }}>
                          ₹{((item.price * item.quantity) / 100).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td style={{ padding: '10px 0 0', fontSize: '15px', fontWeight: 700, borderTop: '1px solid #EAE5DE' }}>Total</td>
                      <td align="right" style={{ padding: '10px 0 0', fontSize: '17px', fontWeight: 800, borderTop: '1px solid #EAE5DE' }}>₹{totalRupees}</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style={{ backgroundColor: '#FCFAF8', padding: '18px 28px', borderTop: '1px solid #EAE5DE', fontSize: '12px', color: '#4A4A5A', lineHeight: 1.6 }}>
                  <p style={{ margin: '0 0 4px' }}>
                    Need help? Email <a href={`mailto:${siteConfig.email}`} style={{ color: '#1A1E3A' }}>{siteConfig.email}</a> or call{' '}
                    <a href={`tel:${siteConfig.telLink}`} style={{ color: '#1A1E3A' }}>+91 {siteConfig.phone}</a>
                  </p>
                  <p style={{ margin: 0 }}>
                    Instagram: <a href={instagramUrl} style={{ color: '#E0527F', fontWeight: 700, textDecoration: 'none' }}>@thegirlscollections</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  );
}
