import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getSiteUrl } from "@/app/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "1UpLabs — Research Peptides",
    template: "%s | 1UpLabs",
  },
  description:
    "1UpLabs provides researchers with reliable, high-quality peptide materials for laboratory research only — supported by transparency, testing, and integrity at every step.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "1UpLabs",
    title: "1UpLabs — Research Peptides",
    description:
      "Reliable, research-only peptide materials — backed by transparency, testing, and integrity.",
    url: "/",
    images: [
      {
        url: "/1uplabs-mushroom-molecule.png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "1UpLabs — Research Peptides",
    description:
      "Reliable, research-only peptide materials — backed by transparency, testing, and integrity.",
    images: ["/1uplabs-mushroom-molecule.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
