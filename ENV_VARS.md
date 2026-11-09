# Required Environment Variables

The following environment variables are required for The Girls Collections order, payment, and fulfillment pipeline:

## Database & Authentication
- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

## Payments (Razorpay)
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`

## Cache & Rate Limiting (Upstash Redis)
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

## Background Jobs & Orchestration (Upstash QStash)
- `QSTASH_URL`
- `QSTASH_TOKEN`
- `QSTASH_CURRENT_SIGNING_KEY`
- `QSTASH_NEXT_SIGNING_KEY`

## Emails & Notifications (Resend)
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

## Shipping & Logistics (Shiprocket)
- `SHIPROCKET_EMAIL`
- `SHIPROCKET_PASSWORD`
- `SHIPROCKET_WEBHOOK_SECRET`

## App Configuration
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_PHONE_EMAIL_CLIENT_ID`

