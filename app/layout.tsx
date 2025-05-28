"use client"
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import Navbar from "@/components/Navbar";
import LoginModal from "@/components/LoginModal";
import SignupModal from "@/components/SignupModal";
import Loading from "@/components/Loading";
import LogoutPrompt from "@/components/LogoutPrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// export const metadata: Metadata = {
//   title: "Lafda Club",
//   description: "lafdaclub",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { checkAuth, isCheckingAuth } = useAuthStore();
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        
      <div className="h-screen flex items-center justify-center text-white bg-black">
        <Loading />
      </div>
      </body>
    </html>
    );
  }
  // const fetchUser = useAuthStore((state) => state.fetchUser);

  // useEffect(() => {
  //   fetchUser();
  // }, [fetchUser]);
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        <LoginModal />
        <SignupModal />
        <LogoutPrompt />
        {children}
      </body>
    </html>
  );
}
