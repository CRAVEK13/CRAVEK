"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import styles from "./AdminSidebar.module.css";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "⊞" },
  { href: "/admin/products", label: "Products", icon: "🌶️" },
  { href: "/admin/orders", label: "Orders", icon: "📦" },
  { href: "/admin/contact", label: "Messages", icon: "✉️" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    document.cookie = "cravek_admin=; path=/; max-age=0";
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside className={styles.sidebar} aria-label="Admin navigation">
      <div className={styles.sidebarTop}>
        <Link href="/admin" className={styles.brand}>
          <span className={styles.brandText}>CRAVEK</span>
          <span className={styles.brandSub}>Admin</span>
        </Link>
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const isActive = item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                <span className={styles.navIcon} aria-hidden="true">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className={styles.sidebarBottom}>
        <Link href="/" className={styles.viewSite} target="_blank" rel="noopener noreferrer">
          ↗ View Site
        </Link>
        <button onClick={handleSignOut} className={styles.signOut} id="admin-signout-btn">
          Sign Out
        </button>
      </div>
    </aside>
  );
}
