import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "CRAVEK is a modern Sri Lankan food brand built around bold flavors and serious cravings. Learn our story, values, and vision.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
