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

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://priyansh.vercel.app";
const DESCRIPTION =
  "Full-stack AI developer in Bengaluru. I build software that notices when things break, and patches them before anyone has to.";

export const metadata: Metadata = {
  title: { default: "Priyansh", template: "%s · Priyansh" },
  description: DESCRIPTION,
  metadataBase: new URL(SITE),
  alternates: { canonical: "/" },
  keywords: [
    "Priyansh",
    "Priyansh Dugar",
    "full-stack developer",
    "AI developer",
    "Next.js",
    "Bengaluru",
    "Scaler School of Technology",
    "Patchwork",
  ],
  authors: [{ name: "Priyansh Dugar", url: SITE }],
  openGraph: {
    title: "Priyansh",
    description: DESCRIPTION,
    url: SITE,
    siteName: "Priyansh",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Priyansh",
    description: DESCRIPTION,
    creator: "@_Priyansh_10",
  },
  robots: { index: true, follow: true },
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
