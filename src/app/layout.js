import { Space_Grotesk, JetBrains_Mono, Instrument_Serif, Caveat } from "next/font/google";
import RouteScrollReset from "@/components/RouteScrollReset";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], display: "swap", variable: "--font-mono" });
const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: ["400"], display: "swap", variable: "--font-serif" });
const caveat = Caveat({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap", variable: "--font-hand" });

export const metadata = {
  title: "Personal Portofolio Website | Rizal Maulana Airlangga",
  description: "Crafting Web Experiences & Logic Solutions — Informatics student, web & logic projects, achievements.",
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${spaceGrotesk.variable} ${mono.variable} ${instrumentSerif.variable} ${caveat.variable}`}>
      <body className={`${spaceGrotesk.className} bg-[#0a0404] text-[#F2F2F3] antialiased`}>
        <RouteScrollReset />
        {children}
      </body>
    </html>
  );
}
