"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-8 h-8" />;

  return (
    <button
      type="button"
      aria-label="เปลี่ยนธีม"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="
        w-8 h-8 rounded-lg flex items-center justify-center
        border border-slate-200 dark:border-white/12 text-slate-400 dark:text-white/35
        hover:text-[#0066FF] dark:hover:text-[#4D9FFF]
        hover:border-blue-200 dark:hover:border-[rgba(0,102,255,0.40)]
        hover:bg-blue-50 dark:hover:bg-[rgba(0,102,255,0.08)]
        hover:shadow-[0_2px_8px_rgba(0,102,255,0.12)]
        transition-all duration-200
      "
    >
      {theme === "dark"
        ? <Sun className="w-4 h-4 text-amber-400" />
        : <Moon className="w-4 h-4" />}
    </button>
  );
}
