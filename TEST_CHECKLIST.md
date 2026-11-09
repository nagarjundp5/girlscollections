# Testing & Verification Checklist

## 1. Checkout Step 1: Details & Phone Verification
- [ ] **Saved Addresses (Returning User):** Sign in as returning user with saved addresses. Ensure saved address chips appear and clicking one auto-fills the name, phone, and full address.
- [ ] **Address Persistence:** Submit Step 1 with a new address while signed in; verify address is saved to Neon `addresses` table.
- [ ] **Cart Persistence in Neon:** Refresh or reopen `/checkout`; ensure cart is hydrated from Neon `user_carts` server-side without an empty flash.
- [ ] **Google Login OTP Gate:** Sign in via Google account with unverified phone; verify that "Continue" to payment is blocked until the mobile number is verified via OTP.
- [ ] **Mobile-OTP Login Skip:** Sign in via mobile phone OTP; verify phone is pre-marked as verified (`phone_verified = true`) and OTP step is skipped.

## 2. Payment Modes (Prepaid & COD Split)
- [ ] **Prepaid Happy Path:**
  - Create Razorpay order for the exact server-calculated total.
  - Complete payment on Razorpay.
  - Verify signature HMAC check on `/api/orders/verify-payment`.
  - Check Neon order: `status = 'confirmed'`, `payment_mode = 'prepaid'`, `advance_paid = 0`, `cod_balance = 0`.
- [ ] **COD Happy Path (Fixed ₹200 Advance):**
  - Select COD. Ensure UI clearly shows: "Pay ₹200 advance now, pay ₹(Total - 200) on delivery".
  - Pay ₹200 advance via Razorpay.
  - Verify order in Neon: `payment_mode = 'cod'`, `advance_paid = 20000` (paise), `cod_balance = (total - 20000)` (paise).
  - Verify that when Shiprocket order is created, the COD collectible amount sent is `cod_balance / 100`, NOT the full total.
- [ ] **COD Edge Case (Order Total ≤ ₹200):**
  - Add items totaling ≤ ₹200 after discounts.
  - Verify COD option is disabled with clear error message forcing prepaid.

## 3. New-User Offer (10% Off + Free Delivery)
- [ ] **Eligibility Check:** User with 0 prior confirmed orders (checked by `user_id` AND `customer_phone`) qualifies for 10% discount and free shipping.
- [ ] **Single Consumption:** Place and confirm first order. Verify subsequent orders do NOT receive the first-time offer.
- [ ] **Discount Math:** Both Prepaid and COD reflect:
  - `subtotal`
  - `discount` = 10% of subtotal
  - `delivery_fee` = ₹0
  - `total` = subtotal - discount
- [ ] **Tamper Resistance:** Modify client payload with fake discount or lower price; verify server strictly ignores client-sent amounts and recalculates from Neon DB.

## 4. Shiprocket via QStash (5-Minute Delay)
- [ ] **Delayed Dispatch:** On payment confirmation, QStash message is scheduled with `delay: 300s` (5 minutes) to `/api/qstash/shiprocket-create`.
- [ ] **QStash Signature Verification:** Reject any request to `/api/qstash/shiprocket-create` without valid Upstash signature.
- [ ] **Idempotency:** Replay the QStash webhook; verify it detects existing `shiprocket_order_id` and exits without duplicate fulfillment.
- [ ] **Cancellation Guard:** If user or admin cancels within the 5 minutes, QStash worker skips Shiprocket order creation and skips confirmation email.

## 5. Cancellation & Manual Refunds (Zero Auto-Refunds)
- [ ] **Customer Cancel Within 5 Minutes:**
  - Go to `/profile/orders/[id]` within 5 minutes of order placement.
  - Click "Cancel Order".
  - Verify order immediately transitions to `status = 'cancelled'`, `cancelled_by = 'user'`.
  - If prepaid or COD advance paid, verify `refund_status = 'pending'` and `refund_amount = advance_paid`.
  - Verify customer receives branded cancellation email stating refund is being processed.
- [ ] **Customer Cancel After 5 Minutes:**
  - After 5-minute window expires, "Cancel Order" button disappears; displays "Contact support to cancel".
- [ ] **Admin Cancellation:**
  - Cancel from `/api/admin/orders/[orderId]/cancel`.
  - If Shiprocket order exists, Shiprocket cancel API is called.
  - Audit log is recorded with admin email and timestamp.
- [ ] **Admin Refunds Queue (`/admin/refunds`):**
  - Pending refund appears at top with yellow count badge.
  - Admin clicks "Initiate Refund", enters Razorpay Refund ID -> status changes to `initiated`.
  - Admin clicks "Mark Completed" -> status changes to `completed`, `refunded_at` recorded.
  - Customer order details page updates live: "Refund initiated (Ref: ...)" -> "Refund completed".

## 6. Security & Role Isolation
- [ ] **Clerk Auth & Ownership Check:** Call `/api/orders/[orderId]/cancel` or `/profile/orders/[id]` with another user's session; verify 401/404 response.
- [ ] **Admin Allowlist Check:** Non-admin email is denied access to `/admin/*` pages and APIs.
- [ ] **Staff Role Isolation:** Staff users cannot view customer payment IDs or sales totals.
- [ ] **Rate Limiting:** Verify Upstash Redis rate-limits rapid-fire requests on checkout and cancellation endpoints.

