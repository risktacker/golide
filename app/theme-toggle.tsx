"use client";

import { Moon, Sun } from "lucide-react";

const KEY = "golide-theme";

// Dark is the GOLIDE default; the visitor's choice is remembered per device.
// CSS shows the sun in dark mode and the moon in light mode, so the button
// renders identically on the server and needs no state.
export default function ThemeToggle({ className = "theme-toggle" }: { className?: string }) {
  return <button
    type="button"
    className={className}
    aria-label="Switch between light and dark theme"
    title="Switch theme"
    onClick={() => {
      const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
      document.documentElement.dataset.theme = next;
      document.documentElement.classList.toggle("dark", next === "dark");
      try { localStorage.setItem(KEY, next); } catch {}
    }}
  >
    <Sun className="theme-icon-sun" size={18} aria-hidden="true"/>
    <Moon className="theme-icon-moon" size={18} aria-hidden="true"/>
  </button>;
}
