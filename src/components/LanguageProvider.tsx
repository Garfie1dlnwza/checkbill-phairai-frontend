"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { translations, Lang, TranslationKey } from "@/i18n/translations";

const LangContext = createContext<{
  lang: Lang;
  t: (key: TranslationKey) => string;
  toggle: () => void;
}>({
  lang: "th",
  t: (key) => key,
  toggle: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("th");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("lang") as Lang | null;
      if (stored === "th" || stored === "en") setLang(stored);
    } catch {}
  }, []);

  const t = (key: TranslationKey): string =>
    (translations[lang][key] as string) ?? key;

  const toggle = () => {
    setLang((prev) => {
      const next = prev === "th" ? "en" : "th";
      try {
        localStorage.setItem("lang", next);
      } catch {}
      return next;
    });
  };

  return (
    <LangContext.Provider value={{ lang, t, toggle }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
