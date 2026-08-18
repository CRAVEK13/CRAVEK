import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register",
  description: "Create a CRAVEK account to track orders and checkout faster.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
