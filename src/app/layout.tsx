import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "AuraCare - Proactive Caregiving",
  description: "Proactive AI-driven monitoring system for elderly care.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`h-full antialiased font-sans ${outfit.variable}`}
    >
      <body className="min-h-full flex flex-col font-outfit">{children}</body>
    </html>
  );
}
