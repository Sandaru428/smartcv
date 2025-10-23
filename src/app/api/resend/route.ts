import { NextResponse } from "next/server";
import { createClientAdmin } from "@/utils/supabase/server";

const RESEND_LIMIT = 3
const RESEND_LOCK_HOURS = 12

interface OtpAttempt {
  lock_until?: string | null;
  failed_count?: number | null;
  resend_count?: number | null;
  last_failed_at?: string | null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body?.email ?? "").toString().trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "email required" }, { status: 400 });
    }

    const supabaseAdmin = await createClientAdmin()
    let existing: OtpAttempt | null = null
    try {
      const { data, error} = await supabaseAdmin
        .from("auth_otp_attempts")
        .select("resend_count, last_failed_at, lock_until")
        .eq("email", email)
        .single()
      
      if (!error) existing = data

    } catch (e) {
      existing = null
    }

    if (existing?.lock_until) {
      const lockUntil = new Date(existing.lock_until);

      if (new Date() < lockUntil) {

        const seconds = Math.ceil((lockUntil.getTime() - new Date().getTime()) / 1000);
        return NextResponse.json({
          error: `Resend limit reached. Try again in ${seconds} seconds.`,
          locked: true,
          lock_seconds: seconds,
        }, {
          status: 429
        });
      }
    }

    const nowIso = new Date().toISOString();
     if (!existing) {
      await supabaseAdmin
        .from("auth_otp_attempts")
        .insert([{ email, resend_count: 1, last_resend_at: nowIso, createdAt: nowIso }]);

    } else {
      const newResend = (existing.resend_count ?? 0) + 1;

      if (newResend >= RESEND_LIMIT) {
        const lockUntil = new Date(Date.now() + RESEND_LOCK_HOURS * 60 * 60 * 1000).toISOString();
        await supabaseAdmin
          .from("auth_otp_attempts")
          .update({ resend_count: newResend, last_resend_at: nowIso, lock_until: lockUntil })
          .eq("email", email);

        return NextResponse.json({
          error: `Resend limit reached. Try again in ${RESEND_LOCK_HOURS} hours.`,
          locked: true,
          lock_seconds: RESEND_LOCK_HOURS * 60 * 60,
        }, {
          status: 429
        });

      } else {
        await supabaseAdmin
          .from("auth_otp_attempts")
          .update({ resend_count: newResend, last_resend_at: nowIso })
          .eq("email", email);
      }
    }

    const send = await supabaseAdmin.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false }
    });

    if (send.error) {
      console.error("Resend OTP error:", send.error);
      return NextResponse.json({ error: send.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "OTP resent" }, { status: 200 });

  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ error: (err as Error).message ?? "internal error" }, { status: 500 });
  }
}
