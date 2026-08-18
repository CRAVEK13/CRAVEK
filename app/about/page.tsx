import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About",
  description:
    "CRAVEK is a modern Sri Lankan food brand built around bold flavors and serious cravings. Learn our story, values, and vision.",
};

export default function AboutPage() {
  const values = [
    {
      icon: "🌶️",
      title: "Bold Flavors",
      text: "Every CRAVEK bite is built around maximum flavor. Spicy, savory, satisfying — no bland bites allowed.",
    },
    {
      icon: "🤝",
      title: "Made to Share",
      text: "Food is better together. CRAVEK portions are designed for sharing — with friends, family or a crowd.",
    },
    {
      icon: "🚀",
      title: "Built to Grow",
      text: "We're starting with bold devilled bites, but CRAVEK is designed to expand. This is just the beginning.",
    },
  ];

  return (
    <>
      {/* Page Hero */}
      <section className={styles.pageHero} aria-label="About CRAVEK">
        <div className="container">
          <div className={styles.heroContent}>
            <p className="section-label">About CRAVEK</p>
            <h1 className={styles.pageTitle}>
              Food bold enough<br />
              <span className={styles.titleAccent}>to make you crave it again.</span>
            </h1>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className={styles.storySection} aria-labelledby="story-heading">
        <div className="container">
          <div className={styles.storyGrid}>
            <div className={styles.storyImageWrap}>
              <Image
                src="/images/brand/about-brand.jpg"
                alt="CRAVEK bold Sri Lankan devilled dishes — the food behind the brand"
                fill
                className={styles.storyImg}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className={styles.storyImageGlow} aria-hidden="true" />
            </div>

            <div className={styles.storyContent}>
              <h2 className={styles.storyTitle} id="story-heading">
                How CRAVEK started.
              </h2>
              <div className={styles.storyBody}>
                <p>
                  CRAVEK started with a simple idea: food should be bold enough to
                  make you crave it again.
                </p>
                <p>
                  We create Sri Lankan-inspired bites packed with flavor — made for
                  casual meals, late-night cravings, sharing with friends, and
                  satisfying those moments when ordinary food just won&apos;t do.
                </p>
                <p>
                  We&apos;re starting small, but the vision is bigger. From bold
                  devilled bites to snacks, quick meals and more, CRAVEK is being
                  built as a modern food brand made around one thing: serious cravings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className={styles.valuesSection} aria-labelledby="values-heading">
        <div className="container">
          <div className={styles.valuesHeader}>
            <p className="section-label">What We Stand For</p>
            <h2 className="section-title" id="values-heading">
              The CRAVEK way.
            </h2>
          </div>
          <div className={styles.valuesGrid}>
            {values.map((v) => (
              <div key={v.title} className={`card ${styles.valueCard}`}>
                <span className={styles.valueIcon} aria-hidden="true">{v.icon}</span>
                <h3 className={styles.valueTitle}>{v.title}</h3>
                <p className={styles.valueText}>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className={styles.visionSection} aria-labelledby="vision-heading">
        <div className="container">
          <div className={styles.visionInner}>
            <div className={styles.visionContent}>
              <p className="section-label">Our Vision</p>
              <h2 className={styles.visionTitle} id="vision-heading">
                Start small.<br />
                <span className={styles.visionAccent}>Crave big.</span>
              </h2>
              <p className={styles.visionText}>
                CRAVEK is designed to grow. Beyond devilled bites, we see a brand that
                spans dry snacks, quick meals, catering, packaged products, and eventually —
                physical locations. Every decision we make today is building the foundation
                of a modern Sri Lankan food brand.
              </p>
              <p className={styles.visionSub}>
                We&apos;re not just making food. We&apos;re building a craving.
              </p>
              <Link href="/menu" className="btn btn-primary btn-lg" id="about-menu-btn">
                See Our Menu
              </Link>
            </div>
            <div className={styles.visionStats}>
              <div className={styles.statCard}>
                <span className={styles.statValue}>3</span>
                <span className={styles.statLabel}>Signature Bites</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>3</span>
                <span className={styles.statLabel}>Portion Sizes</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>∞</span>
                <span className={styles.statLabel}>Cravings Ahead</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection} aria-labelledby="cta-heading">
        <div className="container">
          <div className={styles.ctaInner}>
            <h2 className={styles.ctaTitle} id="cta-heading">
              Ready to taste CRAVEK?
            </h2>
            <p className={styles.ctaSub}>Order your first bold bite today.</p>
            <a href="#order" className="btn btn-primary btn-lg" id="about-order-btn">
              Order Now
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
