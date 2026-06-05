import type { Metadata, Viewport } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import Navbar from "@/components/Layouts/Navbar";
import Background from "@/components/Layouts/Background";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://checkbill-phairai.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "เช็คบิลไผ่ไหร — หารบิลร้านอาหาร",
    template: "%s | เช็คบิลไผ่ไหร",
  },
  description:
    "คำนวณค่าอาหารหารเพื่อนได้เลย บอกทุกคนว่าต้องจ่ายเท่าไหร่ รองรับ VAT แชร์ผ่าน LINE ได้ทันที",
  keywords: [
    "หารบิล",
    "คิดเงินอาหาร",
    "แบ่งบิล",
    "คิดตังค์กลุ่ม",
    "bill splitter",
    "เช็คบิล",
    "หารค่าอาหาร",
    "คำนวณบิล",
  ],
  authors: [{ name: "Rawipon Ponsarutwanit" }],
  openGraph: {
    type: "website",
    locale: "th_TH",
    siteName: "เช็คบิลไผ่ไหร",
    title: "เช็คบิลไผ่ไหร — หารบิลร้านอาหาร",
    description:
      "คำนวณค่าอาหารหารเพื่อนได้เลย บอกทุกคนว่าต้องจ่ายเท่าไหร่ รองรับ VAT แชร์ผ่าน LINE ได้ทันที",
    images: [
      {
        url: "/logo_checkbill_phairai.png",
        width: 512,
        height: 512,
        alt: "เช็คบิลไผ่ไหร",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "เช็คบิลไผ่ไหร — หารบิลร้านอาหาร",
    description:
      "คำนวณค่าอาหารหารเพื่อนได้เลย บอกทุกคนว่าต้องจ่ายเท่าไหร่ รองรับ VAT แชร์ผ่าน LINE ได้ทันที",
    images: ["/logo_checkbill_phairai.png"],
  },
  icons: {
    icon: "/logo_checkbill_phairai.png",
    apple: "/logo_checkbill_phairai.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#c07800" },
    { media: "(prefers-color-scheme: light)", color: "#f5ecd6" },
  ],
  width: "device-width",
  initialScale: 1,
};

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        {/* Inline script runs before React hydrates — prevents theme flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme')||(matchMedia('(prefers-color-scheme:light)').matches?'light':'dark');document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`,
          }}
        />
      </head>
      <body
        className={`${notoSansThai.variable} antialiased`}
        style={{ fontFamily: "'Noto Sans Thai', sans-serif" }}
      >
        <ThemeProvider>
          <LanguageProvider>
            <Background />
            <Navbar />
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}