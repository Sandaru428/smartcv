import { NextResponse } from "next/server";
import { createClientAdmin } from "@/utils/supabase/server";

const MAX_FAILED = 4;
const TEMP_LOCK_AFTER = 3;
const TEMP_LOCK_SECONDS = 30;
const COOLDOWN_MINUTES = 15;

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
    const token = (body?.token ?? "").toString().trim();

    if (!email || !token) {
      return NextResponse.json({ error: "email and token required" }, { status: 400 });
    }

    const supabaseAdmin = await createClientAdmin();

    // 1) check lock row
    let lockRow: OtpAttempt | null = null;

    try {
      const { data, error } = await supabaseAdmin
        .from("auth_otp_attempts")
        .select("lock_until, failed_count, resend_count, last_failed_at")
        .eq("email", email)
        .single()
      
      if (!error) lockRow = data;

    } catch (e) {
      console.error("DB lookup error:", e);
      lockRow = null
    }

    if (lockRow?.lock_until) {
      const lockUntil = new Date(lockRow?.lock_until);
      const now = new Date();
      if (now < lockUntil) {
        const seconds = Math.ceil((lockUntil.getTime() - now.getTime()) / 1000);
        return NextResponse.json({
          error: `Too many failed attempts. Try again in ${seconds} seconds.`,
          locked: true,
          lock_seconds: seconds,
          allow_resend: true
        }, {
          status: 423
        });
      }
    }

    // 2) verify OTP using server-side auth
    const verify = await supabaseAdmin.auth.verifyOtp({ email, token, type: "signup" });

    if (!verify.error) {
      await supabaseAdmin.from("auth_otp_attempts").delete().eq("email", email);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // 3) upsert failed_count with cooldown
    let existing: OtpAttempt | null = null
    try {
      const { data, error} = await supabaseAdmin
        .from("auth_otp_attempts")
        .select("failed_count, last_failed_at, resend_count")
        .eq("email", email)
        .single()
      
      if (!error) existing = data

    } catch (e) {
      console.error("DB lookup error:", e);
      existing = null
    }

    let failedCount = 1
    const nowIso = new Date().toISOString();
    if (!existing) {
      await supabaseAdmin
        .from("auth_otp_attempts")
        .insert([{ email, failed_count: 1, last_failed_at: nowIso, created_at: nowIso }]);

      failedCount = 1;
    } else {
      const lastFailed = existing.last_failed_at ? new Date(existing.last_failed_at) : new Date(0);
      const diffMin = (Date.now() - lastFailed.getTime()) / 60000;

      if (diffMin > COOLDOWN_MINUTES) {
        await supabaseAdmin
          .from("auth_otp_attempts")
          .update({ failed_count: 1, last_failed_at: nowIso })
          .eq("email", email);

        failedCount = 1;
      } else {
        const newCount = (existing.failed_count ?? 0) + 1;
        await supabaseAdmin
          .from("auth_otp_attempts")
          .update({ failed_count: newCount, last_failed_at: nowIso })
          .eq("email", email);

        failedCount = newCount;
      }
    }

    if (failedCount === TEMP_LOCK_AFTER) {
      const lockUntil = new Date(Date.now() + TEMP_LOCK_SECONDS * 1000).toISOString();
      await supabaseAdmin
        .from("auth_otp_attempts")
        .update({ lock_until: lockUntil })
        .eq("email", email);

      return NextResponse.json({
        error: `Too many failed attempts. Try again in ${TEMP_LOCK_SECONDS} seconds.`,
        locked: true,
        lock_seconds: TEMP_LOCK_SECONDS,
        allow_resend: true
      }, {
        status: 423
      });
    }

    if (failedCount >= MAX_FAILED) {
      let userId: string | null = null;

      try {
        const { data: uRow, error: uError } = await supabaseAdmin
          .from("auth.users")
          .select("id")
          .eq("email", email)
          .single();

        if (!uError && uRow?.id) userId = uRow.id;
      } catch (e) { userId = null; }

      if (userId) {
        try {
          //@ts-exept-error
          const del = await supabaseAdmin.auth.admin.deleteUser(userId);
          if (del?.error) {
            await supabaseAdmin
              .from("auth.users")
              .delete()
              .eq("id", userId);
          }
        } catch (e) {
          try {
            await supabaseAdmin
              .from("auth.users")
              .delete()
              .eq("id", userId);
          } catch {}
        }
      }

      await supabaseAdmin
        .from("auth_otp_attempts")
        .delete()
        .eq("email", email);

      return NextResponse.json ({ error: "too_many_failed", deleted: true}, { status: 403})
    }

    const remaining = Math.max(0, MAX_FAILED - failedCount);
    return NextResponse.json(
    {
      error: `Invalid code. You have ${remaining} attempts remaining.`,
      failed_count: failedCount,
      remaining
    }, {status: 401})

  } catch (err: unknown) {
    console.error("OTP verify route error:", err)
    return NextResponse.json({ error: (err as Error).message ?? "internal server error" }, { status: 500 });
  }

}
