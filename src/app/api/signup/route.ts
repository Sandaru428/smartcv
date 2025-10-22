// app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * POST { email, password, fname?, lname? }
 * Returns { user, otp } on success or { error } on failure.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, fname, lname } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "email and password required" }, { status: 400 });
    }

    // get Next.js cookies and cast to any to satisfy createServerClient types
    const nextCookies = (await cookies()) as unknown as any;

    // 1) Create the user using service role (server-only)
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: nextCookies }
    );

    const { data: createdUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false // Keep unconfirmed; OTP verify will confirm
    });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    // Optional: store first/last names in your users table or metadata
    try {
      if (fname || lname) {
        await supabaseAdmin
          .from("profiles")
          .insert([{
            id: createdUser.user?.id,
            first_name: body.fname ?? null,
            last_name: body.lname ?? null
          }])
      }

    } catch (err: any) {
      console.warn("profile creation failed:", err.message);
    }

    // 2) Send OTP to the user email (use publishable key)
    // Use a supabase client with the publishable key to call signInWithOtp
    const supabasePub = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { cookies: nextCookies }
    );

    const { data: otpData, error: otpError } = await supabasePub.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        // Optionally set a redirect URL that your magic link will use:
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/emailverify`
      }
    });

    if (otpError) {
      // OTP sending failed — return created user but surface the otp error
      return NextResponse.json({ user: createdUser, error: otpError.message }, { status: 422 });
    }

    return NextResponse.json({ user: createdUser, otp: otpData }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "internal error" }, { status: 500 });
  }
}