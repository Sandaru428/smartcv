"use client";

import React, { Suspense } from "react";
import EmailVerifyForm from "@/components/auth/EmailVerifyForm";

export default function EmailVerify() {
  return (
    <Suspense fallback={<div aria-hidden />}>
      <EmailVerifyForm />
    </Suspense>
  );
}
