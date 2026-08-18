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

// GET /api/admin/contact — all contact submissions (newest first)
export async function GET(request: NextRequest) {
  if (!await verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get("unread") === "true";

  const submissions = await prisma.contactSubmission.findMany({
    where: unreadOnly ? { read: false } : {},
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(submissions);
}

// PATCH /api/admin/contact/[id] — mark as read/unread
export async function PATCH(request: NextRequest) {
  if (!await verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id, read } = await request.json();
    const updated = await prisma.contactSubmission.update({
      where: { id },
      data: { read },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update submission." }, { status: 500 });
  }
}
