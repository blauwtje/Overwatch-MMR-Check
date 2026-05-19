import type { Metadata } from "next";
import "./globals.css";
import { Barlow_Condensed, Barlow, Geist_Mono } from "next/font/google";
import { cn } from "@/lib/utils";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-display",
  display: "swap",
});

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "owMMR — Overwatch 2 MMR Estimator",
  description: "Estimate your Overwatch 2 MMR based on rank and performance stats. Unofficial community tool.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        barlowCondensed.variable,
        barlow.variable,
        geistMono.variable
      )}
    >
      <body className="antialiased" style={{ fontFamily: "var(--font-body, sans-serif)" }}>
        {children}
      </body>
    </html>
  );
}
