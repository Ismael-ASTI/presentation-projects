import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "InfoCell - Assistência Técnica em Celulares | Acessórios e Reparos",
  description:
    "InfoCell: assistência técnica especializada em celulares, venda de capinhas, películas, caixas Boombox, tripés e muito mais. Parceria com ITS Comports para reparo em computadores.",
  icons: {
    icon: "/infocell-logo.svg",
    shortcut: "/infocell-logo.svg",
    apple: "/infocell-logo.svg",
  },
  keywords:
    "assistência técnica celular, conserto de celular, capinha de celular, película protetora, caixa Boombox, tripé, reparo computador, InfoCell",
  openGraph: {
    title: "InfoCell - Assistência Técnica em Celulares",
    description:
      "Assistência técnica especializada em celulares e venda de acessórios. Filme aqui, conserte aqui!",
    type: "website",
    locale: "pt_BR",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#050508]">{children}</body>
    </html>
  );
}
