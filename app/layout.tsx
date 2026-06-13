import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Imersão Claude para Marketing — Kalidash",
  description:
    "Monte sua própria mini agência de marketing em 8 horas. Imersão presencial em Belo Horizonte, 01 de Agosto.",
  icons: {
    icon: "/kalidash_symbol.svg",
  },
  openGraph: {
    title: "Imersão Claude para Marketing — Kalidash",
    description: "8 horas de pura engenharia operativa. BH, 01/08.",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`h-full antialiased ${inter.variable} font-sans ${geist.variable}`}>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
