"use client";

import { useLang } from "@/components/LanguageProvider";

export default function LangToggle() {
  const { lang, toggle } = useLang();

  return (
    <button
      onClick={toggle}
      aria-label={lang === "th" ? "Switch to English" : "เปลี่ยนเป็นภาษาไทย"}
      className="inline-flex items-center justify-center rounded-xl px-2.5 py-1.5 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-overlay)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50 transition-colors tracking-wider"
    >
      {lang === "th" ? "EN" : "TH"}
    </button>
  );
}
