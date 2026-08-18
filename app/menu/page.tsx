import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import FadeIn from "@/components/FadeIn/FadeIn";
import MenuClient from "./MenuClient";
import styles from "./menu.module.css";

export const metadata: Metadata = {
  title: "Menu",
  description: "Browse the CRAVEK menu. Bold, spicy, Sri Lankan-inspired devilled bites. Devilled Chicken, Devilled Prawns, Devilled Sausages.",
};

export const revalidate = 60; // revalidate every minute

export default async function MenuPage() {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
    }),
    prisma.product.findMany({
      where: { available: true },
      include: { portions: { orderBy: { price: "asc" } }, category: true },
      orderBy: { name: "asc" },
    })
  ]);

  return (
    <>
      {/* Page Hero */}
      <section className={styles.pageHero} aria-label="Menu page header">
        <div className="container">
          <FadeIn className={styles.heroContent}>
            <p className="section-label">Our Menu</p>
            <h1 className={styles.pageTitle}>What&apos;s Your Craving?</h1>
            <p className={styles.pageSub}>
              Bold, spicy, Sri Lankan-inspired bites. Made for serious cravings.
              More categories coming soon.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Interactive Tabs and Products */}
      <MenuClient categories={categories} products={products} />

      {/* Order CTA */}
      <section className={styles.orderCta} aria-label="Order CRAVEK">
        <div className="container">
          <FadeIn className={styles.orderCtaInner}>
            <h2 className={styles.orderCtaTitle}>Ready to order?</h2>
            <p className={styles.orderCtaSub}>We deliver directly to your door.</p>
            {/* The Order Now button here can just scroll up to the menu or link to checkout if they have items. Let's make it link to checkout. */}
            <a href="/checkout" className="btn btn-primary btn-lg" id="menu-order-btn">
              Go to Checkout
            </a>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
