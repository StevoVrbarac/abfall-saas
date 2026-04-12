import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AbfallManager - Professionelle Abfallwirtschaft",
  description: "SaaS-Lösung für Abfallerzeuger",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className="h-full">
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
