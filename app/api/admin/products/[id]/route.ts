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

type Params = { params: Promise<{ id: string }> };

// PUT /api/admin/products/[id] — update product
export async function PUT(request: NextRequest, { params }: Params) {
  if (!await verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const body = await request.json();

    // Explicitly pick only valid scalar fields — never spread the whole body
    // (the body may contain relation objects like `category`, `orderItems` etc.
    // that Prisma will reject with a 500)
    const {
      portions,
      name,
      slug,
      tagline,
      description,
      categoryId,
      imageUrl,
      spiceLevel,
      available,
      featured,
      sortOrder,
    } = body;

    await prisma.product.update({
      where: { id },
      data: {
        ...(name        !== undefined && { name }),
        ...(slug        !== undefined && { slug }),
        ...(tagline     !== undefined && { tagline }),
        ...(description !== undefined && { description }),
        ...(categoryId  !== undefined && { categoryId }),
        ...(imageUrl    !== undefined && { imageUrl }),
        ...(spiceLevel  !== undefined && { spiceLevel: Number(spiceLevel) }),
        ...(available   !== undefined && { available }),
        ...(featured    !== undefined && { featured }),
        ...(sortOrder   !== undefined && { sortOrder: Number(sortOrder) }),
        updatedAt: new Date(),
      },
    });

    // Update portions if provided
    if (portions?.length) {
      for (const portion of portions) {
        if (portion.id) {
          await prisma.productPortion.update({
            where: { id: portion.id },
            data: {
              label: portion.label,
              weight: portion.weight,
              price: Number(portion.price),
              available: portion.available ?? true,
            },
          });
        } else {
          await prisma.productPortion.create({
            data: {
              productId: id,
              label: portion.label,
              weight: portion.weight || "",
              price: Number(portion.price),
              available: true,
            },
          });
        }
      }
    }

    const updated = await prisma.product.findUnique({
      where: { id },
      include: { portions: { orderBy: { price: "asc" } }, category: true },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PUT /api/admin/products/[id]]:", error);
    return NextResponse.json({ error: "Failed to update product." }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id] — delete product
export async function DELETE(request: NextRequest, { params }: Params) {
  if (!await verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/admin/products/[id]]:", error);
    return NextResponse.json({ error: "Failed to delete product." }, { status: 500 });
  }
}
