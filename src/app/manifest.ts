import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ALTOQUE",
    short_name: "ALTOQUE",
    description: "Necesidades, servicios, changas y empleo local.",
    start_url: "/",
    display: "standalone",
    background_color: "#05070a",
    theme_color: "#05070a",
    lang: "es-AR",
    icons: [
      {
        src: "/altoque-logo.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any maskable",
      },
    ],
  };
}
