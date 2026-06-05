import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ติดต่อเรา",
  description:
    "ข้อมูลเกี่ยวกับเว็บไซต์เช็คบิลไผ่ไหร และช่องทางติดต่อผู้พัฒนา",
  alternates: {
    canonical: "/contact",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
