import type { MetadataRoute } from "next";

const base = "https://altoque-app-one.vercel.app";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/ayuda", "/seguridad", "/privacidad", "/terminos", "/login", "/register"].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/login" || path === "/register" ? 0.8 : 0.5,
  }));
}
