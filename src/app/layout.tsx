import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/custom/Sidebar";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Top Demais Piscina - Sistema de Gestão",
  description: "Sistema de gestão para Top Demais Piscina",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-inter antialiased`}>
        <Sidebar />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
