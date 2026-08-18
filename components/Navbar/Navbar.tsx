"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/Cart/CartContext";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount, setIsCartOpen } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/menu", label: "Menu" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`} role="banner">
        <div className={`container ${styles.inner}`}>
          {/* Logo */}
          <Link href="/" className={styles.logo} aria-label="CRAVEK Home">
            <span className={styles.logoText}>CRAVEK</span>
          </Link>

          {/* Desktop Nav */}
          <nav className={styles.desktopNav} aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={styles.navLink}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions + Hamburger */}
          <div className={styles.actions}>
            <Link href="/account" className={styles.accountBtn} aria-label="My Account">
              👤
            </Link>
            
            <button 
              className={styles.cartBtn} 
              onClick={() => setIsCartOpen(true)}
              aria-label="Open cart"
            >
              🛒
              {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
            </button>

            <button
              className={styles.hamburger}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <span className={`${styles.bar} ${menuOpen ? styles.barTop : ""}`} />
              <span className={`${styles.bar} ${menuOpen ? styles.barMid : ""}`} />
              <span className={`${styles.bar} ${menuOpen ? styles.barBot : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ""}`}
        aria-hidden={!menuOpen}
      >
        <nav className={styles.mobileNav} aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={styles.mobileNavLink}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <button
            className={`btn btn-primary btn-lg ${styles.mobileOrderBtn}`}
            onClick={() => {
              setMenuOpen(false);
              setIsCartOpen(true);
            }}
          >
            View Cart ({cartCount})
          </button>
          <Link
            href="/account"
            className={styles.mobileNavLink}
            onClick={() => setMenuOpen(false)}
          >
            My Account
          </Link>
        </nav>
        <div className={styles.mobileMenuFooter}>
          <p className="text-muted text-sm">Bold Bites. Big Cravings.</p>
        </div>
      </div>
    </>
  );
}
