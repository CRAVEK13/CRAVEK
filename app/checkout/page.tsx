"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/Cart/CartContext";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import styles from "./checkout.module.css";
import Image from "next/image";
import LocationPicker from "@/components/Map/LocationPicker";

const STORE_LOCATION = { lat: 6.086703, lng: 80.145828 };
const MAX_DELIVERY_DISTANCE_KM = 5;

// Haversine formula to calculate distance in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  const d = R * c; // Distance in km
  return d;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState("");
  const [isOutsideDeliveryRange, setIsOutsideDeliveryRange] = useState(false);

  const [formData, setFormData] = useState({
    addressLine1: "",
    addressLine2: "",
    city: "Galle", // default for delivery area
    notes: "",
    latitude: null as number | null,
    longitude: null as number | null,
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

  const handleLocationSelect = (data: { lat: number; lng: number; address?: { addressLine1: string; city: string } }) => {
    const distance = calculateDistance(STORE_LOCATION.lat, STORE_LOCATION.lng, data.lat, data.lng);
    
    setIsOutsideDeliveryRange(distance > MAX_DELIVERY_DISTANCE_KM);

    setFormData((prev) => ({
      ...prev,
      latitude: data.lat,
      longitude: data.lng,
      ...(data.address ? {
        addressLine1: data.address.addressLine1 || prev.addressLine1,
        city: data.address.city || prev.city,
      } : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOutsideDeliveryRange) {
      setError("Cannot place order: selected location is outside our 5km delivery range.");
      return;
    }
    
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
          latitude: formData.latitude,
          longitude: formData.longitude,
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

  const deliveryFee: number = 0; // Free delivery for now
  const total = cartTotal + deliveryFee;

  if (checkingAuth || items.length === 0) {
    return <div className={styles.loading}>Preparing checkout...</div>;
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Checkout</h1>
      
      <div className={styles.infoBanner} style={{ backgroundColor: '#e6f7ff', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #91d5ff', color: '#0050b3' }}>
        <strong>Delivery Information:</strong> Delivery is currently available only within a 5km radius from our store in Galle.
      </div>

      <div className={styles.layout}>
        {/* Left Col: Delivery Form */}
        <div className={styles.mainCol}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Delivery Details</h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <LocationPicker 
                onLocationSelect={handleLocationSelect}
                defaultLocation={formData.latitude && formData.longitude ? { lat: formData.latitude, lng: formData.longitude } : undefined}
              />
              {isOutsideDeliveryRange && (
                <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#fff2f0', border: '1px solid #ffccc7', borderRadius: '6px', color: '#cf1322', fontWeight: 500 }}>
                  ⚠️ Warning: Your selected location is outside our 5km delivery range. Please select a closer location to continue.
                </div>
              )}
            </div>

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
              disabled={loading || isOutsideDeliveryRange || !formData.latitude}
              style={isOutsideDeliveryRange ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              {loading ? "Processing..." : "Place Order (COD)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

