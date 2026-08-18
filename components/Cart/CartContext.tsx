"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

export type CartItem = {
  productId: string;
  portionId: string;
  name: string;
  portionLabel: string;
  weight: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (portionId: string) => void;
  updateQuantity: (portionId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  cartTotal: number;
  cartCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Load from local storage
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("cravek_cart");
    if (saved) {
      try { setItems(JSON.parse(saved)); } catch {}
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("cravek_cart", JSON.stringify(items));
    }
  }, [items, isMounted]);

  const addToCart = (newItem: Omit<CartItem, "quantity">) => {
    setItems((current) => {
      const existing = current.find((i) => i.portionId === newItem.portionId);
      if (existing) {
        return current.map((i) =>
          i.portionId === newItem.portionId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...current, { ...newItem, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (portionId: string) => {
    setItems((current) => current.filter((i) => i.portionId !== portionId));
  };

  const updateQuantity = (portionId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(portionId);
      return;
    }
    setItems((current) =>
      current.map((i) => (i.portionId === portionId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setItems([]);

  const cartTotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
