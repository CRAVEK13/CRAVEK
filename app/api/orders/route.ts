import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase";
import nodemailer from "nodemailer";

// POST /api/orders — place a new order (COD)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "You must be logged in to place an order." }, { status: 401 });
    }

    const body = await request.json();
    const { items, addressLine1, addressLine2, city, notes } = body;

    // Validate
    if (!items?.length) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }
    if (!addressLine1?.trim() || !city?.trim()) {
      return NextResponse.json({ error: "Delivery address is required." }, { status: 400 });
    }

    // Verify all portions exist and are available
    const portionIds = items.map((i: { portionId: string }) => i.portionId);
    const portions = await prisma.productPortion.findMany({
      where: { id: { in: portionIds }, available: true },
      include: { product: { select: { id: true, name: true, available: true } } },
    });

    if (portions.length !== portionIds.length) {
      return NextResponse.json({ error: "One or more items are no longer available." }, { status: 400 });
    }

    // Build order items with verified prices from DB (never trust client prices)
    const orderItemsData = items.map((item: { portionId: string; quantity: number }) => {
      const portion = portions.find((p) => p.id === item.portionId)!;
      return {
        productId: portion.product.id,
        portionId: portion.id,
        productName: portion.product.name,
        portionLabel: portion.label,
        portionWeight: portion.weight,
        unitPrice: portion.price,
        quantity: item.quantity,
        subtotal: portion.price * item.quantity,
      };
    });

    const subtotal = orderItemsData.reduce((sum: number, i: { subtotal: number }) => sum + i.subtotal, 0);
    const deliveryFee = 0; // Free delivery for now
    const total = subtotal + deliveryFee;

    // Create order
    const order = await prisma.order.create({
      data: {
        customerId: user.id,
        subtotal,
        deliveryFee,
        total,
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2?.trim() || null,
        city: city.trim(),
        notes: notes?.trim() || null,
        items: { create: orderItemsData },
      },
      include: {
        items: true,
        customer: true,
      },
    });

    // Send confirmation email to customer
    await sendOrderEmails(order, user.email!);

    return NextResponse.json({ success: true, orderId: order.id }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/orders]:", error);
    return NextResponse.json({ error: "Failed to place order. Please try again." }, { status: 500 });
  }
}

// GET /api/orders — get current customer's orders
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { customerId: user.id },
      include: {
        items: {
          include: {
            product: { select: { name: true, imageUrl: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("[GET /api/orders]:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

// ── Email helpers ────────────────────────────────────────────────────────────

function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString()}`;
}

const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: "Order Received",
  CONFIRMED: "Confirmed",
  PREPARING: "Being Prepared",
  OUT_FOR_DELIVERY: "On the Way",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

async function sendOrderEmails(order: any, customerEmail: string) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });

  const itemsHtml = order.items
    .map(
      (item: any) => `
      <tr>
        <td style="padding:10px 0;color:#F5F0EA;border-bottom:1px solid #2A2A2A;">
          ${item.productName} — ${item.portionLabel} (${item.portionWeight}) × ${item.quantity}
        </td>
        <td style="padding:10px 0;color:#F5F0EA;text-align:right;border-bottom:1px solid #2A2A2A;">
          ${formatPrice(item.subtotal)}
        </td>
      </tr>`
    )
    .join("");

  const orderHtml = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0D0D0D;color:#F5F0EA;padding:32px;border-radius:12px;">
      <div style="text-align:center;margin-bottom:32px;">
        <h1 style="font-size:2rem;font-weight:900;color:#FF5C1A;letter-spacing:-0.04em;margin:0;">CRAVEK</h1>
        <p style="color:#A89F96;font-size:0.8rem;letter-spacing:0.1em;text-transform:uppercase;margin:4px 0 0;">Order Confirmation</p>
      </div>
      <h2 style="font-size:1.4rem;font-weight:800;color:#F5F0EA;margin-bottom:8px;">Order #${order.id.slice(-8).toUpperCase()}</h2>
      <p style="color:#A89F96;font-size:0.9rem;margin-bottom:24px;">Status: <strong style="color:#FF5C1A;">${ORDER_STATUS_LABEL[order.status]}</strong></p>
      
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        ${itemsHtml}
        <tr>
          <td style="padding:12px 0;color:#A89F96;font-weight:700;">Total</td>
          <td style="padding:12px 0;color:#FF5C1A;font-weight:900;font-size:1.1rem;text-align:right;">${formatPrice(order.total)}</td>
        </tr>
      </table>

      <div style="background:#161616;border:1px solid #2A2A2A;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="color:#6B6460;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 8px;">Delivery Address</p>
        <p style="color:#F5F0EA;margin:0;">${order.addressLine1}${order.addressLine2 ? ", " + order.addressLine2 : ""}, ${order.city}</p>
        ${order.notes ? `<p style="color:#A89F96;font-size:0.85rem;margin:8px 0 0;">Note: ${order.notes}</p>` : ""}
      </div>

      <div style="background:rgba(255,92,26,0.08);border:1px solid rgba(255,92,26,0.2);border-radius:8px;padding:16px;text-align:center;margin-bottom:24px;">
        <p style="color:#F5F0EA;font-weight:700;margin:0;">Payment: Cash on Delivery 💵</p>
        <p style="color:#A89F96;font-size:0.85rem;margin:8px 0 0;">Please have the exact amount ready when your order arrives.</p>
      </div>

      <p style="text-align:center;color:#6B6460;font-size:0.75rem;margin-top:24px;border-top:1px solid #2A2A2A;padding-top:24px;">
        CRAVEK · <a href="mailto:hello.cravek@gmail.com" style="color:#FF5C1A;text-decoration:none;">hello.cravek@gmail.com</a> · Bold Bites. Big Cravings.
      </p>
    </div>`;

  await Promise.allSettled([
    // Confirmation to customer
    transporter.sendMail({
      from: `"CRAVEK" <${process.env.GMAIL_USER}>`,
      to: customerEmail,
      subject: `Order Confirmed — #${order.id.slice(-8).toUpperCase()} 🌶️`,
      html: orderHtml,
    }),
    // Notification to admin
    transporter.sendMail({
      from: `"CRAVEK Website" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: customerEmail,
      subject: `🔔 New Order #${order.id.slice(-8).toUpperCase()} — ${formatPrice(order.total)}`,
      html: orderHtml.replace("Order Confirmation", "New Order Received").replace(
        "Thanks",
        `Customer: ${customerEmail}<br>Thanks`
      ),
    }),
  ]);
}
