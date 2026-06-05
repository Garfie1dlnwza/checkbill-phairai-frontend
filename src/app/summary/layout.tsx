import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "สรุปบิล",
  description:
    "สรุปยอดจ่ายของแต่ละคน เลือกสไตล์ใบเสร็จและแชร์ผ่าน LINE ได้ทันที",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
