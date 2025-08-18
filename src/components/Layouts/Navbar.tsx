"use client";
<<<<<<< HEAD
import React, { useEffect, useState, useCallback, useRef } from "react";
=======
import React, { useState } from "react";
>>>>>>> c4793d (rename Layouts_temp to Layouts)
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navbarItems } from "@/constants/navbarItem";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
<<<<<<< HEAD
  const panelRef = useRef<HTMLDivElement | null>(null);

  const isActive = (path: string) => pathname === path;

  // Close menu when pathname changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Handle body scroll lock
  useEffect(() => {
    if (typeof document === "undefined") return;
    
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    // Cleanup function to restore scroll on unmount
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
    if (isMenuOpen) {
      document.addEventListener("keydown", onKeyDown);
    }
    
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isMenuOpen, onKeyDown]);

  // Focus first link when menu opens (accessibility)
  useEffect(() => {
    if (!isMenuOpen || !panelRef.current) return;
    
    // Use setTimeout to ensure DOM is ready
    const timer = setTimeout(() => {
      const firstLink = panelRef.current?.querySelector<HTMLAnchorElement>("a");
      firstLink?.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, [isMenuOpen]);

  return (
    <nav className="sticky top-4 z-20  mx-auto w-full max-w-2xl px-4">
      <div className="backdrop-blur-xl border border-white/30 px-6 py-3 shadow-2xl rounded-2xl">
        <div className="flex h-14 items-center justify-between px-4 md:px-6">
          {/* Center: Desktop nav */}
          <ul className="hidden md:flex items-center gap-x-6 mx-auto">
            {navbarItems.map((item) => (
              <li key={item.path} className="relative">
                <Link
                  href={item.path}
                  className={`px-1 py-1 font-bold transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-md ${
                    isActive(item.path) ? "text-white" : "text-white/70"
                  }`}
                >
                  <span className="relative">
                    {item.title}
                    {isActive(item.path) && (
                      <motion.span
                        layoutId="active-underline"
                        className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-white"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Right: Mobile toggle */}
          <button
            onClick={() => setIsMenuOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center rounded-xl p-2 text-white/90 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
=======

  return (
    <nav className="border rounded-2xl mt-5 border-white/30 mx-auto max-w-2xl shadow-md flex py-4 justify-center backdrop-blur-xl shadow-2xl relative">
      <div className="flex items-center justify-center px-6 py-3 w-full max-w-6xl">
        <ul className="hidden md:flex items-center gap-x-8">
          {navbarItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`font-medium transition-colors hover:text-white ${
                    isActive ? "text-white font-bold" : "text-white/60"
                  }`}
                >
                  {item.title}
                  {isActive && (
                    <span className="block mt-1 h-0.5 bg-white rounded-full" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-md text-white/80 hover:bg-white/10"
            aria-label="Toggle menu"
>>>>>>> c47b93d (rename Layouts_temp to Layouts)
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
<<<<<<< HEAD

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
              className="md:hidden overflow-hidden border-t border-white/15"
            >
              <div className="max-h-[60vh] overflow-auto px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
                <ul className="flex flex-col gap-1">
                  {navbarItems.map((item) => (
                    <li key={item.path}>
                      <Link
                        href={item.path}
                        className={`block w-full rounded-xl px-4 py-3 text-center text-base font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
                          isActive(item.path)
                            ? "text-white bg-white/10"
                            : "text-white/90 hover:bg-white/10"
                        }`}
                      >
                        {item.title}
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
=======
      </div>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
          >
            <ul className="flex flex-col px-6 pb-6 pt-2">
              {navbarItems.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block py-3 text-center font-semibold transition-colors rounded-md ${
                      pathname === item.path
                        ? "text-blue-400 bg-white/5"
                        : "text-white/80 hover:bg-white/10"
                    }`}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
>>>>>>> c47b93d (rename Layouts_temp to Layouts)
