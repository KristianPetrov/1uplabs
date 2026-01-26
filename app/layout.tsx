import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getSiteUrl } from "@/app/lib/site";
import { CartProvider } from "@/app/cart/CartProvider";
import FloatingCart from "@/app/components/FloatingCart";
import { PricingProvider } from "@/app/pricing/PricingProvider";
import AuthSessionProvider from "@/app/auth/SessionProvider";
import LabBackground from "@/app/components/LabBackground";

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
  icons: {
    icon: [{ url: "/icon", type: "image/png" }],
  },
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
        url: "/opengraph-image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "1UpLabs — Research Peptides",
    description:
      "Reliable, research-only peptide materials — backed by transparency, testing, and integrity.",
    images: ["/twitter-image"],
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

export default function RootLayout ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>)
{
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LabBackground />
        <div className="relative z-10 min-h-screen">
          <AuthSessionProvider>
            <PricingProvider>
              <CartProvider>
                {children}
                <FloatingCart />
              </CartProvider>
            </PricingProvider>
          </AuthSessionProvider>
        </div>
      </body>
    </html>
  );
}
