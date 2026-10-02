import type { Metadata } from "next";
import { Bodoni_Moda, IBM_Plex_Sans_Arabic, Manrope, Reem_Kufi } from "next/font/google";
import { Shell } from "@/components/Shell";
import "./globals.css";
import "./onboarding.css";

const display = Bodoni_Moda({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "500",
  style: ["normal", "italic"],
});

const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const reem = Reem_Kufi({
  variable: "--font-reem",
  subsets: ["arabic"],
  weight: "500",
});

const plex = IBM_Plex_Sans_Arabic({
  variable: "--font-plex",
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Wusool",
  description: "Ask for a home, a visa, tax, or the first month in Abu Dhabi.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${reem.variable} ${plex.variable}`} suppressHydrationWarning>
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
