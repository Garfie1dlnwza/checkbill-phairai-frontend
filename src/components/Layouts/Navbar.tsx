"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navbarItems } from "@/constants/navbarItem";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import LangToggle from "@/components/LangToggle";
import { useLang } from "@/components/LanguageProvider";

export default function Navbar() {
  const pathname = usePathname();
  const { t } = useLang();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const isActive = (path: string) => pathname === path;

  // Close menu when pathname changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Handle body scroll lock
  useEffect(() => {
    if (typeof document === "undefined") return;

    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // Handle escape key
  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isMenuOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMenuOpen, onKeyDown]);

  // Focus first link when menu opens (accessibility)
  useEffect(() => {
    if (!isMenuOpen || !panelRef.current) return;
    const timer = setTimeout(() => {
      const firstLink = panelRef.current?.querySelector<HTMLAnchorElement>("a");
      firstLink?.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, [isMenuOpen]);

  return (
    <nav className="sticky top-4 z-20  mx-auto w-full max-w-2xl px-4">
      <div className="bg-[var(--surface-raised)] border border-[var(--surface-border)] px-6 py-3 shadow-2xl rounded-2xl">
        <div className="flex h-14 items-center justify-between px-4 md:px-6">
          {/* Center: Desktop nav */}
          <ul className="hidden md:flex items-center gap-x-6 mx-auto">
            {navbarItems.map((item) => (
              <li key={item.path} className="relative">
                <Link
                  href={item.path}
                  className={`px-1 py-1 font-bold transition-colors hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50 rounded-md ${
                    isActive(item.path) ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
                  }`}
                >
                  <span className="relative">
                    {t(item.tKey)}
                    {isActive(item.path) && (
                      <motion.span
                        layoutId="active-underline"
                        className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-[var(--accent)]"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Right: Theme toggle (desktop) + Mobile hamburger */}
          <div className="flex items-center gap-1">
            <LangToggle />
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen((v) => !v)}
              className="md:hidden inline-flex items-center justify-center rounded-xl p-2 text-[var(--text-primary)] hover:bg-[var(--surface-overlay)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Click-outside backdrop */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[-1] md:hidden"
              onClick={() => setIsMenuOpen(false)}
              style={{ WebkitTapHighlightColor: "transparent" }}
            />
          )}
        </AnimatePresence>

        {/* Mobile menu */}
        <AnimatePresence mode="wait">
          {isMenuOpen && (
            <motion.div
              id="mobile-menu"
              key="mobile-menu"
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="md:hidden overflow-hidden border-t border-[var(--surface-border)]"
            >
              <div className="max-h-[60vh] overflow-auto px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
                <ul className="flex flex-col gap-1">
                  {navbarItems.map((item) => (
                    <li key={item.path}>
                      <Link
                        href={item.path}
                        className={`block w-full rounded-xl px-4 py-3 text-center text-base font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50 ${
                          isActive(item.path)
                            ? "text-[var(--text-primary)] bg-[var(--surface-overlay)]"
                            : "text-[var(--text-primary)] hover:bg-[var(--surface-overlay)]"
                        }`}
                      >
                        {t(item.tKey)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}