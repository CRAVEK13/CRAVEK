"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import styles from "./account.module.css";
import Image from "next/image";

export default function AccountPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
      }
      
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const formatPrice = (price: number) => `Rs. ${price.toLocaleString()}`;

  if (loading) return <div className={styles.loading}>Loading your account...</div>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>My Account</h1>
          <p className={styles.sub}>{userEmail}</p>
        </div>
        <button onClick={handleSignOut} className="btn btn-outline">Sign Out</button>
      </header>

      <section className={styles.ordersSection}>
        <h2 className={styles.sectionTitle}>Order History</h2>
        
        {orders.length === 0 ? (
          <div className={styles.empty}>
            <p>You haven't placed any orders yet.</p>
            <button className="btn btn-primary" onClick={() => router.push("/menu")} style={{marginTop: '1rem'}}>
              Browse Menu
            </button>
          </div>
        ) : (
          <div className={styles.orderList}>
            {orders.map((order) => (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div className={styles.orderIdBlock}>
                    <span className={styles.orderIdLabel}>Order #</span>
                    <span className={styles.orderId}>{order.id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className={styles.orderMeta}>
                    <span className={styles.date}>{new Date(order.createdAt).toLocaleDateString()}</span>
                    <span className={`${styles.statusBadge} ${styles[`status_${order.status}`]}`}>
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                <div className={styles.orderBody}>
                  <div className={styles.itemsList}>
                    {order.items.map((item: any) => (
                      <div key={item.id} className={styles.itemRow}>
                        <div className={styles.itemImageWrapper}>
                          {item.product.imageUrl ? (
                            <Image src={item.product.imageUrl} alt={item.productName} fill className={styles.itemImage} unoptimized />
                          ) : (
                            <div className={styles.noImage}>No Image</div>
                          )}
                        </div>
                        <div className={styles.itemInfo}>
                          <span className={styles.itemName}>{item.productName}</span>
                          <span className={styles.itemPortion}>{item.portionLabel} ({item.portionWeight})</span>
                        </div>
                        <div className={styles.itemQtyPrice}>
                          <span className={styles.itemQty}>{item.quantity}×</span>
                          <span className={styles.itemPrice}>{formatPrice(item.unitPrice)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.orderFooter}>
                    <div className={styles.addressBlock}>
                      <span className={styles.footerLabel}>Delivered to</span>
                      <span className={styles.address}>{order.addressLine1}, {order.city}</span>
                    </div>
                    <div className={styles.totalBlock}>
                      <span className={styles.footerLabel}>Total ({order.paymentMethod})</span>
                      <span className={styles.totalPrice}>{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
