import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard/ProductCard";
import FadeIn from "@/components/FadeIn/FadeIn";
import { prisma } from "@/lib/prisma";
import styles from "./home.module.css";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featuredProducts = await prisma.product.findMany({
    where: { available: true },
    include: { portions: { orderBy: { price: "asc" } }, category: true },
    take: 3, // Just take 3 for the home page
  });

  return (
    <>
      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className={styles.hero} aria-label="CRAVEK Hero">
        <div className={styles.heroBg}>
          <Image
            src="/images/hero/hero-food.jpg"
            alt="Bold Sri Lankan devilled bites — CRAVEK signature food"
            fill
            priority
            className={styles.heroImage}
            sizes="100vw"
          />
          <div className={styles.heroOverlay} aria-hidden="true" />
        </div>

        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroText}>
            <span className={styles.heroEyebrow}>Sri Lankan · Delivery First · Bold Flavor</span>
            <h1 className={styles.heroHeadline}>
              Bold Bites.<br />
              <span className={styles.heroHeadlineAccent}>Big Cravings.</span>
            </h1>
            <p className={styles.heroSub}>
              Sri Lankan-inspired bites made for serious cravings.
              Spicy, generous, and built to satisfy.
            </p>
            <div className={styles.heroCtas}>
              <a href="#order" className={`btn btn-primary btn-lg ${styles.heroCtaPrimary}`} id="hero-order-btn">
                Order Now
              </a>
              <Link href="/menu" className={`btn btn-outline btn-lg`} id="hero-menu-btn">
                View Menu
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className={styles.scrollIndicator} aria-hidden="true">
          <span className={styles.scrollDot} />
        </div>
      </section>

      {/* ── BRAND TICKER ─────────────────────────────────────────── */}
      <div className={styles.ticker} aria-hidden="true">
        <div className={styles.tickerTrack}>
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className={styles.tickerItems}>
              <span>Bold Flavors</span>
              <span className={styles.tickerDot}>·</span>
              <span>Sri Lankan Inspired</span>
              <span className={styles.tickerDot}>·</span>
              <span>Delivery First</span>
              <span className={styles.tickerDot}>·</span>
              <span>Serious Cravings</span>
              <span className={styles.tickerDot}>·</span>
              <span>Spice &amp; Heat</span>
              <span className={styles.tickerDot}>·</span>
              <span>Made to Share</span>
              <span className={styles.tickerDot}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURED PRODUCTS ──────────────────────────────────── */}
      <section className={`section ${styles.products}`} aria-labelledby="craving-heading">
        <div className="container">
          <FadeIn className={styles.productsHeader}>
            <p className="section-label">What Are You Craving?</p>
            <h2 className="section-title" id="craving-heading">
              Our Bold Bites
            </h2>
            <p className="section-subtitle">
              Start with our signature devilled collection — spicy, generous,
              and seriously satisfying.
            </p>
          </FadeIn>

          <div className={styles.productsGrid}>
            {featuredProducts.map((product: any, i: number) => (
              <FadeIn key={product.id} delay={i + 1}>
                <ProductCard product={product} />
              </FadeIn>
            ))}
          </div>

          <FadeIn className={styles.viewAllWrap} delay={featuredProducts.length + 1}>
            <Link href="/menu" className={`btn btn-outline`} id="view-full-menu-btn">
              View Full Menu
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ── BRAND STORY ────────────────────────────────────────── */}
      <section className={`section ${styles.story}`} aria-labelledby="story-heading">
        <div className="container">
          <div className={styles.storyInner}>
            <FadeIn className={styles.storyContent} delay={1}>
              <p className="section-label">Our Story</p>
              <h2 className="section-title" id="story-heading">
                Started with<br />one craving.
              </h2>
              <p className={styles.storyText}>
                CRAVEK started with a simple idea: food should be bold enough
                to make you crave it again. We create Sri Lankan-inspired bites
                packed with flavor — made for casual meals, late-night orders,
                and those moments when ordinary food just won&apos;t do.
              </p>
              <p className={`${styles.storyText} ${styles.storyTextBold}`}>
                We&apos;re starting small, but the vision is bigger.
              </p>
              <Link href="/about" className={`btn btn-outline`} id="our-story-btn">
                Our Story
              </Link>
            </FadeIn>
            <FadeIn className={styles.storyImage} delay={2}>
              <Image
                src="/images/brand/about-brand.jpg"
                alt="CRAVEK bold Sri Lankan devilled dishes flat lay"
                fill
                className={styles.storyImg}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className={styles.storyImageOverlay} aria-hidden="true" />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── ORDER ANYWHERE ──────────────────────────────────────── */}
      <section className={styles.orderSection} id="order" aria-labelledby="order-heading">
        <div className="container">
          <FadeIn className={styles.orderInner}>
            <div className={styles.orderContent}>
              <p className="section-label">Order CRAVEK</p>
              <h2 className={styles.orderTitle} id="order-heading">
                Your next craving<br />starts here.
              </h2>
              <p className={styles.orderSub}>
                We deliver. View our menu and order directly to your door.
              </p>
              <Link
                href="/menu"
                className={`btn btn-primary btn-lg`}
                id="main-order-btn"
                aria-label="View menu to order"
              >
                Order Now
              </Link>
            </div>
            <div className={styles.orderDecor} aria-hidden="true">
              <span className={styles.orderEmoji}>🌶️</span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── SOCIAL ─────────────────────────────────────────────── */}
      <section className={`section ${styles.social}`} aria-labelledby="social-heading">
        <div className="container">
          <FadeIn className={styles.socialContent}>
            <p className="section-label">Follow The Crave</p>
            <h2 className="section-title" id="social-heading">
              Find us on social
            </h2>
            <p className="section-subtitle">
              Follow CRAVEK for food drops, new arrivals, and behind-the-scenes crave content.
            </p>
            <div className={styles.socialLinks}>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`btn btn-ghost ${styles.socialBtn}`}
                aria-label="Follow CRAVEK on Instagram"
                id="instagram-btn"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Instagram
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`btn btn-ghost ${styles.socialBtn}`}
              aria-label="Follow CRAVEK on Facebook"
              id="facebook-btn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`btn btn-ghost ${styles.socialBtn}`}
              aria-label="Follow CRAVEK on TikTok"
              id="tiktok-btn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
              </svg>
              TikTok
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  </>
);
}
