import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Diamond Painting Generator | Convert Images to Printable Diamond Art Pattern Kits",
  description: "Upload any photo or image and instantly convert it into a detailed Diamond Painting canvas pattern mapped to standard DMC thread color codes, complete with symbols, stone counts, and printable PDF booklet instructions.",
  keywords: ["diamond painting", "diamond art generator", "craft pixelator", "DMC floss finder", "cross stitch pattern", "printable diamond painting keys"],
  authors: [{ name: "Diamond Art Studio" }],
  openGraph: {
    title: "Diamond Painting Generator",
    description: "Convert photos to printable Diamond Art with exact DMC color counts and legends.",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${jetbrainsMono.variable}`}>
      <body id="app-root">
        {children}
      </body>
    </html>
  );
}
