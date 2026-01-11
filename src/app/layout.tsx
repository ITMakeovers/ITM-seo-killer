
import React from "react";
import BrandingColorsProvider from "@/components/BrandingColorsProvider";
import type { Metadata } from "next";
import { Outfit, Syne } from "next/font/google";
import "./globals.css";
import { generateSiteMetadata } from "@/lib/seo";
import { getSiteConfig } from "@/lib/config";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = generateSiteMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = getSiteConfig();
  


  return (
    <html lang={config.language} className="dark">
      <head>
        <link rel="icon" href={config.branding.faviconUrl} />
      </head>
      <body className={`${outfit.variable} ${syne.variable}`}>
        <BrandingColorsProvider />
        {children}
      </body>
    </html>
  );
}
