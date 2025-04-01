import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { RootLayoutClient } from "@/components/layout/RootLayoutClient";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LinkForge - Modern Link Yönetim Platformu",
  description: "Discord kullanıcıları ve gamerlar için özelleştirilebilir modern link yönetim platformu",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body 
        className={`${inter.className} min-h-screen bg-brand-darker text-gray-100`}
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(134, 93, 255, 0.15) 1.5px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      >
        <Providers>
          <RootLayoutClient>
            {children}
          </RootLayoutClient>
        </Providers>
      </body>
    </html>
  );
}
