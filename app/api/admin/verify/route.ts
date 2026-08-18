import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// POST /api/admin/verify — check if the current user is an admin
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const admin = await prisma.adminProfile.findUnique({ where: { id: user.id } });

    if (!admin) {
      return NextResponse.json({ error: "Not an admin" }, { status: 403 });
    }

    return NextResponse.json({ success: true, role: admin.role, name: admin.name });
  } catch (error) {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
