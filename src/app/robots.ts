import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://checkbill-phairai.vercel.app";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/summary",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
