"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navbarItems } from "@/constants/navbarItem";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
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
