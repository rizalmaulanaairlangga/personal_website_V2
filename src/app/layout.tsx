import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono, Instrument_Serif, Caveat } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], display: "swap", variable: "--font-mono" });
const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: ["400"], display: "swap", variable: "--font-serif" });
const caveat = Caveat({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap", variable: "--font-hand" });

export const metadata: Metadata = {
  title: "Portfolio CMS",
  description: "Private CMS for managing portfolio projects",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${mono.variable} ${instrumentSerif.variable} ${caveat.variable}`}>
      <body className={`${spaceGrotesk.className} bg-background text-text antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  );
}