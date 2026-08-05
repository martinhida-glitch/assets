import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./launch.css";
import "./commercial.css";
import "./push.css";
import { ServiceWorkerRegister } from "@/components/service-worker-register";

export const metadata: Metadata = {
  metadataBase: new URL("https://altoque-app-one.vercel.app"),
  title: {
    default: "ALTOQUE",
    template: "%s · ALTOQUE",
  },
  description: "Conectamos necesidades con oportunidades. ALTOQUE.",
  applicationName: "ALTOQUE",
  keywords: ["trabajos locales", "servicios", "changas", "empleo", "mandados", "La Pampa", "ALTOQUE"],
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "ALTOQUE",
    title: "ALTOQUE · Necesidades y oportunidades cerca",
    description: "Publicá lo que necesitás, encontrá trabajo y resolvelo cerca tuyo.",
    url: "/",
  },
  twitter: {
    card: "summary",
    title: "ALTOQUE",
    description: "Necesidades, servicios, changas y empleo local.",
  },
  robots: { index: true, follow: true },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ALTOQUE",
  },
};

export const viewport: Viewport = {
  themeColor: "#03070d",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR">
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
