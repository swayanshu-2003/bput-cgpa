import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/cgpa", "/sgpa"],
        disallow: ["/history"],
      },
    ],
    sitemap: "https://bput-cgpa.vercel.app/sitemap.xml",
    host: "https://bput-cgpa.vercel.app",
  };
}
