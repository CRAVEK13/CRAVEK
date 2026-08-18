import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/products — all available products (optionally filtered by category)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category");
    const featuredOnly = searchParams.get("featured") === "true";

    const products = await prisma.product.findMany({
      where: {
        available: true,
        ...(featuredOnly ? { featured: true } : {}),
        ...(categorySlug
          ? { category: { slug: categorySlug } }
          : {}),
      },
      include: {
        portions: {
          where: { available: true },
          orderBy: { price: "asc" },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("[GET /api/products]:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
