import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import { CartProvider } from "@/components/Cart/CartContext";
import CartSidebar from "@/components/Cart/CartSidebar";
import WhatsAppWidget from "@/components/WhatsAppWidget/WhatsAppWidget";

export const metadata: Metadata = {
  title: {
    default: "CRAVEK — Bold Bites. Big Cravings.",
    template: "%s | CRAVEK",
  },
  description:
    "CRAVEK is a modern Sri Lankan food brand delivering bold, spicy devilled bites straight to your door. Devilled Chicken, Prawns & Sausages. Order now.",
  keywords: [
    "Sri Lankan food",
    "devilled chicken Sri Lanka",
    "devilled prawns",
    "devilled sausages",
    "spicy food delivery Sri Lanka",
    "bold bites",
    "Sri Lankan bites delivery",
    "CRAVEK",
  ],
  authors: [{ name: "CRAVEK" }],
  creator: "CRAVEK",
  metadataBase: new URL("https://cravek.lk"),
  openGraph: {
    type: "website",
    locale: "en_LK",
    url: "https://cravek.lk",
    siteName: "CRAVEK",
    title: "CRAVEK — Bold Bites. Big Cravings.",
    description:
      "Modern Sri Lankan food built around bold flavors and serious cravings. Devilled Chicken, Prawns & Sausages. Delivery first.",
    images: [
      {
        url: "/images/og/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CRAVEK — Bold Sri Lankan Devilled Bites",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CRAVEK — Bold Bites. Big Cravings.",
    description:
      "Modern Sri Lankan food. Bold flavors. Delivery first. Order devilled chicken, prawns and sausages now.",
    images: ["/images/og/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FoodEstablishment",
              name: "CRAVEK",
              description:
                "Modern Sri Lankan food brand delivering bold, spicy devilled bites. Delivery-first.",
              url: "https://cravek.lk",
              email: "hello.cravek@gmail.com",
              servesCuisine: ["Sri Lankan", "Asian", "Street Food"],
              hasMenu: "https://cravek.lk/menu",
              sameAs: [
                "https://instagram.com",
                "https://facebook.com",
                "https://tiktok.com",
              ],
            }),
          }}
        />
      </head>
      <body>
        <CartProvider>
          <Navbar />
          <CartSidebar />
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
          <Footer />
          <WhatsAppWidget />
        </CartProvider>
      </body>
    </html>
  );
}
