"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./success.module.css";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={styles.card}>
      <div className={styles.iconWrapper}>
        <span className={styles.icon}>🔥</span>
      </div>
      <h1 className={styles.title}>Order Confirmed!</h1>
      <p className={styles.sub}>
        Your cravings are about to be satisfied. We've received your order and are firing up the woks.
      </p>
      
      {orderId && (
        <div className={styles.orderIdBlock}>
          <span className={styles.label}>Order Number</span>
          <span className={styles.orderId}>{orderId.slice(-8).toUpperCase()}</span>
        </div>
      )}

      <div className={styles.nextSteps}>
        <h3 className={styles.stepsTitle}>What happens next?</h3>
        <ul className={styles.stepsList}>
          <li>You will receive an email confirmation shortly.</li>
          <li>We will prepare your food fresh.</li>
          <li>Have the exact amount ready for Cash on Delivery.</li>
        </ul>
      </div>

      <div className={styles.actions}>
        <Link href="/account" className="btn btn-primary btn-lg">Track Order</Link>
        <Link href="/" className="btn btn-outline btn-lg">Return Home</Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className={styles.page}>
      <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
