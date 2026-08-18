export type Portion = {
  label: string;
  weight: string;
  price: number;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  image: string;
  portions: Portion[];
  available: boolean;
  featured: boolean;
  orderUrl: string;
  spiceLevel: 1 | 2 | 3 | 4 | 5;
};

export type Category = {
  id: string;
  label: string;
  available: boolean;
  comingSoon?: boolean;
};

// ─── CATEGORIES ────────────────────────────────────────────────────────────────
export const CATEGORIES: Category[] = [
  { id: "cooked-bites", label: "Cooked Bites", available: true },
  { id: "dry-bites", label: "Dry Bites", available: false, comingSoon: true },
  { id: "quick-meals", label: "Quick Meals", available: false, comingSoon: true },
  { id: "combos", label: "Combos", available: false, comingSoon: true },
];

// ─── PRODUCTS ──────────────────────────────────────────────────────────────────
// To update a price: change the `price` value in the relevant portion below.
// To add a product: copy a product object and add it to the PRODUCTS array.
export const PRODUCTS: Product[] = [
  {
    id: "devilled-chicken",
    name: "Devilled Chicken",
    category: "cooked-bites",
    tagline: "Bold. Spicy. Seriously satisfying.",
    description:
      "Tender chicken tossed with caramelized onions, colorful capsicum, whole green chillis and CRAVEK's bold sweet-spicy devilled sauce.",
    image: "/images/products/devilled-chicken.jpg",
    portions: [
      { label: "Regular", weight: "150g", price: 799 },
      { label: "Large", weight: "300g", price: 1499 },
      { label: "Family", weight: "600g", price: 2699 },
    ],
    available: true,
    featured: true,
    orderUrl: "#order",
    spiceLevel: 4,
  },
  {
    id: "devilled-prawns",
    name: "Devilled Prawns",
    category: "cooked-bites",
    tagline: "Juicy prawns. Maximum flavor.",
    description:
      "Large, juicy prawns tossed with onions, capsicum, fiery red chillis and a rich Sri Lankan-style devilled sauce that hits every time.",
    image: "/images/products/devilled-prawns.jpg",
    portions: [
      { label: "Regular", weight: "150g", price: 999 },
      { label: "Large", weight: "300g", price: 1874 },
      { label: "Family", weight: "600g", price: 3374 },
    ],
    available: true,
    featured: true,
    orderUrl: "#order",
    spiceLevel: 4,
  },
  {
    id: "devilled-sausages",
    name: "Devilled Sausages",
    category: "cooked-bites",
    tagline: "Made for sharing. Gone too fast.",
    description:
      "Juicy sausage slices tossed in CRAVEK's signature bold, spicy devilled sauce with onions, capsicum and chillis. Perfect for sharing.",
    image: "/images/products/devilled-sausages.jpg",
    portions: [
      { label: "Regular", weight: "150g", price: 679 },
      { label: "Large", weight: "300g", price: 1274 },
      { label: "Family", weight: "600g", price: 2294 },
    ],
    available: true,
    featured: true,
    orderUrl: "#order",
    spiceLevel: 3,
  },
];

export const FEATURED_PRODUCTS = PRODUCTS.filter((p) => p.featured);
