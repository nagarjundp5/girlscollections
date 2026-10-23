'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, MOCK_PRODUCTS } from '@/data/shopData';
import { useCartStore } from '@/lib/cartStore';

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
  addToCart: (product: Product, size: string, color?: string, quantity?: number) => void;
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
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

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
      const cartStoreItems = cart.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        price: item.product.price > 10000 ? item.product.price : item.product.price * 100, // ensure price in paise
        image: item.product.images[0] || '',
        size: item.selectedSize,
        quantity: item.quantity,
      }));

      useCartStore.setState({ items: cartStoreItems, hasHydrated: true });
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  // Save wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tgc_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist to localStorage', e);
    }
  }, [wishlist]);

  const addToCart = (product: Product, size: string, color?: string, quantity = 1) => {
    const selectedColor = color || (product.colors[0]?.name ?? 'Standard');
    const itemId = `${product.id}-${size}-${selectedColor}`;

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

    // Auto open cart drawer when adding item
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
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
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
