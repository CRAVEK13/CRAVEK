import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

    // ── Basic validation ────────────────────────────────────────
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    // ── Nodemailer transporter (Gmail SMTP) ─────────────────────
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // ── Email to CRAVEK (notification) ─────────────────────────
    await transporter.sendMail({
      from: `"CRAVEK Website" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER, // sends to hello.cravek@gmail.com
      replyTo: email,
      subject: `New Contact Message from ${name} — CRAVEK Website`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0D0D0D; color: #F5F0EA; padding: 32px; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 2rem; font-weight: 900; color: #FF5C1A; letter-spacing: -0.04em; margin: 0;">CRAVEK</h1>
            <p style="color: #A89F96; font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase; margin: 4px 0 0;">New Contact Message</p>
          </div>
          
          <div style="background: #161616; border: 1px solid #2A2A2A; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6B6460; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; width: 100px;">Name</td>
                <td style="padding: 8px 0; color: #F5F0EA; font-size: 0.95rem;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B6460; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em;">Email</td>
                <td style="padding: 8px 0;">
                  <a href="mailto:${email}" style="color: #FF5C1A; text-decoration: none; font-size: 0.95rem;">${email}</a>
                </td>
              </tr>
            </table>
          </div>

          <div style="background: #161616; border: 1px solid #2A2A2A; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
            <p style="color: #6B6460; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 12px;">Message</p>
            <p style="color: #F5F0EA; font-size: 0.95rem; line-height: 1.7; margin: 0; white-space: pre-wrap;">${message}</p>
          </div>

          <div style="text-align: center; border-top: 1px solid #2A2A2A; padding-top: 24px;">
            <a href="mailto:${email}" style="display: inline-block; background: #FF5C1A; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 999px; font-weight: 700; font-size: 0.85rem; letter-spacing: 0.05em; text-transform: uppercase;">Reply to ${name}</a>
          </div>

          <p style="text-align: center; color: #6B6460; font-size: 0.75rem; margin-top: 24px;">
            CRAVEK · hello.cravek@gmail.com · Bold Bites. Big Cravings.
          </p>
        </div>
      `,
      text: `New message from CRAVEK website\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    // ── Auto-reply to sender ────────────────────────────────────
    await transporter.sendMail({
      from: `"CRAVEK" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "We got your message — CRAVEK",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0D0D0D; color: #F5F0EA; padding: 32px; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 2rem; font-weight: 900; color: #FF5C1A; letter-spacing: -0.04em; margin: 0;">CRAVEK</h1>
            <p style="color: #A89F96; font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase; margin: 4px 0 0;">Bold Bites. Big Cravings.</p>
          </div>
          
          <h2 style="font-size: 1.5rem; font-weight: 800; color: #F5F0EA; letter-spacing: -0.02em; margin-bottom: 16px;">Hey ${name}, we got your message! 🌶️</h2>
          <p style="color: #A89F96; font-size: 1rem; line-height: 1.75; margin-bottom: 24px;">
            Thanks for reaching out to CRAVEK. We've received your message and will get back to you as soon as possible.
          </p>
          <p style="color: #A89F96; font-size: 1rem; line-height: 1.75; margin-bottom: 32px;">
            In the meantime, check out our menu for bold Sri Lankan-inspired bites.
          </p>

          <div style="text-align: center; margin-bottom: 32px;">
            <a href="https://cravek.lk/menu" style="display: inline-block; background: #FF5C1A; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 999px; font-weight: 700; font-size: 0.9rem; letter-spacing: 0.05em; text-transform: uppercase;">View Our Menu</a>
          </div>

          <p style="text-align: center; color: #6B6460; font-size: 0.8rem; margin-top: 32px; border-top: 1px solid #2A2A2A; padding-top: 24px;">
            CRAVEK · <a href="mailto:hello.cravek@gmail.com" style="color: #FF5C1A; text-decoration: none;">hello.cravek@gmail.com</a>
          </p>
        </div>
      `,
      text: `Hey ${name},\n\nThanks for reaching out to CRAVEK! We've received your message and will get back to you soon.\n\nBold Bites. Big Cravings.\n— CRAVEK Team\nhello.cravek@gmail.com`,
    });

    return NextResponse.json(
      { success: true, message: "Email sent successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("[CRAVEK Contact API Error]:", error);
    return NextResponse.json(
      { error: "Failed to send email. Please try again later." },
      { status: 500 }
    );
  }
}
