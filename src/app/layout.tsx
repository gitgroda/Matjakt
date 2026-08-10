import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Matjakt Uppsala – Veckans erbjudanden från ICA, Willys & Hemköp",
  description: "Sök och jämför veckans reklamblad och matpriser från butiker i Uppsala. Hitta bästa rabatterna hos Willys, Hemköp och ICA.",
  keywords: ["matpriser uppsala", "veckans erbjudanden", "willys uppsala", "ica uppsala", "hemköp uppsala", "matkasse", "reklamblad uppsala"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="sv"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-slate-50`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
