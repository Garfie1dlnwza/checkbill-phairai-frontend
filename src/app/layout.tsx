import { Noto_Sans_Thai } from "next/font/google";
import Navbar from "@/components/Layouts/Navbar";
import Background from "@/components/Layouts/Background";
import "./globals.css";

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
    <html lang="th">
      <body
        className={`${notoSansThai.variable} antialiased`}
        style={{
          fontFamily: "'Noto Sans Thai', sans-serif",
        }}
      >
        <Background />
        <Navbar />
        {children}
      </body>
    </html>
  );
}