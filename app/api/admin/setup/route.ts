import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const email = "hello.cravek@gmail.com";
    const password = "adminpassword123"; // Temporary password

    // Check if user exists
    let { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    let user = users?.find(u => u.email === email);

    if (!user) {
      // Create user
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (error) throw error;
      user = data.user;
    }

    if (!user) throw new Error("User creation failed");

    // Upsert admin profile
    await prisma.adminProfile.upsert({
      where: { id: user.id },
      update: { name: "CRAVEK Admin" },
      create: {
        id: user.id,
        name: "CRAVEK Admin",
      },
    });

    return NextResponse.json({ success: true, email, password });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
