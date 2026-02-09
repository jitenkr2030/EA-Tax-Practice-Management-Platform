import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TaxPro - Tax Practice Management Platform",
  description: "Comprehensive tax practice management platform for Enrolled Agents. Client management, document processing, IRS notice handling, and compliance tools.",
  keywords: ["Tax Practice", "Enrolled Agent", "Tax Software", "Client Management", "IRS Notices", "Document Processing"],
  authors: [{ name: "TaxPro Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "TaxPro - Tax Practice Management Platform",
    description: "Comprehensive tax practice management platform for Enrolled Agents",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TaxPro - Tax Practice Management Platform",
    description: "Comprehensive tax practice management platform for Enrolled Agents",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
