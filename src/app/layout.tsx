import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrapVoice AI - Conversor e Clonador de Voz",
  description: "Substitua a voz de qualquer música ou guia pela sua voz real usando IA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased selection:bg-purple-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
