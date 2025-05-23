"use client";

import Link from "next/link";

import { useModalStore } from "@/stores/useModalStore";

export default function Navbar() {
  const { openLogin, openSignup } = useModalStore();

  return (
    <nav className="w-full bg-black text-white px-6 py-4 flex items-center justify-between border-b border-gray-800">
      <div className="text-2xl font-bold text-pink-500">
        <Link href="/">LFDC</Link>
      </div>

      <div className="space-x-6 text-lg hidden md:flex">
        <Link href="/" className="hover:text-pink-500 transition">Home</Link>
        <Link href="/merch" className="hover:text-pink-500 transition">Merch</Link>
        <Link href="/play" className="hover:text-pink-500 transition">Play</Link>
        <Link href="/about" className="hover:text-pink-500 transition">About</Link>
      </div>

      <div className="space-x-4">
        <button onClick={openSignup} className="px-4 py-2 bg-pink-600 hover:bg-pink-500 rounded transition">Signup</button>
        <button onClick={openLogin} className="px-4 py-2 border border-pink-600 hover:bg-pink-600 rounded transition">Login</button>
      </div>
    </nav>
  );
}
