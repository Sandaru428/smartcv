import { NextResponse } from "next/server";
import { createClientPub, createClientAdmin } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, fname, lname } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "email and password required" }, { status: 400 });
    }

    // Create the user using service role (server-only) via helper
    const supabaseAdmin = await createClientAdmin();

    const { data: createdUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false // Keep unconfirmed; OTP verify will confirm
    });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    // store first/last names in your users table or metadata
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

    } catch (err: unknown) {
      console.warn("profile creation failed:", (err as Error).message);
    }

    // Send OTP to the user email (use publishable key)
    const supabasePub = await createClientPub();

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
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message ?? "internal error" }, { status: 500 });
  }
}