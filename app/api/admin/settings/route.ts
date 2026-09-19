import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminProfile = await prisma.adminProfile.findUnique({
      where: { id: user.id },
    });

    if (!adminProfile) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { deliveryAvailable, estimatedDeliveryTime } = body;

    const settings = await prisma.storeSettings.upsert({
      where: { id: "default" },
      update: {
        deliveryAvailable,
        estimatedDeliveryTime: estimatedDeliveryTime ? new Date(estimatedDeliveryTime) : null,
      },
      create: {
        id: "default",
        deliveryAvailable,
        estimatedDeliveryTime: estimatedDeliveryTime ? new Date(estimatedDeliveryTime) : null,
      }
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("[PUT /api/admin/settings]:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
