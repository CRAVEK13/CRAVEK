import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CATEGORIES, PRODUCTS } from "@/data/products";

export async function GET() {
  try {
    let i = 0;
    for (const cat of CATEGORIES) {
      i++;
      await prisma.category.upsert({
        where: { id: cat.id },
        update: {},
        create: {
          id: cat.id,
          name: cat.label,
          slug: cat.id,
          sortOrder: i,
        },
      });
    }

    for (const p of PRODUCTS) {
      await prisma.product.upsert({
        where: { id: p.id },
        update: {},
        create: {
          id: p.id,
          name: p.name,
          slug: p.id,
          description: p.description,
          categoryId: p.category,
          tagline: p.tagline,
          imageUrl: p.image,
          spiceLevel: p.spiceLevel,
          available: p.available,
          portions: {
            create: p.portions.map(port => ({
              label: port.label,
              weight: port.weight,
              price: port.price,
            }))
          }
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
