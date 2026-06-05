import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "เพิ่มรายการอาหาร",
  description:
    "เพิ่มเมนูพร้อมราคาและจำนวน กำหนดว่าใครสั่งอะไร รองรับ VAT คำนวณบิลหารอัตโนมัติ",
  alternates: {
    canonical: "/list-item",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
