import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function verifyAdmin(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const admin = await prisma.adminProfile.findUnique({ where: { id: user.id } });
  return admin ? user : null;
}

// GET /api/admin/products — all products (including unavailable)
export async function GET(request: NextRequest) {
  if (!await verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const products = await prisma.product.findMany({
    include: { portions: { orderBy: { price: "asc" } }, category: true },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(products);
}

// POST /api/admin/products — create new product
export async function POST(request: NextRequest) {
  if (!await verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { categoryId, name, slug, tagline, description, imageUrl, spiceLevel, available, featured, sortOrder, portions } = body;

    if (!categoryId || !name || !slug || !tagline || !description) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        categoryId,
        name,
        slug,
        tagline,
        description,
        imageUrl: imageUrl || null,
        spiceLevel: spiceLevel ?? 3,
        available: available ?? true,
        featured: featured ?? false,
        sortOrder: sortOrder ?? 0,
        portions: {
          create: portions?.map((p: { label: string; weight: string; price: number }) => ({
            label: p.label,
            weight: p.weight,
            price: p.price,
            available: true,
          })) ?? [],
        },
      },
      include: { portions: true, category: true },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "A product with this slug already exists." }, { status: 409 });
    }
    console.error("[POST /api/admin/products]:", error);
    return NextResponse.json({ error: "Failed to create product." }, { status: 500 });
  }
}
