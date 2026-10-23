import Razorpay from 'razorpay';

const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || 'rzp_test_TZ9alONOVKNDqa';
const keySecret = process.env.RAZORPAY_KEY_SECRET || 'JK6Mbgl4cUYU9lfzbJ8e60Y3';

export const razorpay = keyId && keySecret
  ? new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })
  : null;

