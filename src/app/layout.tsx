import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Estudo Aprovado | Sistema de Estudos",
  description: "Plataforma de gestão de estudos para concursos públicos.",
  icons: {
    icon: "/logo_estudo_aprovado.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased`}>
        <Providers>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { borderRadius: "1rem", fontWeight: 600, fontSize: "0.875rem" },
              success: { iconTheme: { primary: "#10b981", secondary: "#ffffff" } },
              error: { iconTheme: { primary: "#ef4444", secondary: "#ffffff" } },
            }}
          />
          {children}
        </Providers>
      </body>
    </html>
  );
}
