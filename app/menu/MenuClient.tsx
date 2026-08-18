"use client";
import { useState } from "react";
import ProductCard from "@/components/ProductCard/ProductCard";
import FadeIn from "@/components/FadeIn/FadeIn";
import styles from "./menu.module.css";

interface MenuClientProps {
  categories: any[];
  products: any[];
}

export default function MenuClient({ categories, products }: MenuClientProps) {
  // Try to find the first available category to set as default
  const defaultCategory = categories.find(c => c.available)?.id || "";
  const [activeCategory, setActiveCategory] = useState(defaultCategory);

  const filteredProducts = products.filter(
    (p) => p.categoryId === activeCategory && p.available
  );

  return (
    <>
      {/* Category Tabs */}
      <section className={styles.menuSection} aria-label="Menu categories and items">
        <div className="container">
          <FadeIn className={styles.tabBar} aria-label="Menu categories">
            {categories.map((cat) => (
              <button
                key={cat.id}
                role="tab"
                id={`tab-${cat.id}`}
                aria-selected={activeCategory === cat.id}
                aria-controls={`panel-${cat.id}`}
                className={`${styles.tab} ${activeCategory === cat.id ? styles.tabActive : ""} ${!cat.available ? styles.tabDisabled : ""}`}
                onClick={() => cat.available && setActiveCategory(cat.id)}
                disabled={!cat.available}
              >
                {cat.name}
                {cat.comingSoon && (
                  <span className={`badge badge-muted ${styles.soonBadge}`}>Soon</span>
                )}
              </button>
            ))}
          </FadeIn>

          {/* Products Panel */}
          <div
            role="tabpanel"
            id={`panel-${activeCategory}`}
            aria-labelledby={`tab-${activeCategory}`}
            className={styles.productPanel}
          >
            {filteredProducts.length > 0 ? (
              <>
                <div className={styles.productsGrid}>
                  {filteredProducts.map((product, i) => (
                    <FadeIn key={product.id} delay={i}>
                      <ProductCard product={product} />
                    </FadeIn>
                  ))}
                </div>

                {/* Coming soon teaser */}
                <FadeIn className={styles.comingSoonCard} delay={filteredProducts.length} aria-label="More items coming soon">
                  <div className={styles.comingSoonInner}>
                    <span className={styles.comingSoonIcon} aria-hidden="true">🔥</span>
                    <h3 className={styles.comingSoonTitle}>More Coming Soon</h3>
                    <p className={styles.comingSoonText}>
                      CRAVEK is growing. More bold bites are on the way.
                      Follow us to stay updated.
                    </p>
                    <div className={styles.comingSoonSocials}>
                      <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                        className="btn btn-ghost btn-sm" aria-label="Follow CRAVEK on Instagram">
                        Instagram
                      </a>
                      <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                        className="btn btn-ghost btn-sm" aria-label="Follow CRAVEK on Facebook">
                        Facebook
                      </a>
                    </div>
                  </div>
                </FadeIn>
              </>
            ) : (
              <FadeIn className={styles.emptyState}>
                <span className={styles.emptyIcon} aria-hidden="true">🔜</span>
                <h3 className={styles.emptyTitle}>Coming Soon</h3>
                <p className={styles.emptyText}>
                  This category is launching soon. Stay tuned.
                </p>
              </FadeIn>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
