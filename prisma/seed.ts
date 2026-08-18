import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { PRODUCTS, CATEGORIES } from "../data/products";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("🌶️  Seeding CRAVEK database...");

  // ── Categories ─────────────────────────────────────────────────
  console.log("→ Seeding categories...");
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.id },
      update: {},
      create: {
        name: cat.label,
        slug: cat.id,
        available: cat.available,
        comingSoon: cat.comingSoon ?? false,
        sortOrder: CATEGORIES.indexOf(cat),
      },
    });
  }

  const cookedBitesCategory = await prisma.category.findUnique({
    where: { slug: "cooked-bites" },
  });

  if (!cookedBitesCategory) {
    throw new Error("cooked-bites category not found after seed");
  }

  // ── Products ────────────────────────────────────────────────────
  console.log("→ Seeding products...");
  for (const product of PRODUCTS) {
    const upserted = await prisma.product.upsert({
      where: { slug: product.id },
      update: {
        name: product.name,
        tagline: product.tagline,
        description: product.description,
        spiceLevel: product.spiceLevel,
        available: product.available,
        featured: product.featured,
        imageUrl: `/images/products/${product.id}.jpg`,
      },
      create: {
        categoryId: cookedBitesCategory.id,
        name: product.name,
        slug: product.id,
        tagline: product.tagline,
        description: product.description,
        imageUrl: `/images/products/${product.id}.jpg`,
        spiceLevel: product.spiceLevel,
        available: product.available,
        featured: product.featured,
        sortOrder: PRODUCTS.indexOf(product),
      },
    });

    // Upsert portions
    for (const portion of product.portions) {
      const existingPortion = await prisma.productPortion.findFirst({
        where: {
          productId: upserted.id,
          label: portion.label,
        },
      });

      if (existingPortion) {
        await prisma.productPortion.update({
          where: { id: existingPortion.id },
          data: { price: portion.price, weight: portion.weight },
        });
      } else {
        await prisma.productPortion.create({
          data: {
            productId: upserted.id,
            label: portion.label,
            weight: portion.weight,
            price: portion.price,
            available: true,
          },
        });
      }
    }
  }

  console.log("✅ Database seeded successfully!");
  console.log("");
  console.log("Next steps:");
  console.log("  1. Create your first admin via Supabase Auth dashboard");
  console.log("  2. Add the user ID to admin_profiles table");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
