"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/Cart/CartContext";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import styles from "./checkout.module.css";
import Image from "next/image";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    addressLine1: "",
    addressLine2: "",
    city: "Colombo", // default for delivery area
    notes: "",
  });

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Redirect to login if not authenticated
        router.push("/login?redirect=/checkout");
      } else {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    // If cart is empty and auth check is done, redirect back to menu
    if (!checkingAuth && items.length === 0) {
      router.push("/menu");
    }
  }, [items.length, checkingAuth, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.addressLine1.trim() || !formData.city.trim()) {
      setError("Please provide a complete delivery address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(i => ({ portionId: i.portionId, quantity: i.quantity })),
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          notes: formData.notes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        clearCart();
        router.push(`/checkout/success?orderId=${data.orderId}`);
      } else {
        setError(data.error || "Failed to place order.");
        setLoading(false);
      }
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const deliveryFee = 0; // Free delivery for now
  const total = cartTotal + deliveryFee;

  if (checkingAuth || items.length === 0) {
    return <div className={styles.loading}>Preparing checkout...</div>;
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Checkout</h1>

      <div className={styles.layout}>
        {/* Left Col: Delivery Form */}
        <div className={styles.mainCol}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Delivery Details</h2>
            <form id="checkout-form" className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label className={styles.label}>Street Address</label>
                <input
                  className={styles.input}
                  placeholder="e.g. 123 Galle Road"
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Apt, Suite, Building (Optional)</label>
                <input
                  className={styles.input}
                  placeholder="e.g. Apt 4B"
                  value={formData.addressLine2}
                  onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>City</label>
                <input
                  className={styles.input}
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Delivery Instructions (Optional)</label>
                <textarea
                  className={styles.input}
                  rows={3}
                  placeholder="e.g. Call upon arrival, leave at gate"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </form>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Payment Method</h2>
            <div className={styles.paymentMethod}>
              <div className={styles.paymentRadio}>
                <input type="radio" checked readOnly />
                <span>Cash on Delivery (COD)</span>
              </div>
              <p className={styles.paymentDesc}>Please have the exact amount ready when your order arrives.</p>
            </div>
          </div>
        </div>

        {/* Right Col: Order Summary */}
        <div className={styles.sideCol}>
          <div className={`${styles.card} ${styles.summaryCard}`}>
            <h2 className={styles.cardTitle}>Order Summary</h2>
            <div className={styles.itemsList}>
              {items.map((item) => (
                <div key={item.portionId} className={styles.itemRow}>
                  <div className={styles.itemImageWrapper}>
                    {item.imageUrl && <Image src={item.imageUrl} alt={item.name} fill className={styles.itemImage} unoptimized />}
                  </div>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemPortion}>{item.portionLabel}</span>
                  </div>
                  <div className={styles.itemPriceBlock}>
                    <span className={styles.itemQty}>{item.quantity}×</span>
                    <span className={styles.itemPrice}>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.totalsBlock}>
              <div className={styles.totalRow}>
                <span>Subtotal</span>
                <span>Rs. {cartTotal.toLocaleString()}</span>
              </div>
              <div className={styles.totalRow}>
                <span>Delivery</span>
                <span>{deliveryFee === 0 ? "Free" : `Rs. ${deliveryFee.toLocaleString()}`}</span>
              </div>
              <div className={styles.finalTotal}>
                <span>Total</span>
                <span>Rs. {total.toLocaleString()}</span>
              </div>
            </div>

            {error && <p className={styles.error} role="alert">{error}</p>}

            <button
              form="checkout-form"
              type="submit"
              className={`btn btn-primary btn-lg ${styles.submitBtn}`}
              disabled={loading}
            >
              {loading ? "Processing..." : "Place Order (COD)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
