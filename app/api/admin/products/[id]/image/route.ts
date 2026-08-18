import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

async function verifyAdmin(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const admin = await prisma.adminProfile.findUnique({ where: { id: user.id } });
  return admin ? user : null;
}

// POST /api/admin/products/[id]/image — upload product image to Supabase Storage
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG or WebP images are allowed." }, { status: 400 });
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be under 5MB." }, { status: 400 });
    }

    // Use Service Role Key for storage operations (bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `products/${id}.${ext}`;
    const bytes = await file.arrayBuffer();

    const { error: uploadError } = await supabaseAdmin.storage
      .from("cravek-images")
      .upload(fileName, bytes, {
        contentType: file.type,
        upsert: true, // overwrite if exists
      });

    if (uploadError) {
      console.error("[Storage upload error]:", uploadError);
      return NextResponse.json({ error: "Image upload failed." }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from("cravek-images")
      .getPublicUrl(fileName);

    // Update product imageUrl in DB
    await prisma.product.update({
      where: { id },
      data: { imageUrl: publicUrl, updatedAt: new Date() },
    });

    return NextResponse.json({ success: true, imageUrl: publicUrl });
  } catch (error) {
    console.error("[POST /api/admin/products/[id]/image]:", error);
    return NextResponse.json({ error: "Image upload failed." }, { status: 500 });
  }
}
