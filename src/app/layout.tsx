import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AuraCare - Proactive Caregiving",
  description: "Proactive AI-driven monitoring system for elderly care.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="h-full antialiased font-sans"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          :root {
            --font-outfit: 'Outfit', sans-serif;
          }
        `}</style>
      </head>
      <body className="min-h-full flex flex-col font-outfit">{children}</body>
    </html>
  );
}
