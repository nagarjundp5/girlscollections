'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/cartStore';
import { getOptimizedImageUrl } from '@/lib/cloudinary';
import { ChevronLeft, Lock, CheckCircle, Package, ArrowRight, ShieldCheck, MapPin, Truck, RotateCcw, Check, UserCheck, Smartphone } from 'lucide-react';
import { useToast } from '@/components/ToastContainer';
import { useAuthSession } from '@/context/AuthContext';
import CheckoutCoupon from '@/components/CheckoutCoupon';
import TermsAndConditionsBox from '@/components/TermsAndConditionsBox';
import { ButterflyMotif } from '@/components/ui/Motifs';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getCartTotal, discountCode, clearCart, hasHydrated } = useCartStore();
  const { addToast } = useToast();
  const { isSignedIn, isLoaded, user, openAuthModal, refreshUser } = useAuthSession();

  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingProvider, setShippingProvider] = useState<'standard' | 'express'>('standard');
  const [currentStep, setCurrentStep] = useState(1);
  const [successOrderInfo, setSuccessOrderInfo] = useState<{ number: string; total: number } | null>(null);
  const [fulfillmentType, setFulfillmentType] = useState<'delivery' | 'pickup'>('delivery');

  // Phone OTP verification state
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
  const [verifiedPhoneToken, setVerifiedPhoneToken] = useState<string | null>(null);
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);

  // T&C Checkbox state on main checkout page
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Firestore draft checkout ID
  const draftIdRef = useRef<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let existingDraftId = sessionStorage.getItem('tgc_draft_checkout_id');
      if (!existingDraftId) {
        existingDraftId = `draft_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        sessionStorage.setItem('tgc_draft_checkout_id', existingDraftId);
      }
      draftIdRef.current = existingDraftId;
    }
  }, []);

  const [checkoutEligibility, setCheckoutEligibility] = useState<{
    borzoEligible: boolean;
    extraCharge: number;
    shiprocketAvailable: boolean;
    estimatedStandardDays: number;
  } | null>(null);
  const [checkingCheckoutEligibility, setCheckingCheckoutEligibility] = useState(false);

  const [storeConfig, setStoreConfig] = useState({
    razorpayActive: false,
    razorpayKeyId: '',
    freeShippingThreshold: 199900,
    defaultShippingCharge: 0,
    codFee: 0,
    whatsappNumber: '+917483848505',
    borzoCutoffStart: '11:00',
    borzoCutoffEnd: '16:00',
    blrPincodeRanges: '560001-560300',
    borzoSurcharge: 15000,
    borzoFreeThreshold: 149900,
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');

  // Draft Sync to Firestore for incomplete checkout tracking
  const syncDraftCheckout = (stepNum: number = 1, completed: boolean = false) => {
    if (!draftIdRef.current || items.length === 0) return;
    fetch('/api/checkout/draft-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        draftId: draftIdRef.current,
        customerInfo: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: {
            line1: formData.line1,
            line2: formData.line2,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
          },
        },
        items: items.map(i => ({ productId: i.id, name: i.name, size: i.size, quantity: i.quantity, price: i.price })),
        subtotal: getCartTotal(),
        verifiedPhone: verifiedPhone || null,
        step: stepNum,
        isCompleted: completed,
      }),
    }).catch(() => {});
  };

  const triggerCheckoutEligibilityCheck = async (pin: string) => {
    if (!/^\d{6}$/.test(pin)) return;
    setCheckingCheckoutEligibility(true);
    try {
      const res = await fetch(`/api/shipping/serviceability?pincode=${pin}`);
      if (res.ok) {
        const data = await res.json();
        setCheckoutEligibility(data);
        if (!data.borzoEligible) {
          setShippingProvider('standard');
        }
      } else {
        setCheckoutEligibility(null);
        setShippingProvider('standard');
      }
    } catch (err) {
      console.error('Checkout serviceability check failure:', err);
      setCheckoutEligibility(null);
      setShippingProvider('standard');
    } finally {
      setCheckingCheckoutEligibility(false);
    }
  };

  useEffect(() => {
    if (formData.pincode && formData.pincode.length === 6) {
      triggerCheckoutEligibilityCheck(formData.pincode);
    } else {
      setCheckoutEligibility(null);
    }
  }, [formData.pincode]);

  useEffect(() => {
    setMounted(true);
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/config');
        if (res.ok) {
          const data = await res.json();
          setStoreConfig(data);
          if (!data.razorpayActive) {
            setPaymentMethod('cod');
          }
        }
      } catch (err) {
        console.error('Failed to load store configurations:', err);
      }
    };
    fetchConfig();
  }, []);

  const normalisePhone = (raw: string | null | undefined): string => {
    if (!raw) return '';
    const s = raw.trim();
    if (s.startsWith('+91') && s.length === 13) return s.slice(3);
    if (s.startsWith('91') && s.length === 12) return s.slice(2);
    return s;
  };

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const cleanPhone = normalisePhone(user.phone);
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || cleanPhone,
      }));
      if (user.phoneVerified && user.phone) {
        setVerifiedPhone(cleanPhone || user.phone);
        setVerifiedPhoneToken('session_verified_phone');
      }
    }
  }, [isLoaded, isSignedIn, user]);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'PHONE_EMAIL_VERIFIED') {
        const token = event.data.accessToken;
        setIsVerifyingPhone(true);
        try {
          const phoneToVerify = formData.phone.trim();
          const res = await fetch('/api/auth/verify-phone', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: phoneToVerify,
              accessToken: token,
              notificationsOptIn: true,
            }),
          });
          const data = await res.json();
          if (res.ok && data.success) {
            setVerifiedPhone(normalisePhone(data.user.phone));
            setVerifiedPhoneToken('session_verified_phone');
            addToast('Mobile number verified successfully! ✓', 'success');
            await refreshUser();
            syncDraftCheckout(1, false);
          } else {
            addToast(data.error || 'Failed to verify phone OTP', 'error');
          }
        } catch (err) {
          console.error('Error verifying phone:', err);
          addToast('Error verifying phone verification token', 'error');
        } finally {
          setIsVerifyingPhone(false);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [formData.phone, addToast, refreshUser]);

  const startPhoneVerification = () => {
    const phoneToVerify = formData.phone.trim();
    if (!phoneToVerify || !/^[6-9]\d{9}$/.test(phoneToVerify)) {
      addToast('Please enter a valid 10-digit Indian mobile number.', 'error');
      return;
    }

    const finalClientId = process.env.NEXT_PUBLIC_PHONE_EMAIL_CLIENT_ID || '19014171169408573674';
    const redirectUrl = window.location.origin + '/phone-callback';
    const authUrl = `https://auth.phone.email/log-in?client_id=${finalClientId}&redirect_url=${encodeURIComponent(redirectUrl)}`;

    sessionStorage.setItem('pending_signup_phone', phoneToVerify);
    sessionStorage.setItem('pending_signup_name', formData.name || 'Customer');
    sessionStorage.setItem('auth_flow_origin', 'checkout');

    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    window.open(authUrl, 'phone_email_popup', `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    syncDraftCheckout(currentStep, false);
  };

  const calculateTotalBreakdown = () => {
    const subtotal = getCartTotal();
    let discount = 0;

    if (discountCode) {
      if (discountCode.discount_type === 'percent') {
        discount = Math.round(subtotal * (discountCode.discount_value / 100));
      } else {
        discount = discountCode.discount_value;
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - discount);
    const expressAvailable = fulfillmentType === 'delivery' && !!checkoutEligibility?.borzoEligible;
    const expressCharge = expressAvailable
      ? (discountedSubtotal >= (storeConfig.borzoFreeThreshold ?? 149900) ? 0 : (checkoutEligibility?.extraCharge ?? 150) * 100)
      : 0;

    let shippingCharge = 0;
    if (fulfillmentType === 'delivery') {
      if (shippingProvider === 'express' && expressAvailable) {
        shippingCharge = expressCharge;
      } else {
        shippingCharge = 0;
      }
    }

    return {
      subtotal,
      discount,
      shippingCharge,
      expressCharge,
      total: discountedSubtotal + shippingCharge,
    };
  };

  const loadRazorpaySDK = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  function isGibberishText(str: string): boolean {
    const clean = str.trim().toLowerCase();
    if (clean.length < 5) return true;
    if (/^(.)\1+$/.test(clean)) return true;
    const mashPatterns = ['asdf', 'sdfg', 'dfgh', 'fghj', 'ghjk', 'hjkl', 'qwert', 'werty', 'zxcv', 'test', 'aaaa', 'bbbb'];
    for (const pat of mashPatterns) {
      if (clean.includes(pat) && clean.length < 12) return true;
    }
    const words = clean.split(/[\s,.-]+/).filter(w => w.length > 0);
    if (words.length < 2) return true;
    return false;
  }

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) return addToast('Name is required', 'error');
    if (!formData.email.trim() || !formData.email.includes('@')) return addToast('Please enter a valid email address', 'error');
    if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) return addToast('Please enter a valid 10-digit Indian mobile number', 'error');

    const cleanPhone = formData.phone.trim();
    const normVerified = normalisePhone(verifiedPhone);
    const isMatched = normVerified === cleanPhone || verifiedPhone === cleanPhone || verifiedPhone === `+91${cleanPhone}`;
    if (!verifiedPhone || !isMatched) {
      return addToast('Please verify your mobile number via OTP before proceeding.', 'error');
    }

    if (fulfillmentType === 'delivery') {
      if (!formData.line1.trim() || isGibberishText(formData.line1)) {
        return addToast('Please enter a valid delivery address', 'error');
      }
      if (!formData.city.trim() || isGibberishText(formData.city + ' ' + formData.city)) {
        return addToast('Please enter a valid city name', 'error');
      }
      if (!formData.state.trim()) return addToast('State is required', 'error');
      if (!/^\d{6}$/.test(formData.pincode.trim())) return addToast('Please enter a valid 6-digit Indian PIN code', 'error');
    }

    if (!termsAccepted) {
      return addToast('Please accept the Terms & Conditions to proceed to payment.', 'error');
    }

    syncDraftCheckout(2, false);
    setCurrentStep(2);
    window.scrollTo(0, 0);
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    const breakdown = calculateTotalBreakdown();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15_000);

      let res: Response;
      try {
        res = await fetch('/api/orders/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            items: items.map((i) => ({ productId: i.id, size: i.size, quantity: i.quantity })),
            discountCode: discountCode?.code || undefined,
            paymentMethod: paymentMethod,
            fulfillmentType: fulfillmentType,
            shippingProvider: fulfillmentType === 'delivery' ? shippingProvider : undefined,
            verifiedPhone: verifiedPhone || undefined,
            verifiedPhoneToken: verifiedPhoneToken || undefined,
            customerInfo: {
              name: formData.name.trim(),
              email: formData.email.trim(),
              phone: formData.phone.trim(),
              address: fulfillmentType === 'delivery' ? {
                line1: formData.line1.trim(),
                line2: formData.line2 ? formData.line2.trim() : undefined,
                city: formData.city.trim(),
                state: formData.state.trim(),
                pincode: formData.pincode.trim(),
              } : null,
            },
          }),
        });
      } catch (fetchErr: any) {
        if (fetchErr?.name === 'AbortError') {
          throw new Error('Checkout timed out. Please try again.');
        }
        throw fetchErr;
      } finally {
        clearTimeout(timeoutId);
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to place order');
      }

      const orderData = await res.json();

      if (storeConfig.razorpayActive && orderData.razorpayOrderId) {
        const sdkLoaded = await loadRazorpaySDK();
        if (!sdkLoaded) {
          throw new Error('Payment gateway failed to load. Please try again.');
        }

        const isCodDeposit = paymentMethod === 'cod';

        const options = {
          key: storeConfig.razorpayKeyId,
          amount: orderData.amount,
          currency: 'INR',
          name: 'THE GIRLS COLLECTIONS',
          description: isCodDeposit ? '₹200 COD Deposit Payment' : 'Luxury Handcrafted Fashion Order',
          order_id: orderData.razorpayOrderId,
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone,
          },
          theme: {
            color: '#B4863C',
          },
          handler: async function (response: any) {
            setIsProcessing(true);
            try {
              const verifyRes = await fetch('/api/orders/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: orderData.orderId,
                }),
              });

              if (!verifyRes.ok) {
                const verifyError = await verifyRes.json();
                throw new Error(verifyError.error || 'Server signature verification failed');
              }

              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                syncDraftCheckout(2, true);
                addToast(isCodDeposit ? '₹200 COD deposit verified! Order confirmed.' : 'Payment successful! Order confirmed.', 'success');
                clearCart();
                router.push(`/order-confirmation/${orderData.orderId}`);
              }
            } catch (err: any) {
              console.error('Error during payment verification:', err);
              addToast(err.message || 'Payment verification failed', 'error');
            } finally {
              setIsProcessing(false);
            }
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
              addToast('Payment cancelled. Order not placed.', 'error');
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (resp: any) {
          setIsProcessing(false);
          addToast(`Payment failed: ${resp.error?.description || 'Declined'}`, 'error');
        });
        rzp.open();
        return;
      } else {
        syncDraftCheckout(2, true);
        addToast('Order placed. Redirecting to WhatsApp to complete details...', 'success');
        const itemsListText = items.map((i) => `• ${i.name} (Size: ${i.size}) x ${i.quantity}`).join('%0A');
        const messageText = `Hello The Girls Collections! I'd like to confirm my order.%0A%0A*Order Number:* ${orderData.orderNumber}%0A*Customer:* ${formData.name}%0A*Phone:* ${formData.phone}%0A*Address:* ${formData.line1 || 'Store Pickup'}, ${formData.city || 'Bengaluru'} - ${formData.pincode || '560064'}%0A%0A*Items:*%0A${itemsListText}%0A%0A*Total Amount:* ₹${(breakdown.total / 100).toFixed(2)}`;
        const whatsappUrl = `https://wa.me/${storeConfig.whatsappNumber.replace('+', '')}?text=${messageText}`;

        window.open(whatsappUrl, '_blank');
        clearCart();
        router.push(`/order-confirmation/${orderData.orderId}`);
      }

    } catch (error: any) {
      console.error(error);
      addToast(error.message || 'Failed to place order. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // HYDRATION & MOUNTED CHECK — Fixes empty cart flash bug completely
  if (!mounted || !hasHydrated || !isLoaded) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-ivory text-navy space-y-4">
        <Image
          src="/logo.webp"
          alt="The Girls Collections Logo"
          width={140}
          height={150}
          priority
          className="h-16 w-auto object-contain animate-pulse"
        />
        <span className="font-serif font-bold tracking-widest text-xs uppercase text-navy">Loading Secure Checkout...</span>
      </div>
    );
  }

  if (currentStep === 3 && successOrderInfo) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in bg-ivory text-navy">
        <div className="w-16 h-16 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-navy mb-3">Order Confirmed</h1>
        <p className="text-charcoal-muted mb-8 max-w-md mx-auto text-sm">
          Thank you for choosing The Girls Collections. Your order <span className="text-navy font-bold">{successOrderInfo.number}</span> has been successfully logged.
        </p>
        <div className="bg-white border border-zariGold/30 rounded-2xl p-6 w-full max-w-sm mb-8 shadow-md">
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-charcoal-muted font-medium text-xs">Total Amount</span>
            <span className="text-navy font-bold font-sans">₹{successOrderInfo.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-charcoal-muted font-medium text-xs">Status</span>
            <span className={paymentMethod === 'cod' ? 'text-amber-600 font-bold text-xs' : 'text-emerald-700 font-bold text-xs'}>
              {paymentMethod === 'cod' ? 'COD - Pending' : 'Paid'}
            </span>
          </div>
        </div>
        <div className="flex gap-4">
          <Link href="/shop" className="bg-navy text-ivory px-8 py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-navy/90 transition-colors shadow-md">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center bg-ivory text-navy">
        <Package className="w-16 h-16 text-zariGold/40 mb-6" />
        <h2 className="text-2xl font-serif font-bold text-navy mb-3">Your Cart is Empty</h2>
        <p className="text-charcoal-muted mb-8 max-w-sm mx-auto text-xs">
          Explore our handcrafted sarees, lehengas, and kids collections to start shopping.
        </p>
        <Link href="/shop" className="bg-navy text-ivory px-8 py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-navy/90 transition-colors shadow-md">
          Explore Shop
        </Link>
      </div>
    );
  }

  const { subtotal, discount, shippingCharge, total } = calculateTotalBreakdown();

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 bg-ivory text-navy">
      {/* Checkout Top Navigation Bar */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-zariGold/20">
        <button
          onClick={() => {
            if (currentStep === 2) setCurrentStep(1);
          }}
          className={`inline-flex items-center text-xs font-bold uppercase tracking-wider transition-colors ${
            currentStep === 1 ? 'text-charcoal-muted' : 'text-navy hover:text-zariGold cursor-pointer'
          }`}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="w-4 h-4 mr-1 text-zariGold" />
          {currentStep === 2 ? 'Back to Order Details' : 'Checkout'}
        </button>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 text-xs font-bold font-mono tracking-widest">
          <span className={currentStep === 1 ? 'text-navy font-bold' : 'text-charcoal-muted'}>01 Details</span>
          <span className="text-zariGold/40">/</span>
          <span className={currentStep === 2 ? 'text-navy font-bold' : 'text-charcoal-muted'}>02 Payment</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Form Details & Mobile Verification */}
        <div className="lg:col-span-7 xl:col-span-8">
          {/* Optional Compact Inline Sign-In Banner if user is not authenticated yet */}
          {!isSignedIn && (
            <div className="mb-6 bg-[#FFF0F3] border border-[#F4C2CE] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-full bg-white border border-rose-200 flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5 text-rose-700" />
                </div>
                <div>
                  <h4 className="text-xs font-serif font-bold text-[#581825]">Already have an account?</h4>
                  <p className="text-[11px] text-[#7A3E4D]">Sign in to auto-fill saved addresses &amp; member perks.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => openAuthModal('google')}
                  className="flex-1 sm:flex-none bg-white hover:bg-white/80 text-[#581825] border border-rose-200 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                >
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal('phone')}
                  className="flex-1 sm:flex-none bg-[#4A111E] hover:bg-[#380C16] text-white px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-xs flex items-center justify-center gap-1"
                >
                  <Smartphone className="w-3.5 h-3.5 text-white" /> Phone
                </button>
              </div>
            </div>
          )}

          {currentStep === 1 ? (
            <form onSubmit={handleProceedToPayment} className="space-y-8 animate-fade-in">
              {/* 1. Contact & Mobile Verification Section */}
              <section className="bg-white border border-zariGold/30 rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="text-base font-serif font-bold text-navy border-b border-zariGold/20 pb-3 flex items-center justify-between">
                  <span>1. Contact Info &amp; Mobile Verification</span>
                  {verifiedPhone ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md font-sans font-bold">
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Verified
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-bold">
                      OTP Required
                    </span>
                  )}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-navy font-bold block">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Nagarjun D P"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-ivory border border-zariGold/30 text-navy px-4 py-3 text-xs focus:outline-none focus:border-zariGold rounded-xl font-sans"
                    />
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-navy font-bold block">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="e.g. user@domain.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-ivory border border-zariGold/30 text-navy px-4 py-3 text-xs focus:outline-none focus:border-zariGold rounded-xl font-sans"
                    />
                  </div>

                  {/* Inline Mobile Number Section */}
                  <div className="space-y-1.5 md:col-span-2 pt-1">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-navy font-bold block">
                      Mobile Phone Number (for order updates &amp; delivery) *
                    </label>

                    {verifiedPhone ? (
                      <div className="bg-emerald-50/80 border border-emerald-300/80 p-3.5 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-mono text-xs font-bold text-emerald-900">+91 {formData.phone || verifiedPhone}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-200/60 text-emerald-800 px-2 py-0.5 rounded">
                            Verified
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setVerifiedPhone(null); setVerifiedPhoneToken(null); }}
                          className="text-[11px] text-navy font-semibold underline hover:text-zariGold transition-colors"
                        >
                          Change number
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="relative flex">
                          <span className="bg-sand/30 border border-r-0 border-zariGold/30 text-navy font-bold px-3.5 py-3 text-xs flex items-center font-mono rounded-l-xl select-none">
                            +91
                          </span>
                          <input
                            type="tel"
                            name="phone"
                            required
                            maxLength={10}
                            placeholder="Enter 10-digit mobile number"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full bg-ivory border border-zariGold/30 text-navy px-4 py-3 text-xs focus:outline-none focus:border-zariGold font-mono rounded-r-xl tracking-wider shadow-xs"
                          />
                          <button
                            type="button"
                            onClick={startPhoneVerification}
                            disabled={isVerifyingPhone}
                            className="absolute right-2 top-1.5 bg-zariGold hover:bg-zariGold/90 text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-2 cursor-pointer transition-colors rounded-lg shadow-xs disabled:opacity-50"
                          >
                            {isVerifyingPhone ? 'Verifying…' : 'Verify'}
                          </button>
                        </div>
                        <p className="text-[10px] text-amber-700 font-sans leading-tight">
                          * Click Verify to receive a quick 1-tap SMS OTP confirmation.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* 2. Fulfillment Method */}
              <section className="bg-white border border-zariGold/30 rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="text-base font-serif font-bold text-navy border-b border-zariGold/20 pb-3">
                  2. Fulfillment Method
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFulfillmentType('delivery')}
                    className={`p-4 rounded-xl border font-bold uppercase tracking-wider text-xs transition-all flex flex-col items-center gap-2 ${
                      fulfillmentType === 'delivery'
                        ? 'border-zariGold bg-blush/20 text-navy shadow-xs'
                        : 'border-zariGold/20 bg-ivory/40 text-charcoal-muted hover:border-zariGold/40'
                    }`}
                  >
                    <Package className="w-5 h-5 text-zariGold" />
                    <span>Home Delivery</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFulfillmentType('pickup')}
                    className={`p-4 rounded-xl border font-bold uppercase tracking-wider text-xs transition-all flex flex-col items-center gap-2 ${
                      fulfillmentType === 'pickup'
                        ? 'border-zariGold bg-blush/20 text-navy shadow-xs'
                        : 'border-zariGold/20 bg-ivory/40 text-charcoal-muted hover:border-zariGold/40'
                    }`}
                  >
                    <MapPin className="w-5 h-5 text-zariGold" />
                    <span>Store Pickup</span>
                  </button>
                </div>
              </section>

              {/* 3. Shipping Address */}
              {fulfillmentType === 'delivery' ? (
                <section className="bg-white border border-zariGold/30 rounded-2xl p-6 shadow-sm space-y-4">
                  <h2 className="text-base font-serif font-bold text-navy border-b border-zariGold/20 pb-3">
                    3. Shipping Address
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[11px] font-mono uppercase tracking-wider text-navy font-bold block">Address Line 1 *</label>
                      <input
                        type="text"
                        name="line1"
                        required
                        placeholder="Street address, house no, building"
                        value={formData.line1}
                        onChange={handleInputChange}
                        className="w-full bg-ivory border border-zariGold/30 text-navy px-4 py-3 text-xs focus:outline-none focus:border-zariGold rounded-xl"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[11px] font-mono uppercase tracking-wider text-navy font-bold block">Apartment / Suite (Optional)</label>
                      <input
                        type="text"
                        name="line2"
                        placeholder="Apartment, suite, unit, floor"
                        value={formData.line2}
                        onChange={handleInputChange}
                        className="w-full bg-ivory border border-zariGold/30 text-navy px-4 py-3 text-xs focus:outline-none focus:border-zariGold rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono uppercase tracking-wider text-navy font-bold block">City *</label>
                      <input
                        type="text"
                        name="city"
                        required
                        placeholder="e.g. Bengaluru"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full bg-ivory border border-zariGold/30 text-navy px-4 py-3 text-xs focus:outline-none focus:border-zariGold rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono uppercase tracking-wider text-navy font-bold block">State *</label>
                      <input
                        type="text"
                        name="state"
                        required
                        placeholder="e.g. Karnataka"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full bg-ivory border border-zariGold/30 text-navy px-4 py-3 text-xs focus:outline-none focus:border-zariGold rounded-xl"
                      />
                    </div>
                    <div className="space-y-1 font-mono">
                      <label className="text-[11px] font-mono uppercase tracking-wider text-navy font-bold block">PIN Code (6-digit) *</label>
                      <input
                        type="text"
                        name="pincode"
                        required
                        maxLength={6}
                        placeholder="e.g. 560064"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        className="w-full bg-ivory border border-zariGold/30 text-navy px-4 py-3 text-xs focus:outline-none focus:border-zariGold rounded-xl"
                      />
                    </div>
                  </div>
                </section>
              ) : (
                <section className="bg-white border border-zariGold/30 rounded-2xl p-6 shadow-sm space-y-3">
                  <h2 className="text-base font-serif font-bold text-navy border-b border-zariGold/20 pb-2">Store Collection Details</h2>
                  <p className="text-xs text-navy font-bold">The Girls Collections Boutique Store</p>
                  <p className="text-xs text-charcoal-muted leading-relaxed">
                    1st Floor, Maruthi Nagar, Yelahanka, Bengaluru, Karnataka - 560064
                  </p>
                </section>
              )}

              {/* Terms & Conditions Checkbox Row */}
              <div className="bg-white border border-zariGold/30 rounded-2xl p-4 shadow-sm flex items-start gap-3">
                <input
                  type="checkbox"
                  id="main-checkout-terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 h-4.5 w-4.5 rounded border-zariGold/40 text-zariGold focus:ring-zariGold accent-zariGold cursor-pointer"
                />
                <label htmlFor="main-checkout-terms" className="text-xs text-navy leading-relaxed cursor-pointer select-none">
                  I agree to The Girls Collections{' '}
                  <Link href="/policies/terms-and-conditions" target="_blank" className="font-bold underline text-zariGold">
                    Terms &amp; Conditions
                  </Link>{' '}
                  &amp;{' '}
                  <Link href="/policies/privacy-policy" target="_blank" className="font-bold underline text-zariGold">
                    Privacy Policy
                  </Link>.
                </label>
              </div>

              {/* Proceed to Payment CTA */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={!verifiedPhone || !termsAccepted}
                  className="w-full bg-navy hover:bg-navy/90 text-ivory py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Proceed to Payment Method</span>
                  <ArrowRight className="w-4 h-4 text-zariGold" />
                </button>

                {/* Single Compact Horizontal Trust Strip */}
                <div className="flex items-center justify-center gap-4 sm:gap-6 text-[11px] text-charcoal-muted font-sans py-2 border-t border-zariGold/10">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-zariGold" /> Express Shipping
                  </span>
                  <span className="flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-zariGold" /> 7-Day Returns
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-zariGold" /> 100% Encrypted
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-zariGold" /> Privacy Protected
                  </span>
                </div>
              </div>
            </form>
          ) : (
            /* Step 2: Payment Method Selection */
            <div className="space-y-8 animate-fade-in">
              <section className="bg-white border border-zariGold/30 rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="text-base font-serif font-bold text-navy border-b border-zariGold/20 pb-3">
                  Select Payment Method
                </h2>

                <div className="space-y-4">
                  {/* Prepaid Razorpay */}
                  <label className={`flex items-start gap-4 p-5 rounded-xl border transition-all cursor-pointer ${
                    paymentMethod === 'razorpay' ? 'border-zariGold bg-blush/20 shadow-xs' : 'border-zariGold/20 bg-ivory/30'
                  }`}>
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                      className="mt-1 accent-zariGold"
                    />
                    <div className="flex-1">
                      <span className="font-serif font-bold text-sm block text-navy">
                        Online Payment — UPI / Credit Card / Debit Card / NetBanking
                      </span>
                      <span className="text-xs text-charcoal-muted mt-1 block">
                        Fast, 100% encrypted online payment via Razorpay.
                      </span>
                    </div>
                  </label>

                  {/* Cash on Delivery (COD) */}
                  <label className={`flex items-start gap-4 p-5 rounded-xl border transition-all cursor-pointer ${
                    paymentMethod === 'cod' ? 'border-zariGold bg-blush/20 shadow-xs' : 'border-zariGold/20 bg-ivory/30'
                  }`}>
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="mt-1 accent-zariGold"
                    />
                    <div className="flex-1">
                      <span className="font-serif font-bold text-sm block text-navy">
                        Cash on Delivery (COD)
                      </span>
                      <span className="text-xs text-charcoal-muted mt-1 block">
                        Pay in cash upon doorstep delivery across India.
                      </span>
                    </div>
                  </label>
                </div>
              </section>

              {/* Final Place Order Button & Single Compact Trust Strip */}
              <div className="space-y-3">
                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="w-full bg-navy hover:bg-navy/90 text-ivory py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessing ? (
                    'Processing Order...'
                  ) : paymentMethod === 'razorpay' && storeConfig.razorpayActive ? (
                    `Pay ₹${(total / 100).toFixed(2)}`
                  ) : (
                    'Confirm & Place Order'
                  )}
                  {!isProcessing && <Lock className="w-4 h-4 text-zariGold" />}
                </button>

                {/* Single Compact Horizontal Trust Strip */}
                <div className="flex items-center justify-center gap-4 sm:gap-6 text-[11px] text-charcoal-muted font-sans py-2 border-t border-zariGold/10">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-zariGold" /> Express Shipping
                  </span>
                  <span className="flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-zariGold" /> 7-Day Returns
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-zariGold" /> 100% Encrypted
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-zariGold" /> Privacy Protected
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Items Summary Sidebar */}
        <div className="lg:col-span-5 xl:col-span-4 sticky top-24">
          <div className="bg-white border border-zariGold/30 rounded-2xl p-6 shadow-xl space-y-6">
            <h2 className="text-base font-serif font-bold text-navy border-b border-zariGold/20 pb-3">
              Order Items Summary
            </h2>

            <div className="space-y-4 max-h-[35vh] overflow-y-auto no-scrollbar pr-1">
              {items.map((item) => {
                const rawImg = item.image || (item as any).images?.[0] || (item as any).image_url || '';
                const displayImg = rawImg ? getOptimizedImageUrl(rawImg, 200) : '';

                return (
                  <div key={`${item.id}-${item.size}`} className="flex gap-4 items-center">
                    <div className="w-16 h-20 bg-sand/20 rounded-xl overflow-hidden shrink-0 relative border border-zariGold/20 flex items-center justify-center">
                      {displayImg ? (
                        <img
                          src={displayImg}
                          alt={item.name}
                          className="absolute inset-0 w-full h-full object-cover object-top"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : null}
                      <ButterflyMotif className="w-6 h-6 text-zariGold/50" />
                      <div className="absolute top-1 right-1 bg-navy text-ivory w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold z-10 shadow-xs">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-serif font-bold text-navy truncate">{item.name}</h4>
                      <p className="text-[11px] text-charcoal-muted mt-0.5">Size: <span className="font-bold text-navy">{item.size}</span></p>
                      <p className="text-xs font-sans font-bold text-zariGold mt-1">
                        ₹{((item.price * item.quantity) / 100).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <CheckoutCoupon subtotal={subtotal} />

            <div className="border-t border-zariGold/20 pt-4 space-y-2.5 text-xs font-sans">
              <div className="flex justify-between text-charcoal-muted">
                <span>Subtotal</span>
                <span className="font-bold text-navy">₹{(subtotal / 100).toLocaleString('en-IN', { minimumFractionDigits: 0 })}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-md">
                  <span>Discount ({discountCode?.code})</span>
                  <span className="font-bold">-₹{(discount / 100).toLocaleString('en-IN', { minimumFractionDigits: 0 })}</span>
                </div>
              )}

              <div className="flex justify-between text-charcoal-muted">
                <span>Shipping</span>
                <span className="font-bold text-emerald-700 uppercase tracking-wider text-[11px]">
                  {shippingCharge === 0 ? 'FREE' : `₹${(shippingCharge / 100).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`}
                </span>
              </div>

              <div className="pt-3 border-t border-zariGold/20 flex justify-between items-center mt-2">
                <span className="text-navy font-bold text-sm">Total</span>
                <span className="text-navy font-serif font-bold text-xl">
                  ₹{(total / 100).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
