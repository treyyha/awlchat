"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

interface ThemeToggleProps {
  compact?: boolean;
}

export default function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = !mounted || resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`inline-flex items-center justify-center gap-2 rounded border border-border bg-surface px-3 py-2 text-sm font-medium text-muted transition-colors hover:border-border-hover hover:text-foreground ${
        compact ? "px-2.5" : ""
      }`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
      {!compact && <span>{isDark ? "Light mode" : "Dark mode"}</span>}
    </button>
  );
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="10" cy="10" r="3.25" />
      <path strokeLinecap="round" d="M10 2.25v1.5M10 16.25v1.5M2.25 10h1.5m12.5 0h1.5M4.52 4.52l1.06 1.06m8.84 8.84 1.06 1.06m0-10.96-1.06 1.06M5.58 14.42l-1.06 1.06" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.75 12.72A6.75 6.75 0 0 1 7.28 3.25a6.75 6.75 0 1 0 9.47 9.47Z"
      />
    </svg>
  );
}
