"use client";

import { Github, Linkedin, Mail, Instagram } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
      <div className="relative max-w-sm sm:max-w-lg w-full">
        {/* Main Card */}
        <div className="bg-[var(--surface-raised)] rounded-2xl sm:rounded-3xl shadow-2xl border border-[var(--surface-border)] p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <img
                src="/logo_checkbill_phairai.png"
                alt="Logo"
                className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full object-cover"
              />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--text-primary)]">เกี่ยวกับเว็บไซต์</h1>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed px-2">
              เว็บไซต์นี้จัดทำขึ้นเพื่อช่วยในการหารค่าเหล้าและค่าอาหารในกลุ่มเพื่อน
            </p>
          </div>

          {/* Developer Info */}
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] mb-2 sm:mb-3 flex items-center gap-2">
              <div className="w-1 h-4 bg-[var(--accent)] rounded-full"></div>
              ผู้พัฒนา
            </h2>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base pl-3">Rawipon Ponsarutwanit</p>
          </div>

          {/* Contact Links */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <div className="w-1 h-4 bg-[var(--accent)] rounded-full"></div>
              ติดต่อ
            </h3>

            <div className="space-y-2 pl-3">
              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/rawipon-ponsarutwanit-43b4a632a/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-[var(--surface-subtle)] hover:bg-[var(--surface-overlay)] border border-[var(--surface-border)] hover:border-blue-500/30 transition-all duration-300 group"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Linkedin className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[var(--text-primary)] font-medium text-sm">LinkedIn</p>
                  <p className="text-[var(--text-muted)] text-xs truncate">Rawipon Ponsarutwanit</p>
                </div>
              </a>

              {/* GitHub */}
              <a
                href="https://github.com/Garfie1dlnwza"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-[var(--surface-subtle)] hover:bg-[var(--surface-overlay)] border border-[var(--surface-border)] hover:border-gray-500/30 transition-all duration-300 group"
              >
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Github className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[var(--text-primary)] font-medium text-sm">GitHub</p>
                  <p className="text-[var(--text-muted)] text-xs truncate">Garfie1dlnwza</p>
                </div>
              </a>

              {/* Email */}
              <a
                href="mailto:rawiponponsarutwanit@gmail.com"
                className="flex items-center gap-3 p-3 rounded-lg bg-[var(--surface-subtle)] hover:bg-[var(--surface-overlay)] border border-[var(--surface-border)] hover:border-red-500/30 transition-all duration-300 group"
              >
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[var(--text-primary)] font-medium text-sm">Email</p>
                  <p className="text-[var(--text-muted)] text-xs truncate">
                    rawiponponsarutwanit@gmail.com
                  </p>
                </div>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/g.gorfor"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-[var(--surface-subtle)] hover:bg-[var(--surface-overlay)] border border-[var(--surface-border)] hover:border-pink-500/30 transition-all duration-300 group"
              >
                <div className="w-8 h-8 bg-pink-700 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Instagram className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[var(--text-primary)] font-medium text-sm">Instagram</p>
                  <p className="text-[var(--text-muted)] text-xs truncate">g.gorfor</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-[var(--text-muted)] text-xs mt-4 px-2">
          © 2024 Rawipon Ponsarutwanit. All rights reserved.
          <br className="hidden sm:block" />
          <span className="sm:hidden"> </span>
          This website is not affiliated with any official entities.
        </p>
      </div>
    </div>
  );
}