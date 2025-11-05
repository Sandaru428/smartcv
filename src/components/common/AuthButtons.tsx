"use client"

import React, { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const AuthButtons = () => {
  const router = useRouter();
  // `undefined` => auth state not yet determined -> avoid flashing auth buttons
  // `null` => explicitly not signed in
  // user object => signed in
  const [user, setUser] = useState<any | null | undefined>(undefined);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    // get current user on mount
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUser(data?.user ?? null);
    });

    // subscribe to auth state changes to keep UI in sync
    const { data: subData } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser((session as any)?.user ?? null);
    });

    const subscription = (subData as any)?.subscription;

    return () => {
      mounted = false;
      if (subscription?.unsubscribe) subscription.unsubscribe();
    };
  }, []);

  // If auth status isn't resolved yet, render nothing to avoid flicker.
  if (user === undefined) return null;

  // Only show AuthButtons to unauthenticated users
  if (user) return null;

  return (
    <>
      <Button variant="primary" size="xs" onClick={() => router.push("/signup")}>
        Sign Up
      </Button>
      <Button variant="outline" size="xs" onClick={() => router.push("/signin")}>
        Sign In
      </Button>
    </>
  );
};

export default AuthButtons;
