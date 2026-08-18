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

export async function PUT(request: NextRequest) {
  if (!await verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id, name, slug, available, comingSoon, sortOrder } = await request.json();
    
    if (!id || !name || !slug) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updated = await prisma.category.update({
      where: { id },
      data: { name, slug, available, comingSoon, sortOrder, updatedAt: new Date() },
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Slug must be unique" }, { status: 409 });
    }
    console.error("[PUT /api/admin/categories]:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}
