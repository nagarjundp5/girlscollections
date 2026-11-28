'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Product } from '@/data/shopData';
import { useCartStore } from '@/lib/cartStore';
import { haptic } from '@/lib/haptics';
import { useToast } from '@/components/ToastContainer';

export interface CartItem {
  id: string; // unique cart item id: product.id + size + color
  product: Product;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

interface ShopContextType {
  cart: CartItem[];
  wishlist: string[]; // product IDs
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  addToCart: (product: Product, size: string, color?: string, quantity?: number) => void | Promise<void>;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, newQty: number) => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  cartSubtotal: number;
  cartCount: number;
  freeShippingThreshold: number;
  freeShippingProgress: number; // percentage 0 - 100
  amountNeededForFreeShipping: number;
  clearCart: () => void;
}

const FREE_SHIPPING_LIMIT = 1999; // ₹1,999 free shipping threshold

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { addToast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wishlistTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const hasHydratedRef = useRef(false);

  // Load cart and wishlist from localStorage on initial render
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('tgc_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
      const savedWishlist = localStorage.getItem('tgc_wishlist');
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
    } catch (e) {
      console.error('Failed to parse cart/wishlist from localStorage', e);
    }
  }, []);

  // Sync ShopContext cart to both localStorage and useCartStore (the single source of truth for checkout)
  useEffect(() => {
    try {
      localStorage.setItem('tgc_cart', JSON.stringify(cart));

      // Sync to useCartStore so checkout and cart pages read the exact same items
      const cartStoreItems = cart.map((item) => {
        const matchingSize = (item.product.sizes || []).find((s: any) => (typeof s === 'string' ? s : s.size) === item.selectedSize) as any;
        const unitPriceRupees = matchingSize?.price || item.product.price;
        const availableStock = matchingSize?.inStock !== false ? 10 : 0;

        return {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          price: unitPriceRupees > 10000 ? unitPriceRupees : unitPriceRupees * 100, // ensure price in paise
          image: item.product.images[0] || '',
          size: item.selectedSize,
          quantity: item.quantity,
          stock_quantity: { [item.selectedSize]: availableStock },
        };
      });

      useCartStore.setState({ items: cartStoreItems, hasHydrated: true });

      // Debounced DB sync (1.5s) for logged-in users only
      if (isSignedIn && hasHydratedRef.current) {
        if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
        syncTimerRef.current = setTimeout(() => {
          const payloadItems = cartStoreItems.map((ci) => ({
            productId: ci.id,
            size: ci.size,
            quantity: ci.quantity,
            price: ci.price,
            title: ci.name,
            image: ci.image,
            slug: ci.slug,
          }));
          fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: payloadItems }),
          }).catch(() => {});
        }, 1500);
      }
      hasHydratedRef.current = true;
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart, isSignedIn]);

  // Sync wishlist with Firestore when signed in (merge guest localStorage list then clear it)
  useEffect(() => {
    if (!authLoaded || !isSignedIn) return;
    let cancelled = false;
    (async () => {
      try {
        let localIds: string[] = [];
        try {
          const raw = localStorage.getItem('tgc_wishlist');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) localIds = parsed.filter((id) => typeof id === 'string');
          }
        } catch {}

        if (localIds.length > 0) {
          await fetch('/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productIds: localIds }),
          }).catch(() => {});
          try {
            localStorage.removeItem('tgc_wishlist');
          } catch {}
        }

        const res = await fetch('/api/wishlist?idsOnly=true');
        if (res.ok && !cancelled) {
          const data = await res.json();
          if (Array.isArray(data.productIds)) {
            setWishlist(data.productIds);
          }
        }
      } catch (err) {
        console.warn('[ShopContext] Wishlist sync note:', err);
      }
    })();
    return () => { cancelled = true; };
  }, [authLoaded, isSignedIn]);

  // Save guest wishlist to localStorage only when not signed in
  useEffect(() => {
    if (isSignedIn) return;
    try {
      localStorage.setItem('tgc_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist to localStorage', e);
    }
  }, [wishlist, isSignedIn]);

  const addToCart = async (product: Product, size: string, color?: string, quantity = 1) => {
    const selectedColor = color || (product.colors?.[0]?.name ?? 'Standard');
    const itemId = `${product.id}-${size}-${selectedColor}`;

    // Live Neon stock check on Add to Bag
    try {
      const res = await fetch(`/api/stock/check?productId=${encodeURIComponent(product.id)}&size=${encodeURIComponent(size)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.inStock === false) {
          alert(`Sorry, "${product.name}" in size ${size} is currently out of stock.`);
          return;
        }
      }
    } catch (stockErr) {
      console.warn('[addToCart] Stock check warning:', stockErr);
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        return prev.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          id: itemId,
          product,
          selectedSize: size,
          selectedColor,
          quantity,
        },
      ];
    });

    // Auto open cart drawer when adding item + haptic feedback
    haptic('success');
    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity: newQty } : item))
    );
  };

  const toggleWishlist = (productId: string) => {
    const currentlyLiked = wishlist.includes(productId);
    const nextLiked = !currentlyLiked;

    // Optimistic update
    setWishlist((prev) =>
      currentlyLiked ? prev.filter((id) => id !== productId) : (prev.includes(productId) ? prev : [productId, ...prev])
    );

    if (!isSignedIn) return;

    // Debounce rapid taps per product before syncing to Firestore API
    if (wishlistTimersRef.current[productId]) {
      clearTimeout(wishlistTimersRef.current[productId]);
    }

    wishlistTimersRef.current[productId] = setTimeout(async () => {
      try {
        const res = await fetch('/api/wishlist', {
          method: nextLiked ? 'POST' : 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        });
        if (!res.ok) throw new Error('Wishlist sync failed');
      } catch {
        // Rollback optimistic update on failure
        setWishlist((prev) =>
          nextLiked ? prev.filter((id) => id !== productId) : (prev.includes(productId) ? prev : [productId, ...prev])
        );
        addToast('Could not update wishlist. Please try again.', 'error');
      }
    }, 250);
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_LIMIT - cartSubtotal);
  const freeShippingProgress = Math.min(
    100,
    Math.round((cartSubtotal / FREE_SHIPPING_LIMIT) * 100)
  );

  const clearCart = () => {
    setCart([]);
    useCartStore.getState().clearCart();
  };

  return (
    <ShopContext.Provider
      value={{
        cart,
        wishlist,
        isCartOpen,
        setIsCartOpen,
        isSearchOpen,
        setIsSearchOpen,
        quickViewProduct,
        setQuickViewProduct,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleWishlist,
        isInWishlist,
        cartSubtotal,
        cartCount,
        freeShippingThreshold: FREE_SHIPPING_LIMIT,
        freeShippingProgress,
        amountNeededForFreeShipping,
        clearCart,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
