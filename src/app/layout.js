import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], display: "swap", variable: "--font-mono" });

export const metadata = {
  title: "Rizal Maulana — Portfolio",
  description: "Crafting Web Experiences & Logic Solutions — Informatics student, web & logic projects, achievements.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${inter.variable} ${mono.variable}`}>
      <body className={`${inter.className} bg-[#0a0404] text-[#F2F2F3] antialiased`}>{children}</body>
    </html>
  );
}
