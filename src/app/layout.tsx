import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/service-worker-register";

export const metadata: Metadata = {
  title: {
    default: "ALTOQUE",
    template: "%s · ALTOQUE",
  },
  description: "Conectamos necesidades con oportunidades. ALTOQUE.",
  applicationName: "ALTOQUE",
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
