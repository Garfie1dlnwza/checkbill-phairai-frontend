import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "คนหาร",
  description:
    "เพิ่มรายชื่อเพื่อนที่จะหารบิลด้วยกัน ดูยอดจ่ายของแต่ละคนได้ทันที",
  alternates: {
    canonical: "/divider",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
