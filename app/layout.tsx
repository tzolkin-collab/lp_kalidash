import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

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
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {/* Utmify Script */}
        <Script
          src="https://cdn.utmify.com.br/scripts/utms/latest.js"
          strategy="afterInteractive"
          data-utmify-prevent-subdomains
        />

        {/* Google Analytics 4 (Substitua G-XXXXXXXXXX pelo seu ID) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `}
        </Script>

        {/* Microsoft Clarity (Substitua YOUR_CLARITY_ID pelo seu ID) */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "YOUR_CLARITY_ID");
          `}
        </Script>

        {children}
      </body>
    </html>
  );
}
