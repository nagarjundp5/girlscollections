'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useShop } from '@/context/ShopContext';
import { MOCK_PRODUCTS } from '@/data/shopData';
import OfferCard from '@/components/ui/OfferCard';
import {
  CloseIcon,
  TrashIcon,
  ShoppingBagIcon,
  TruckIcon,
  CheckIcon,
} from '@/components/ui/BrandIcons';
import { Plus, Minus, ArrowRight, ShieldCheck } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    cartSubtotal,
    cartCount,
    freeShippingProgress,
    amountNeededForFreeShipping,
    addToCart,
  } = useShop();

  const formatPrice = (priceInPaiseOrRupees: number) => {
    const rupees = priceInPaiseOrRupees > 100000 ? Math.round(priceInPaiseOrRupees / 100) : priceInPaiseOrRupees;
    return `₹${rupees.toLocaleString('en-IN')}`;
  };

  // Recommended products for the in-drawer carousel
  const recommendedProducts = MOCK_PRODUCTS.slice(0, 4);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-[110] overflow-hidden select-none">
          {/* Backdrop with Soft Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-navy/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Drawer Panel Sliding in from Right with Spring Easing */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 pointer-events-none z-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: '0%' }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-screen max-w-full sm:max-w-md bg-ivory text-navy shadow-2xl flex flex-col justify-between border-l border-roseGold/30 pointer-events-auto"
            >
              {/* TOP HEADER ROW */}
              <div className="px-5 sm:px-6 pt-[calc(1.25rem+env(safe-area-inset-top,0px))] pb-4 border-b border-roseGold/20 flex items-center justify-between bg-ivory shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-roseGold/15 border border-roseGold/30 flex items-center justify-center text-roseGold">
                    <ShoppingBagIcon className="w-4 h-4 text-roseGold" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-serif font-semibold text-navy">
                    Your Bag <span className="text-sm font-sans font-medium text-roseGold font-tnum">({cartCount})</span>
                  </h2>
                </div>

                {/* Custom Vector Close Button */}
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-8 h-8 rounded-full border border-roseGold/30 hover:border-roseGold hover:bg-roseGold/10 flex items-center justify-center text-navy transition-all active:scale-95 cursor-pointer"
                  aria-label="Close cart"
                >
                  <CloseIcon className="w-4 h-4 text-navy" />
                </button>
              </div>

              {/* FREE SHIPPING PROGRESS BAR */}
              <div className="px-5 sm:px-6 py-2.5 bg-sand/30 border-b border-roseGold/20 shrink-0">
                <div className="flex items-center justify-between text-xs font-sans text-navy mb-1.5">
                  <div className="flex items-center space-x-1.5 font-medium truncate mr-2">
                    <TruckIcon className="w-3.5 h-3.5 text-roseGold shrink-0" />
                    <span className="truncate">
                      {amountNeededForFreeShipping > 0
                        ? `Add ₹${amountNeededForFreeShipping.toLocaleString('en-IN')} more for FREE Shipping!`
                        : '🎉 Unlocked FREE Pan-India Shipping!'}
                    </span>
                  </div>
                  <span className="font-bold text-roseGold shrink-0">{freeShippingProgress}%</span>
                </div>
                <div className="w-full bg-ivory rounded-full h-1.5 overflow-hidden border border-roseGold/20">
                  <div
                    className="bg-gold-gradient h-full rounded-full transition-all duration-500"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>

              {/* DRAWER CONTENT (Scrollable line items + Offers + Carousel) */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
                {cart.length === 0 ? (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-sand/40 border border-roseGold/30 text-roseGold flex items-center justify-center mx-auto shadow-xs">
                      <ShoppingBagIcon className="w-8 h-8 text-roseGold" />
                    </div>
                    <h3 className="text-xl font-serif font-bold text-navy">Your Bag is Empty</h3>
                    <p className="text-xs sm:text-sm font-sans text-navy/70 max-w-xs mx-auto leading-relaxed">
                      Discover our handcrafted anarkalis, pattu frocks, and festive ethnic wear.
                    </p>
                    <Link
                      href="/shop"
                      onClick={() => setIsCartOpen(false)}
                      className="inline-flex items-center justify-center px-6 py-3 rounded-md btn-gold-gradient text-xs font-sans font-bold uppercase tracking-[0.2em] shadow-md transition-transform active:scale-95"
                    >
                      <span>Explore Collection</span>
                      <ArrowRight className="w-4 h-4 ml-2 text-white" />
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* LINE ITEMS LIST */}
                    <div className="space-y-3.5">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="flex space-x-3.5 p-3 rounded-xl bg-white/90 border border-roseGold/20 shadow-xs transition-all hover:border-roseGold/40"
                        >
                          {/* Product Thumbnail with subtle blush/gold hairline border */}
                          <div className="relative w-18 h-22 sm:w-20 sm:h-24 rounded-xl overflow-hidden shrink-0 border border-roseGold/30 shadow-2xs">
                            {item.product.images && item.product.images[0] ? (
                              <Image
                                src={item.product.images[0]}
                                alt={item.product.name}
                                fill
                                className="object-cover object-top"
                              />
                            ) : (
                              <div className="w-full h-full bg-sand/30 flex items-center justify-center text-roseGold font-serif font-bold text-lg">
                                TGC
                              </div>
                            )}
                          </div>

                          <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                            <div>
                              <div className="flex justify-between items-start">
                                <h4 className="text-xs sm:text-sm font-sans font-medium text-navy line-clamp-1 max-w-[160px] sm:max-w-[180px]">
                                  {item.product.name}
                                </h4>
                                {/* Custom Vector Trash Icon */}
                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="text-navy/40 hover:text-oxblood p-1 transition-colors active:scale-90"
                                  title="Remove item"
                                >
                                  <TrashIcon className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className="text-[11px] text-navy/60 space-x-1.5 mt-0.5 font-sans">
                                <span>Size: <strong className="text-navy font-semibold">{item.selectedSize}</strong></span>
                                {item.selectedColor && (
                                  <>
                                    <span>•</span>
                                    <span>Color: <strong className="text-navy font-semibold">{item.selectedColor}</strong></span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex justify-between items-center mt-2">
                              {/* Rose-Gold Accent Quantity Stepper */}
                              <div className="flex items-center border border-roseGold/40 rounded-lg px-2 py-0.5 bg-ivory">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="text-navy hover:text-roseGold p-0.5 transition-colors"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="px-2.5 text-xs font-bold text-navy font-tnum">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="text-navy hover:text-roseGold p-0.5 transition-colors"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <div className="text-xs sm:text-sm font-bold text-navy font-tnum">
                                {formatPrice(item.product.price * item.quantity)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* OFFER / COUPON BLOCK */}
                    <div className="pt-1">
                      <OfferCard
                        code="TGC10"
                        headline="New to TGC? Get 10% off"
                        subtext="Use code at checkout for instant savings"
                        compact
                      />
                    </div>
                  </>
                )}

                {/* "YOU MAY ALSO LIKE" CAROUSEL (Fills empty space smoothly) */}
                <div className="pt-2 border-t border-roseGold/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-sans font-bold uppercase tracking-[0.14em] text-navy">
                      You May Also Like
                    </h3>
                    <span className="text-[10px] font-sans text-roseGold font-medium">Curated for you</span>
                  </div>

                  <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-1">
                    {recommendedProducts.map((prod, idx) => (
                      <motion.div
                        key={prod.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: 0.1 + idx * 0.06,
                          type: 'spring',
                          stiffness: 260,
                          damping: 20,
                        }}
                        className="snap-start shrink-0 w-[125px] sm:w-[135px] bg-white rounded-xl p-2 border border-roseGold/20 shadow-2xs flex flex-col justify-between group"
                      >
                        <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden mb-2 bg-sand/20">
                          <Image
                            src={prod.images[0]}
                            alt={prod.name}
                            fill
                            className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                            sizes="135px"
                          />
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-[11px] font-sans font-medium text-navy line-clamp-1 group-hover:text-roseGold transition-colors">
                            {prod.name}
                          </h4>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-navy font-tnum">
                              ₹{prod.price.toLocaleString('en-IN')}
                            </span>
                            <button
                              onClick={() => addToCart(prod, prod.sizes[0]?.size || 'Free Size')}
                              className="px-2 py-0.5 rounded-md bg-roseGold/15 hover:bg-roseGold text-roseGold hover:text-white text-[10px] font-bold uppercase transition-all active:scale-95"
                              title="Add to bag"
                            >
                              + Add
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* STICKY FOOTER WITH SUBTOTAL & CHECKOUT CTA */}
              {cart.length > 0 && (
                <div className="p-4 sm:p-6 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] border-t border-roseGold/20 bg-ivory space-y-3 shrink-0 shadow-lg">
                  <div className="space-y-1.5 text-xs font-sans">
                    <div className="flex justify-between text-navy/70">
                      <span>Subtotal</span>
                      <span className="font-bold text-navy font-tnum">{formatPrice(cartSubtotal)}</span>
                    </div>
                    <div className="flex justify-between text-navy/70">
                      <span>Shipping</span>
                      <span className="font-bold text-roseGold">
                        {amountNeededForFreeShipping === 0 ? 'FREE' : 'Calculated at Checkout'}
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-serif font-bold text-navy pt-2 border-t border-roseGold/20">
                      <span>Total</span>
                      <span className="text-roseGold font-tnum">{formatPrice(cartSubtotal)}</span>
                    </div>
                  </div>

                  {/* Checkout Button with Press Micro-Interaction */}
                  <Link
                    href="/checkout"
                    onClick={() => setIsCartOpen(false)}
                    className="w-full py-3.5 rounded-xl btn-gold-gradient text-xs font-sans font-bold uppercase tracking-[0.2em] shadow-lg flex items-center justify-center space-x-2 transition-transform active:scale-[0.98] cursor-pointer"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </Link>

                  <div className="flex items-center justify-center space-x-1.5 text-[10.5px] text-navy/60 pt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-roseGold" />
                    <span>100% Secure Checkout • Cash on Delivery Available</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
