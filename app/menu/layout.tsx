import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Explore CRAVEK's menu — bold, spicy Sri Lankan devilled bites including Devilled Chicken, Prawns and Sausages. Order now for delivery.",
};

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
