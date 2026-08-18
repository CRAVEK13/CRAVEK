"use client";
import { useState, useEffect } from "react";
import styles from "./orders.module.css";

const STATUSES = ["PENDING", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetchOrders(filter);
  }, [filter]);

  const fetchOrders = async (status: string) => {
    setLoading(true);
    try {
      const url = status === "ALL" ? "/api/admin/orders" : `/api/admin/orders?status=${status}`;
      const res = await fetch(url);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchOrders(filter);
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const formatPrice = (price: number) => `Rs. ${price.toLocaleString()}`;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Orders</h1>
        <div className={styles.filters}>
          <select 
            className={styles.filterSelect}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">All Orders</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
          </select>
        </div>
      </header>

      {loading ? (
        <div className={styles.loading}>Loading orders...</div>
      ) : (
        <div className={styles.orderList}>
          {orders.length === 0 ? (
            <p className={styles.empty}>No orders found.</p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div className={styles.orderIdBlock}>
                    <span className={styles.orderIdLabel}>Order #</span>
                    <span className={styles.orderId}>{order.id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className={styles.orderMeta}>
                    <span className={styles.date}>{new Date(order.createdAt).toLocaleString()}</span>
                    <select
                      className={`${styles.statusSelect} ${styles[`status_${order.status}`]}`}
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                    </select>
                  </div>
                </div>

                <div className={styles.orderBody}>
                  <div className={styles.customerInfo}>
                    <h4 className={styles.subhead}>Customer</h4>
                    <p className={styles.text}>{order.customer.name}</p>
                    <p className={styles.text}><a href={`mailto:${order.customer.email}`}>{order.customer.email}</a></p>
                    {order.customer.phone && <p className={styles.text}>{order.customer.phone}</p>}
                    
                    <h4 className={styles.subhead} style={{marginTop: '1rem'}}>Delivery Address</h4>
                    <p className={styles.text}>{order.addressLine1}</p>
                    {order.addressLine2 && <p className={styles.text}>{order.addressLine2}</p>}
                    <p className={styles.text}>{order.city}</p>
                    {order.notes && <p className={styles.note}>Note: {order.notes}</p>}
                  </div>

                  <div className={styles.itemsList}>
                    <h4 className={styles.subhead}>Items</h4>
                    <div className={styles.items}>
                      {order.items.map((item: any) => (
                        <div key={item.id} className={styles.itemRow}>
                          <span className={styles.itemQty}>{item.quantity}×</span>
                          <span className={styles.itemName}>
                            {item.productName} ({item.portionLabel})
                          </span>
                          <span className={styles.itemPrice}>{formatPrice(item.subtotal)}</span>
                        </div>
                      ))}
                    </div>
                    <div className={styles.orderTotals}>
                      <div className={styles.totalRow}>
                        <span>Subtotal</span>
                        <span>{formatPrice(order.subtotal)}</span>
                      </div>
                      <div className={styles.totalRow}>
                        <span>Delivery Fee</span>
                        <span>{formatPrice(order.deliveryFee)}</span>
                      </div>
                      <div className={`${styles.totalRow} ${styles.finalTotal}`}>
                        <span>Total ({order.paymentMethod})</span>
                        <span>{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
