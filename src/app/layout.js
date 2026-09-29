import { Space_Grotesk, JetBrains_Mono, Instrument_Serif, Caveat } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], display: "swap", variable: "--font-mono" });
const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: ["400"], display: "swap", variable: "--font-serif" });
const caveat = Caveat({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap", variable: "--font-hand" });

export const metadata = {
  title: "Rizal Maulana — Portfolio",
  description: "Crafting Web Experiences & Logic Solutions — Informatics student, web & logic projects, achievements.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${spaceGrotesk.variable} ${mono.variable} ${instrumentSerif.variable} ${caveat.variable}`}>
      <body className={`${spaceGrotesk.className} bg-[#0a0404] text-[#F2F2F3] antialiased`}>{children}</body>
    </html>
  );
}
