import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://arody.cloud'),
  title: {
    default: "Arody Blog | Fotografía",
    template: "%s | Arody"
  },
  description: "Portafolio y blog de fotografía curada.",
  openGraph: {
    title: "Arody Blog",
    description: "Portafolio y blog de fotografía curada.",
    url: 'https://arody.cloud',
    siteName: 'Arody Fotografía',
    images: [
      {
        url: '/arody-portrait.jpg', // Default fallback image from public
        width: 1200,
        height: 630,
      }
    ],
    locale: 'es_MX',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${playfair.variable} ${inter.variable} antialiased min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
