import "@/styles/globals.css";
import "@/styles/header.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { Inter } from "next/font/google";
import AuthProvider from './providers/AuthProvider';
import { AppHeader } from '@/components/nav/AppHeader';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "orb-chat",
  description: "Where intelligence operates.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className="h-full">
      <body className={`min-h-dvh bg-background text-foreground font-sans ${inter.className}`}>
        <AuthProvider>
          <AppHeader />
          <main className="pt-[var(--h-header,64px)]">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}


