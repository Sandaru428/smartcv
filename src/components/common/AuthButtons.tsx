"use client"

import React, { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { signout } from "@/hooks/authActions";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const AuthButtons = () => {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);

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

  return (
    <>
      {!user ? (
        <>
          <Button variant="primary" size="xs" onClick={() => router.push("/signup")}>
            Sign Up
          </Button>
          <Button variant="outline" size="xs" onClick={() => router.push("/signin")}>
            Sign In
          </Button>
        </>
      ) : (
        <Button variant="outline" size="xs" onClick={signout}>
          Sign Out
        </Button>
      )}
    </>
  );
};

export default AuthButtons;
