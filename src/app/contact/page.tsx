"use client";

import { Github, Linkedin, Mail, Instagram,} from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center  px-4 py-16 ">
      <div className="relative max-w-lg w-full">
        {/* Main Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <div className=" rounded-full flex items-center justify-center mx-auto mb-4">
              <img
                src="/logo_checkbill_phairai.png"
                alt="Logo"
                className="w-50 h-50 rounded-full"
              />
            </div>
            <h1 className="text-3xl font-bold text-white">เกี่ยวกับเว็บไซต์</h1>
            <p className="text-gray-300 text-lg leading-relaxed">
              เว็บไซต์นี้จัดทำขึ้นเพื่อช่วยในการหารค่าเหล้าและค่าอาหารในกลุ่มเพื่อน
            </p>
          </div>

          {/* Developer Info */}
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-white rounded-full"></div>
              ผู้พัฒนา
            </h2>
            <p className="text-gray-300 text-lg pl-4">Rawipon Ponsarutwanit</p>
          </div>

          {/* Contact Links */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <div className="w-1 h-6 bg-white rounded-full"></div>
              ติดต่อ
            </h3>

            <div className="space-y-3 pl-4">
              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/rawipon-ponsarutwanit-43b4a632a/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/30 transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Linkedin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">LinkedIn</p>
                  <p className="text-gray-400 text-sm">Rawipon Ponsarutwanit</p>
                </div>
              </a>

              {/* GitHub */}
              <a
                href="https://github.com/Garfie1dlnwza"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-gray-500/30 transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Github className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">GitHub</p>
                  <p className="text-gray-400 text-sm">Garfie1dlnwza</p>
                </div>
              </a>

              {/* Email */}
              <a
                href="mailto:rawiponponsarutwanit@gmail.com"
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-500/30 transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">Email</p>
                  <p className="text-gray-400 text-sm">
                    rawiponponsarutwanit@gmail.com
                  </p>
                </div>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/g.gorfor"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pink-500/30 transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Instagram className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">Instagram</p>
                  <p className="text-gray-400 text-sm">g.gorfor</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-gray-500 text-sm mt-6">
          © 2023 Rawipon Ponsarutwanit. All rights reserved.
          <br />
          This website is not affiliated with any official entities.
        </p>
      </div>
    </div>
  );
}
