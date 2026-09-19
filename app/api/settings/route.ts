import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let settings = await prisma.storeSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: {
          id: "default",
          deliveryAvailable: true,
          estimatedDeliveryTime: null,
        }
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("[GET /api/settings]:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}
