"use client";

import Link from "next/link";
import { useState } from "react";
import { useModalStore } from "@/stores/useModalStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { FiMenu, FiX, FiHome, FiTag, FiPlay, FiUser, FiLogIn } from "react-icons/fi";
import { FaShoppingCart } from "react-icons/fa";

export default function Navbar() {
  const { openLogin, openSignup, openLogout } = useModalStore();
  const { authUser } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const username = authUser?.username;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      {/* Desktop + Mobile Top Navbar */}
      <nav
        className="
          absolute top-0 left-0 w-full text-white px-6 py-4 border-b border-gray-800
          flex items-center justify-between z-20
        "
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-md z-[-1]" />
        {/* Hamburger (mobile only) */}
        <button className="md:hidden text-2xl" onClick={toggleMenu}>
          <FiMenu />
        </button>

        {/* Logo (always visible) */}
        <div className="text-2xl font-bold text-pink-500">
          <Link href="/">
            <img src="/logo.png" alt="LFDC" width={100} />
          </Link>
        </div>

        {/* Links (desktop only) */}
        <div className="hidden md:flex space-x-6 ml-30 text-lg">
          <Link href="/" className="hover:text-pink-500 transition">
            Home
          </Link>
          <Link href="/merch" className="hover:text-pink-500 transition">
            Merch
          </Link>
          <Link href="/play" className="hover:text-pink-500 transition">
            Play
          </Link>
          <Link href="/leaderboards" className="hover:text-pink-500 transition">
            Leaderboards
          </Link>
          <Link href="/about" className="hover:text-pink-500 transition">
            About
          </Link>
        </div>

        {/* Auth buttons / Cart (desktop only) */}
        <div className="hidden md:flex space-x-4">
          {authUser ? (
            <>
              <Link href="/cart">
                <button className="px-4 py-2 hover:text-pink-500 rounded transition cursor-pointer">
                  <FaShoppingCart size={20} />
                </button>
              </Link>
              <Link href={`/profile/${username}`}>
                <button className="px-4 py-2 bg-pink-600 hover:bg-pink-500 rounded transition cursor-pointer">
                  Profile
                </button>
              </Link>
              <button
                onClick={openLogout}
                className="px-4 py-2 border border-pink-600 hover:bg-pink-600 rounded transition cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={openSignup}
                className="px-4 py-2 bg-pink-600 hover:bg-pink-500 rounded transition cursor-pointer"
              >
                Signup
              </button>
              <button
                onClick={openLogin}
                className="px-4 py-2 border border-pink-600 hover:bg-pink-600 rounded transition cursor-pointer"
              >
                Login
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Overlay for Sidebar */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={closeMenu}
      ></div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#0c111b] z-50 transform transition-transform duration-300 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
          <span className="text-white text-lg font-bold">Menu</span>
          <button onClick={closeMenu} className="text-white text-2xl">
            <FiX />
          </button>
        </div>

        <div className="flex flex-col space-y-4 p-4 text-white text-base">
          <Link href="/" className="hover:text-pink-500 transition" onClick={closeMenu}>
            Home
          </Link>
          <Link href="/merch" className="hover:text-pink-500 transition" onClick={closeMenu}>
            Merch
          </Link>
          <Link href="/play" className="hover:text-pink-500 transition" onClick={closeMenu}>
            Play
          </Link>
          <Link href="/leaderboards" className="hover:text-pink-500 transition" onClick={closeMenu}>
            Leaderboards
          </Link>
          <Link href="/about" className="hover:text-pink-500 transition" onClick={closeMenu}>
            About
          </Link>

          <div className="flex flex-col border-t border-gray-700 pt-4 space-y-2">
            {authUser ? (
              <>
                <Link
                  href={`/profile/${username}`}
                  onClick={closeMenu}
                  className="text-pink-500"
                >
                  Profile
                </Link>

                <button
                  onClick={() => {
                    openLogout();
                    closeMenu();
                  }}
                  className="text-left text-pink-500"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    openSignup();
                    closeMenu();
                  }}
                  className="text-left text-pink-500"
                >
                  Sign Up
                </button>
                <button
                  onClick={() => {
                    openLogin();
                    closeMenu();
                  }}
                  className="text-left text-pink-500"
                >
                  Login
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navbar (mobile only) */}
      <div className="fixed bottom-0 left-0 w-full bg-gray-900 pt-1 md:hidden z-30">
        <div className="flex justify-around items-center py-2">
          <Link href="/">
            <div className="flex flex-col items-center text-amber-400 hover:text-pink-500 transition">
              <FiHome size={24} />
              <span className="text-xs">Home</span>
            </div>
          </Link>

          <Link href="/merch">
            <div className="flex flex-col items-center text-amber-400 hover:text-pink-500 transition">
              <FiTag size={24} />
              <span className="text-xs">Merch</span>
            </div>
          </Link>

          <Link href="/play">
            <div className="flex flex-col items-center text-amber-400 hover:text-pink-500 transition">
              <FiPlay size={24} />
              <span className="text-xs">Play</span>
            </div>
          </Link>

          <Link href="/cart">
            <div className="flex flex-col items-center text-amber-400 hover:text-pink-500 transition">
              <FaShoppingCart size={24} />
              <span className="text-xs">Cart</span>
            </div>
          </Link>

          {authUser ? (
            <Link href={`/profile/${username}`}>
              <div className="flex flex-col items-center text-amber-400 hover:text-pink-500 transition">
                <FiUser size={24} />
                <span className="text-xs">Profile</span>
              </div>
            </Link>
          ) : (
            <button
              onClick={openLogin}
              className="flex flex-col items-center text-amber-400 hover:text-pink-500 transition"
            >
              <FiLogIn size={24} />
              <span className="text-xs">Login</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
