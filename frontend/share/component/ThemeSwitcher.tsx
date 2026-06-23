"use client";

import { motion } from "framer-motion";

interface ThemeSwitcherProps {
  themeId: "day" | "night";
  onChange: (id: "day" | "night") => void;
}

export default function ThemeSwitcher({ themeId, onChange }: ThemeSwitcherProps) {
  const isNight = themeId === "night";

  return (
    <div className="theme-switch-wrap relative flex h-8 w-16 cursor-pointer items-center rounded-2xl">
      <motion.div
        className="theme-switch-thumb"
        data-night={isNight ? "true" : undefined}
        layout
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
      />
      <button
        type="button"
        onClick={() => onChange("day")}
        className="relative z-10 flex w-1/2 items-center justify-center text-xs"
        aria-label="Light mode"
      >
        ☀️
      </button>
      <button
        type="button"
        onClick={() => onChange("night")}
        className="relative z-10 flex w-1/2 items-center justify-center text-xs"
        aria-label="Dark mode"
      >
        🌙
      </button>
    </div>
  );
}
