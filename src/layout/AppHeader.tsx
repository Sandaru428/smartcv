"use client";

import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import React from "react";
import AuthButtons from "@/components/common/AuthButtons";

const AppHeader = () => {

  return (
    <div className="sticky top-0 flex items-center justify-between w-full z-99999 px-4">
      <div className="flex items-center gap-2 2xsm:gap-3">
        {/* ...existing code... left area (logo / nav) ... */}
      </div>

      <div className="flex items-center gap-2 2xsm:gap-3">
        <ThemeToggleButton />
        <AuthButtons />
      </div>

      {/* <!-- User Area --> */}
    </div>
  );
};

export default AppHeader;
