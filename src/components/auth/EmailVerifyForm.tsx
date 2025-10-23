"use client";

import React, { useEffect, useRef, useState } from "react";
import Input from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import { useRouter, useSearchParams } from "next/navigation";

export default function EmailVerifyForm() {
	const DIGITS = 6;
	const [values, setValues] = useState<string[]>(() => Array(DIGITS).fill(""));
	const [shake, setShake] = useState(false);
	const [loading, setLoading] = useState(false);
	const [verifyDisabled, setVerifyDisabled] = useState(false);
	const [inputDisabled, setInputDisabled] = useState(false);
	const [resendDisabled, setResendDisabled] = useState(false);
	const [lockSeconds, setLockSeconds] = useState<number | null>(null);
	const [resendLockSeconds, setResendLockSeconds] = useState<number | null>(null);
	const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
	const router = useRouter();
	const searchParams = useSearchParams()
	const email = searchParams.get("email") || "";

	useEffect(() => {
		let t:number | undefined
		if (lockSeconds && lockSeconds > 0) {
			setVerifyDisabled(true);
			setInputDisabled(true);
			setResendDisabled(false);
			
			t = window.setInterval(() => {
				setLockSeconds ((s) => {
					if (!s || s <= 1) {
						setVerifyDisabled(false);
						setInputDisabled(false);
						setLockSeconds(null);
						return null;
					}
					return s - 1;
				});
			}, 1000);
		}
		return () => { if (t) window.clearInterval(t); };

	}, [lockSeconds]);

	useEffect(() => {
		let t:number | undefined
		if (resendLockSeconds && resendLockSeconds > 0) {
			setResendDisabled(true);
			setVerifyDisabled(true);
			setInputDisabled(true);
			
			t = window.setInterval(() => {
				setResendLockSeconds ((s) => {
					if (!s || s <= 1) {
						setResendDisabled(false);
						setVerifyDisabled(false);
						setInputDisabled(false);
						setResendLockSeconds(null);
						return null;
					}
					return s - 1;
				});
			}, 1000);
		}
		return () => { if (t) window.clearInterval(t); };

	}, [resendLockSeconds]);

	const focusInput = (index: number) => {
		const el = inputsRef.current[index];
		if (el) el.focus();
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
		if (inputDisabled) return;
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
		if (inputDisabled) { e.preventDefault(); return; }

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
		if (inputDisabled) { e.preventDefault(); return; }

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

		if (verifyDisabled) return;
		setLoading(true);

		try {
			const res = await fetch('/api/verify-otp', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, token: code })
			});

			const data = await res.json();

			if (res.status === 200) {
				router.push("/home");
				return;
			}

			if (res.status === 423) {
				const  seconds = data.lock_seconds ?? 30
				setLockSeconds(seconds);

				setValues(Array(DIGITS).fill(""));
				setShake(true)
				setTimeout(() => setShake(false), 500);
				focusInput(0);
				return;
			}

			if (res.status === 403) {
				alert("Too many failed attempts - account removed or locked. Please signup again");
				return;
			}

			if (res.status === 401) {
				const remaining = data?.remaining
				setValues(Array(DIGITS).fill(""));
				setShake(true)
				setTimeout(() => setShake(false), 500);
				focusInput(0)
				alert(remaining ? `Invalid code. You have ${remaining} attempts remaining.` : "Invalid code.");
				return;
			}

			alert(data?.error ?? "Verification failed. Please try again.");

		} catch (err: unknown) {
			console.error("Verify request failed", err);
			alert((err as Error).message ?? "Verification failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleResend = async () => {
		if (resendDisabled) return;
		setLoading(true);

		try {
			const res = await fetch('/api/resend', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email })
			});

			const data = await res.json();

			if (res.status === 200) {
				alert("A new verification code has been sent to your email.");
				return;
			}

			if (res.status === 429) {
				const seconds = data.lock_seconds ?? 12 * 3600
				setResendLockSeconds(seconds);
				alert("Too many resend requests. Please wait before trying again.");
				return;
			}

			if (res.status === 423) {
				const seconds = data.lock_seconds ?? 30
				setLockSeconds(seconds);
				alert("You are temporarily locked from verifying. Please wait before trying again.");
				return;
			}

			alert(data?.error ?? "Resend failed. Please try again.");
		} catch (err: unknown) {
			console.error("Resend OTP error:", err);
			alert((err as Error).message ?? "Resend failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex flex-col items-center w-full py-8 min-h-[90vh] justify-center">
      <div className="flex flex-col justify-center items-center w-full max-w-md mx-auto p-8 border border-gray-300 rounded-2xl shadow-md dark:border-gray-600">
        
        <img src="/favicon.ico" alt="App favicon" aria-hidden className="w-15 h-15 mb-8" />

        <h1 className="mb-4 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">Verify Your Email</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-4">Check your email for the one-time code.</p>

        {/* simple shake animation injected locally */}
        <style>{`
          @keyframes shake {
            0% { transform: translateX(0); }
            20% { transform: translateX(-6px); }
            40% { transform: translateX(6px); }
            60% { transform: translateX(-4px); }
            80% { transform: translateX(4px); }
            100% { transform: translateX(0); }
          }
          .shake {
            animation: shake 400ms ease-in-out;
          }
        `}</style>

        <div className={`flex gap-2 justify-center my-4 md:gap-4 ${shake ? "shake" : ""}`}>
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
							disabled={inputDisabled}
            />
          ))}
        </div>

        <div className="text-center text-gray-500 dark:text-gray-400 mt-2">
          {lockSeconds ? (
						<p>Your account is temporarily locked. Please wait {lockSeconds} second{lockSeconds !== 1 ? 's' : ''} before trying again.</p>
					) : resendLockSeconds ? (
						<p>Too many resends. Please wait {Math.ceil((resendLockSeconds ?? 0) / 60)} minute{resendLockSeconds !== 1 ? 's' : ''} before trying again.</p>
					) : (
						<p>The code will expire in 6 minutes.</p>
					)}
        </div>

        <div className="w-full my-4">
          <Button onClick={handleVerify} disabled={verifyDisabled || loading} className="w-full">
            {loading ? "Working..." : "Verify"}
          </Button>
        </div>

        <div className="mt-2 text-center text-gray-500 dark:text-gray-400">
          <p className="mb-2">
            Didn&apos;t receive the code?
            <span onClick={handleResend} className={`text-blue-500 cursor-pointer ${resendDisabled ? "opacity-50 cursor-not-allowed" : ""}`}> Resend</span>
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
