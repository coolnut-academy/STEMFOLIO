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
        w-8 h-8 rounded-xl flex items-center justify-center
        border border-[rgba(255,255,255,0.08)] text-white/30
        hover:text-white/70
        hover:border-[rgba(99,102,241,0.38)]
        hover:bg-[rgba(99,102,241,0.10)]
        transition-all duration-200
      "
    >
      {theme === "dark"
        ? <Sun className="w-4 h-4 text-amber-400" />
        : <Moon className="w-4 h-4 text-white/55" />}
    </button>
  );
}
