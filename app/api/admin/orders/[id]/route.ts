import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase";
import nodemailer from "nodemailer";

async function verifyAdmin(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const admin = await prisma.adminProfile.findUnique({ where: { id: user.id } });
  return admin ? user : null;
}

type Params = { params: Promise<{ id: string }> };

// PATCH /api/admin/orders/[id] — update order status
export async function PATCH(request: NextRequest, { params }: Params) {
  if (!await verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const { status } = await request.json();
    const validStatuses = ["PENDING","CONFIRMED","PREPARING","OUT_FOR_DELIVERY","DELIVERED","CANCELLED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status, updatedAt: new Date() },
      include: { customer: true, items: true },
    });

    // Email customer on key status changes
    if (["CONFIRMED","OUT_FOR_DELIVERY","DELIVERED","CANCELLED"].includes(status)) {
      await notifyCustomerStatusChange(order);
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("[PATCH /api/admin/orders/[id]]:", error);
    return NextResponse.json({ error: "Failed to update order." }, { status: 500 });
  }
}

const STATUS_MESSAGES: Record<string, { subject: string; body: string }> = {
  CONFIRMED:         { subject: "Your CRAVEK order is confirmed! 🌶️", body: "Great news — your order has been confirmed and will start being prepared soon." },
  OUT_FOR_DELIVERY:  { subject: "Your CRAVEK order is on the way! 🏍️", body: "Your order is out for delivery. Have the payment ready — Cash on Delivery." },
  DELIVERED:         { subject: "Order delivered! Enjoy your CRAVEK! 🔥", body: "Your order has been delivered. We hope you love every bite!" },
  CANCELLED:         { subject: "Your CRAVEK order has been cancelled", body: "Unfortunately your order has been cancelled. Please contact us at hello.cravek@gmail.com for assistance." },
};

async function notifyCustomerStatusChange(order: any) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return;
  const msg = STATUS_MESSAGES[order.status];
  if (!msg) return;

  // We need customer email — get from Supabase Auth
  const { createClient } = await import("@supabase/supabase-js");
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(order.customerId);
  if (!user?.email) return;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });

  await transporter.sendMail({
    from: `"CRAVEK" <${process.env.GMAIL_USER}>`,
    to: user.email,
    subject: msg.subject,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0D0D0D;color:#F5F0EA;padding:32px;border-radius:12px;">
        <h1 style="font-size:2rem;font-weight:900;color:#FF5C1A;letter-spacing:-0.04em;margin:0 0 8px;">CRAVEK</h1>
        <h2 style="font-size:1.3rem;font-weight:800;margin-bottom:12px;">${msg.subject.replace(" 🌶️","").replace(" 🏍️","").replace(" 🔥","")}</h2>
        <p style="color:#A89F96;line-height:1.7;">${msg.body}</p>
        <p style="color:#6B6460;font-size:0.8rem;margin-top:24px;">Order #${order.id.slice(-8).toUpperCase()}</p>
        <p style="color:#6B6460;font-size:0.75rem;margin-top:8px;">CRAVEK · hello.cravek@gmail.com</p>
      </div>`,
  });
}
