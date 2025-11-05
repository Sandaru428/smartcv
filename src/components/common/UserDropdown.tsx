"use client"

import React, { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { signout } from "@/hooks/authActions";

const UserDropdown: React.FC = () => {
  const [user, setUser] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

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

  // hide the avatar entirely when there's no signed-in user
  const initial = (user?.email ? String(user.email).charAt(0).toUpperCase() : "?") as string;

  // close when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!ref.current) return;
      if (ref.current.contains(e.target as Node)) return;
      setOpen(false);
    }

    if (open) window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [open]);

  // hide the avatar entirely when there's no signed-in user
  if (!user) return null;

  const goTo = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  const handleSignOut = async () => {
    setOpen(false);
    await signout();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        aria-label={`Profile menu for ${user.email}`}
        title={user.email}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-medium text-sm"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black/5 dark:ring-white/5 z-50 py-1">
          <button onClick={() => goTo("/profile")} className="menu-dropdown-item menu-dropdown-item-inactive w-full text-left">
            Profile
          </button>
          <button onClick={() => goTo("/settings")} className="menu-dropdown-item menu-dropdown-item-inactive w-full text-left">
            Settings
          </button>
          <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
          <button onClick={handleSignOut} className="menu-dropdown-item menu-dropdown-item-inactive w-full text-left">
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
