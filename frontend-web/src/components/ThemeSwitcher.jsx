import { motion } from "framer-motion";
import { IconMoon, IconSun } from "./Icons";

/**
 * @param {{ themeId: "day" | "night"; onChange: (id: "day" | "night") => void }} props
 */
export default function ThemeSwitcher({ themeId, onChange }) {
  const isNight = themeId === "night";

  return (
    <div className="theme-switch-wrap rounded-2xl p-1" role="group" aria-label="Theme">
      <div className="relative flex rounded-xl bg-[color-mix(in_srgb,var(--primary)_8%,transparent)] p-0.5 ring-1 ring-[var(--border)]">
        <motion.div
          className="absolute inset-y-0.5 rounded-[10px] bg-[var(--surface-elevated)] shadow-[var(--shadow-soft)] ring-1 ring-[var(--border)]"
          layout
          transition={{ duration: 0.18, ease: "easeOut" }}
          style={{
            width: "calc(50% - 2px)",
            left: isNight ? "calc(50% + 1px)" : "2px",
          }}
        />
        <button
          type="button"
          onClick={() => onChange("day")}
          className={`relative z-[1] flex flex-1 items-center justify-center gap-1.5 rounded-[10px] py-2 text-xs font-semibold transition-colors ${
            !isNight ? "text-[var(--text)]" : "text-[var(--text-soft)]"
          }`}
          aria-pressed={!isNight}
        >
          <span className="text-[14px]" aria-hidden>
            <IconSun />
          </span>
          Light
        </button>
        <button
          type="button"
          onClick={() => onChange("night")}
          className={`relative z-[1] flex flex-1 items-center justify-center gap-1.5 rounded-[10px] py-2 text-xs font-semibold transition-colors ${
            isNight ? "text-[var(--text)]" : "text-[var(--text-soft)]"
          }`}
          aria-pressed={isNight}
        >
          <span className="text-[14px]" aria-hidden>
            <IconMoon />
          </span>
          Dark
        </button>
      </div>
    </div>
  );
}
