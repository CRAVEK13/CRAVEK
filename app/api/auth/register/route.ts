import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase";

// POST /api/auth/register — create customer account
export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone } = await request.json();

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    // Create Supabase Auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
      }
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
    }

    // Create customer profile in our DB
    await prisma.customerProfile.create({
      data: {
        id: authData.user.id,
        name: name.trim(),
        phone: phone?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, message: "Account created. Please check your email to verify." }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/auth/register]:", error);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
