import { prisma } from "@/lib/prisma";
import styles from "./page.module.css";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const [productCount, orderCount, unreadMessages] = await Promise.all([
    prisma.product.count({ where: { available: true } }),
    prisma.order.count({ where: { status: { in: ["PENDING", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY"] } } }),
    prisma.contactSubmission.count({ where: { read: false } }),
  ]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>Welcome to the CRAVEK admin panel.</p>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📦</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{orderCount}</span>
            <span className={styles.statLabel}>Active Orders</span>
          </div>
          <Link href="/admin/orders" className={styles.statLink}>View Orders →</Link>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🌶️</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{productCount}</span>
            <span className={styles.statLabel}>Active Products</span>
          </div>
          <Link href="/admin/products" className={styles.statLink}>Manage Menu →</Link>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>✉️</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{unreadMessages}</span>
            <span className={styles.statLabel}>Unread Messages</span>
          </div>
          <Link href="/admin/contact" className={styles.statLink}>View Inbox →</Link>
        </div>
      </div>
    </div>
  );
}
