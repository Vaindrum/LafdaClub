// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientRoot from "@/components/ClientRoot"; // This is new

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lafda Club",
  description: "LafdaClub is a streetwear merch shop with a wide collection of A-grade graphic tees. Upgrade your fits.",
  keywords: ["LafdaClub", "lafdaclub", "LAFDACLUB", "lafda club", "Lafda Club", "LAFDA CLUB", "Tshirts", "Merch", "Graphic tees", "Graphic Tshirts", "buy tshirts online"],
  authors: [{ name: "Vaibhav Raj", url: "https://github.com/vaindrum" }],
  icons: {
    icon: "/lafda club.ico",
    apple: "/LFDC.png",
    shortcut: "/lafda club.ico",
  },
  openGraph: {
    title: "Lafda Club",
    description: "LafdaClub is a streetwear merch shop with a wide collection of A-grade graphic tees. Upgrade your fits.",
    url: "https://lafda-club.vercel.app",
    siteName: "Lafda Club || lafda club",
    images: [
      {
        url: "https://lafda-club.vercel.app/LFDC.png",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientRoot>{children}</ClientRoot>
      </body>
    </html>
  );
}
