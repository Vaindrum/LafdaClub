"use client";

import Link from "next/link";
import { useState } from "react";
import { useModalStore } from "@/stores/useModalStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { FiMenu, FiX } from "react-icons/fi";

export default function Navbar() {
  const { openLogin, openSignup, openLogout } = useModalStore();
  const { authUser } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <nav className="w-full bg-black text-white px-6 py-4 border-b border-gray-800 flex items-center justify-between">
        {/* Left - Hamburger Icon on Mobile */}
        <button className="md:hidden text-2xl" onClick={toggleMenu}>
          <FiMenu />
        </button>

        {/* Center - Brand */}
        <div className="text-2xl font-bold text-pink-500">
          <Link href="/">LFDC</Link>
        </div>

        {/* Right - Desktop Menu */}
        <div className="hidden md:flex space-x-6 ml-30 text-lg">
          <Link href="/" className="hover:text-pink-500 transition">Home</Link>
          <Link href="/merch" className="hover:text-pink-500 transition">Merch</Link>
          <Link href="/play" className="hover:text-pink-500 transition">Play</Link>
          <Link href="/leaderboards" className="hover:text-pink-500 transition">Leaderboards</Link>
          <Link href="/about" className="hover:text-pink-500 transition">About</Link>
        </div>

        {/* Right - Auth Buttons */}
        <div className="hidden md:flex space-x-4">
          {authUser ? (
            <>
              <Link href="/profile">
                <button className="px-4 py-2 bg-pink-600 hover:bg-pink-500 rounded transition cursor-pointer">Profile</button>
              </Link>
              <button onClick={openLogout} className="px-4 py-2 border border-pink-600 hover:bg-pink-600 rounded transition cursor-pointer">Logout</button>
            </>
          ) : (
            <>
              <button onClick={openSignup} className="px-4 py-2 bg-pink-600 hover:bg-pink-500 rounded transition cursor-pointer">Signup</button>
              <button onClick={openLogin} className="px-4 py-2 border border-pink-600 hover:bg-pink-600 rounded transition cursor-pointer">Login</button>
            </>
          )}
        </div>
      </nav>

      {/* Sidebar overlay */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`} onClick={closeMenu}></div>

      {/* Sidebar Menu */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-[#0c111b] z-50 transform transition-transform duration-300 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
          <span className="text-white text-lg font-bold">Menu</span>
          <button onClick={closeMenu} className="text-white text-2xl">
            <FiX />
          </button>
        </div>

        <div className="flex flex-col space-y-4 p-4 text-white text-base">
          <Link href="/" className="hover:text-pink-500 transition">Home</Link>
          <Link href="/merch" className="hover:text-pink-500 transition">Merch</Link>
          <Link href="/play" className="hover:text-pink-500 transition">Play</Link>
          <Link href="/leaderboards" className="hover:text-pink-500 transition">Leaderboards</Link>
          <Link href="/about" className="hover:text-pink-500 transition">About</Link>

          <div className="flex flex-col border-t border-gray-700 pt-4 space-y-2">
            {authUser ? (
              <>
                <Link href="/profile" onClick={closeMenu} className="text-pink-500">Profile</Link>
                <button onClick={() => { openLogout(); closeMenu(); }} className="text-left text-pink-500">Logout</button>
              </>
            ) : (
              <>
                <button onClick={() => { openSignup(); closeMenu(); }} className="text-left text-pink-500">Sign Up</button>
                <button onClick={() => { openLogin(); closeMenu(); }} className="text-left text-pink-500">Login</button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
