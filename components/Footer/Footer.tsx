import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={`container ${styles.inner}`}>

        {/* Top Row */}
        <div className={styles.top}>
          <div className={styles.brand}>
            <span className={styles.logoText}>CRAVEK</span>
            <p className={styles.tagline}>Bold Bites. Big Cravings.</p>
            <p className={styles.description}>
              Modern Sri Lankan food built around bold flavors and serious cravings.
              Delivery-first. Always fired up.
            </p>
          </div>

          <div className={styles.links}>
            <div className={styles.linkGroup}>
              <h3 className={styles.linkGroupTitle}>Navigate</h3>
              <Link href="/" className={styles.link}>Home</Link>
              <Link href="/menu" className={styles.link}>Menu</Link>
              <Link href="/about" className={styles.link}>About</Link>
              <Link href="/contact" className={styles.link}>Contact</Link>
            </div>
            <div className={styles.linkGroup}>
              <h3 className={styles.linkGroupTitle}>Order</h3>
              <a href="#order" className={styles.link}>Order Now</a>
              <a href="#order" className={styles.link}>Delivery</a>
            </div>
            <div className={styles.linkGroup}>
              <h3 className={styles.linkGroupTitle}>Connect</h3>
              <a
                href="mailto:hello.cravek@gmail.com"
                className={styles.link}
                aria-label="Email CRAVEK"
              >
                hello.cravek@gmail.com
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
                aria-label="Follow CRAVEK on Instagram"
              >
                Instagram
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
                aria-label="Follow CRAVEK on Facebook"
              >
                Facebook
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
                aria-label="Follow CRAVEK on TikTok"
              >
                TikTok
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Bottom Row */}
        <div className={styles.bottom}>
          <p className={styles.copy}>
            &copy; {year} CRAVEK. All rights reserved.
          </p>
          <div className={styles.legalLinks}>
            <span className={styles.legalLink}>Privacy Policy</span>
            <span className={styles.legalSep}>·</span>
            <span className={styles.legalLink}>Terms of Use</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
