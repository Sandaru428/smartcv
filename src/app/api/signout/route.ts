import { createClientPub } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClientPub();

  // Check if a user's logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");

  // Keep the route for client-side fetch compatibility.
  // Return JSON with an optional redirect hint instead of issuing a server redirect.
  return NextResponse.json({ success: true, redirect: "/signin" }, { status: 200 });
}