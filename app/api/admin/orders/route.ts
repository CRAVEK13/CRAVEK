import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase";

async function verifyAdmin(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const admin = await prisma.adminProfile.findUnique({ where: { id: user.id } });
  return admin ? user : null;
}

// GET /api/admin/orders — all orders with customer info and items
export async function GET(request: NextRequest) {
  if (!await verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const orders = await prisma.order.findMany({
    where: status ? { status: status as any } : {},
    include: {
      customer: true,
      items: {
        include: {
          product: { select: { name: true, imageUrl: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}
