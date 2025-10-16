"use client";

import type React from "react";
import { createContext, useState, useContext, useEffect } from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>("light");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // inject minimal CSS for the reveal overlay once
    const styleId = "theme-reveal-styles";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = `
:root {
  --reveal-duration: 500ms;
  --reveal-scale: 0;
  --reveal-opacity: 1;
  --reveal-bg: #ffffff;
  --reveal-left: 100%;   /* default to top-right */
  --reveal-top: 0%;      /* default to top-right */
}
/* circular overlay that expands from a corner; will fade out after expansion */
html.theme-revealing::before {
  content: "";
  position: fixed;
  width: 200vmax;
  height: 200vmax;
  border-radius: 50%;
  left: var(--reveal-left);
  top: var(--reveal-top);
  transform: translate(-50%, -50%) scale(var(--reveal-scale));
  opacity: var(--reveal-opacity);
  background: var(--reveal-bg);
  transition: transform var(--reveal-duration) ease, opacity 250ms ease;
  z-index: 99999;
  pointer-events: none;
}
`;
      document.head.appendChild(style);
    }

    // This code will only run on the client side
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme ?? (prefersDark ? "dark" : "light");

    setTheme(initialTheme);
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("theme", theme);
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [theme, isInitialized]);

  const toggleTheme = () => {
    // determine target theme
    const target: Theme = theme === "light" ? "dark" : "light";

    // start animation from top-right for both directions
    const left = "100%";
    const top = "0%";

    // overlay color should match the target background
    const bg = target === "dark" ? "#0f172a" /* tailwind gray-900 */ : "#ffffff";

    const doc = document.documentElement;
    // set CSS vars to control the overlay
    doc.style.setProperty("--reveal-left", left);
    doc.style.setProperty("--reveal-top", top);
    doc.style.setProperty("--reveal-bg", bg);
    doc.style.setProperty("--reveal-scale", "0");
    doc.style.setProperty("--reveal-opacity", "1");

    // add reveal class, force reflow, then start expand to cover screen
    doc.classList.add("theme-revealing");
    void doc.getBoundingClientRect();
    // expand (show target color)
    doc.style.setProperty("--reveal-scale", "1");

    const expandMs = 300; // must match --reveal-duration
    const fadeMs = 50; // must match opacity transition

    // After expand finishes, switch theme underneath, then fade overlay out (no reverse scale)
    window.setTimeout(() => {
      setTheme(target);

      // start fade (opacity -> 0) to reveal theme underneath
      doc.style.setProperty("--reveal-opacity", "0");

      // cleanup after fade finishes
      window.setTimeout(() => {
        doc.classList.remove("theme-revealing");
        doc.style.removeProperty("--reveal-scale");
        doc.style.removeProperty("--reveal-opacity");
      }, fadeMs + 50);
    }, expandMs);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
