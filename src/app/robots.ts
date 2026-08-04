import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: ["/", "/ayuda", "/seguridad", "/privacidad", "/terminos"], disallow: ["/app/", "/auth/", "/update-password"] },
    ],
    sitemap: "https://altoque-app-one.vercel.app/sitemap.xml",
  };
}
