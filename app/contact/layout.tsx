import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with CRAVEK. Questions, feedback or ordering enquiries — we're here. Email us at hello.cravek@gmail.com.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
