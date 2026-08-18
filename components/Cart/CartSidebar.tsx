"use client";
import { useEffect, useRef } from "react";
import { useCart } from "./CartContext";
import styles from "./CartSidebar.module.css";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function CartSidebar() {
  const { isCartOpen, setIsCartOpen, items, updateQuantity, removeFromCart, cartTotal } = useCart();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsCartOpen(false);
      }
    }
    if (isCartOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto";
    };
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  return (
    <>
      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.sidebar} ref={sidebarRef} role="dialog" aria-modal="true" aria-label="Shopping Cart">
        <div className={styles.header}>
          <h2 className={styles.title}>Your Cart</h2>
          <button className={styles.closeBtn} onClick={() => setIsCartOpen(false)} aria-label="Close cart">
            ✕
          </button>
        </div>

        <div className={styles.body}>
          {items.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Your cart is empty.</p>
              <button className="btn btn-outline" onClick={() => setIsCartOpen(false)}>
                Continue Browsing
              </button>
            </div>
          ) : (
            <div className={styles.itemsList}>
              {items.map((item) => (
                <div key={item.portionId} className={styles.itemCard}>
                  <div className={styles.itemImageWrapper}>
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} fill className={styles.itemImage} unoptimized />
                    ) : (
                      <div className={styles.noImage}>No Image</div>
                    )}
                  </div>
                  <div className={styles.itemDetails}>
                    <div className={styles.itemHeader}>
                      <h3 className={styles.itemName}>{item.name}</h3>
                      <button className={styles.removeBtn} onClick={() => removeFromCart(item.portionId)} aria-label="Remove item">✕</button>
                    </div>
                    <p className={styles.itemPortion}>{item.portionLabel} ({item.weight})</p>
                    <div className={styles.itemFooter}>
                      <div className={styles.quantityControls}>
                        <button onClick={() => updateQuantity(item.portionId, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.portionId, item.quantity + 1)}>+</button>
                      </div>
                      <span className={styles.itemPrice}>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.totals}>
              <span>Subtotal</span>
              <span className={styles.totalPrice}>Rs. {cartTotal.toLocaleString()}</span>
            </div>
            <p className={styles.deliveryNote}>Delivery fee calculated at checkout</p>
            <button 
              className={`btn btn-primary btn-lg ${styles.checkoutBtn}`} 
              onClick={() => {
                setIsCartOpen(false);
                router.push("/checkout");
              }}
            >
              Go to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
