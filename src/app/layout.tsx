
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/context/language-context";
import { Inter, Space_Grotesk } from 'next/font/google';
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/context/auth-context";
import { ChunkLoadErrorHandler } from "@/components/chunk-load-error-handler";


const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontHeading = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
});

export const metadata: Metadata = {
  title: "DigiSanchaar",
  description: "Your personal safety companion.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body className={cn(
          "min-h-screen bg-background font-body antialiased",
          fontSans.variable,
          fontHeading.variable
        )}>
        <ChunkLoadErrorHandler />
        <LanguageProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
