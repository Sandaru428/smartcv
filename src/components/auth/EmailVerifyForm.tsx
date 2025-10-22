"use client";

import React, { useRef, useState } from "react";
import Input from "../ui/InputField"; // <-- use the Input component
import Button from "@/components/ui/Button";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function EmailVerifyForm() {
	const DIGITS = 6;
	const [values, setValues] = useState<string[]>(() => Array(DIGITS).fill(""));
	const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const router = useRouter();
	const searchParams = useSearchParams()
	const email = searchParams.get("email") || "";
	const supabase = createClient()

	const focusInput = (index: number) => {
		const el = inputsRef.current[index];
		if (el) el.focus();
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
		const val = e.target.value.replace(/\D/g, ""); // only digits
		if (!val) {
			// empty input (user cleared)
			setValues((prev) => {
				const next = [...prev];
				next[idx] = "";
				return next;
			});
			return;
		}

		// If user pastes more than 1 char into a single input, handlePaste will handle; here handle single char
		const char = val[0];
		setValues((prev) => {
			const next = [...prev];
			next[idx] = char;
			return next;
		});
		// move focus to next
		if (idx < DIGITS - 1) {
			focusInput(idx + 1);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
		if (e.key === "Backspace") {
			if (values[idx]) {
				// clear current
				setValues((prev) => {
					const next = [...prev];
					next[idx] = "";
					return next;
				});
				return;
			}
			// move to previous if empty
			if (idx > 0) {
				focusInput(idx - 1);
				setValues((prev) => {
					const next = [...prev];
					next[idx - 1] = "";
					return next;
				});
			}
		} else if (e.key === "ArrowLeft" && idx > 0) {
			focusInput(idx - 1);
		} else if (e.key === "ArrowRight" && idx < DIGITS - 1) {
			focusInput(idx + 1);
		}
	};

	const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
		const paste = e.clipboardData.getData("text").replace(/\D/g, "");
		if (!paste) return;
		const chars = paste.slice(0, DIGITS).split("");
		setValues((prev) => {
			const next = [...prev];
			for (let i = 0; i < chars.length; i++) {
				next[i] = chars[i];
			}
			return next;
		});
		// focus the next empty or last
		const nextIndex = Math.min(chars.length, DIGITS - 1);
		focusInput(nextIndex);
		e.preventDefault();
	};

	const handleVerify = async () => {
		const code = values.join("");
		if (code.length !== DIGITS || /\D/.test(code)) {
			alert("Please enter a valid 6-digit code.");
			return;
		}
		
		try {
			const { data, error } = await supabase.auth.verifyOtp({
				email,
				token: code,
				type: "signup",
			});

			if (error) {
				console.error("OTP Verification error:", error);
				alert("Verification failed. Please try again.");
				return;
			}

			router.push("/home");

		} catch (err: any) {
			alert(err.message ?? "Verification failed. Please try again.");
			console.error("OTP Verification error:", err);
		}
	};

	const handleResend = async () => {
		try {
			const { data, error } = await supabase.auth.signInWithOtp({
				email,
				options: { shouldCreateUser: false }
			});

			if (error) throw error;
			alert("A new verification code has been sent to your email.");
		
		} catch (err: any) {
			alert(err.message ?? "Resend failed. Please try again.");
			console.error("Resend OTP error:", err);
		}
	};

	return (
		<div className="flex flex-col items-center w-full py-8 min-h-[90vh] justify-center">
      <div className="flex flex-col justify-center items-center w-full max-w-md mx-auto p-8 border border-gray-300 rounded-2xl shadow-md dark:border-gray-600">
        
        <img src="/favicon.ico" alt="App favicon" aria-hidden className="w-15 h-15 mb-8" />

        <h1 className="mb-4 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">Verify Your Email</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-4">Check your email for the one-time code.</p>

        <div className="flex gap-2 justify-center my-4 md:gap-4">
          {Array.from({ length: DIGITS }).map((_, idx) => (
            <Input
              key={idx}
              ref={(el: HTMLInputElement | null) => { inputsRef.current[idx] = el; }}
              value={values[idx]}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e, idx)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, idx)}
              onPaste={handlePaste}
              maxLength={1}
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-10 h-14 text-center text-lg"
              aria-label={`Digit ${idx + 1}`}
            />
          ))}
        </div>

        <div className="text-center text-gray-500 dark:text-gray-400 mt-2">
          code expire
        </div>

        <div className="w-full my-4">
          <Button onClick={handleVerify} className="w-full">
            Verify
          </Button>
        </div>

        <div className="mt-2 text-center text-gray-500 dark:text-gray-400">
          <p className="mb-2">
            Didn&apos;t receive the code?
            <span onClick={handleResend} className="text-blue-500 cursor-pointer"> Resend</span>
          </p>
          <p>
            Wrong email?
            <span onClick={() => router.push("/signup")} className="text-blue-500 cursor-pointer"> Go back to Signup</span>
          </p>
        </div>
      </div>
		</div>
	);
}
