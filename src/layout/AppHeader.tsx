"use client";

import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import React from "react";

const AppHeader = () => {

  return (
    <div className="sticky top-0 flex w-full border-gray-200 z-99999 dark:border-gray-800 bg-background lg:border-b">
      <div className="flex items-center gap-2 2xsm:gap-3">
        <ThemeToggleButton />
      </div>
      {/* <!-- User Area --> */}
    </div>
  );
};

export default AppHeader;
