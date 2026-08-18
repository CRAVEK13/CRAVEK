import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your CRAVEK account and view order history.",
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "calc(100vh - 80px - 200px)", background: "var(--color-bg)", padding: "var(--space-10) var(--space-6)" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {children}
      </div>
    </div>
  );
}
