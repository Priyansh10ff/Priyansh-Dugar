import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  weight: "variable",
  variable: "--font-display",
  display: "swap",
});

const body = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Priyansh",
  description:
    "Full-stack AI developer in Bengaluru. I build software that notices when things break, and patches them before anyone has to.",
  metadataBase: new URL("https://priyansh.vercel.app"),
  openGraph: {
    title: "Priyansh",
    description:
      "Full-stack AI developer in Bengaluru. I build software that notices when things break, and patches them before anyone has to.",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@_Priyansh_10",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#22305A",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
