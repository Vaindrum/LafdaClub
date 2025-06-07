"use client";

import { useState } from "react";
import { useModalStore } from "@/stores/useModalStore";
import { useAuthStore } from "@/stores/useAuthStore";
import GoogleLoginButton from "./GoogleLoginButton";
import { FiX } from "react-icons/fi";

export default function SignupModal() {
  const { isSignupOpen, closeModals, openLogin } = useModalStore();
  const { signup, isSigningUp } = useAuthStore();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signup({ username, email, password });
    closeModals();
  };

  if (!isSignupOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="relative bg-gray-900 p-6 rounded-lg w-[90%] max-w-sm space-y-4 shadow-xl border border-gray-700"
      >
        {/* Close (X) button */}
        <button
          type="button"
          onClick={closeModals}
          className="absolute top-2 right-2 text-gray-400 hover:text-white cursor-pointer"
        >
          <FiX size={20} />
        </button>

        <h2 className="text-xl font-bold text-center text-white">Sign Up</h2>

        <input
          type="text"
          placeholder="Username"
          className="w-full p-3 rounded bg-gray-800 text-white border border-gray-700"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 rounded bg-gray-800 text-white border border-gray-700"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 rounded bg-gray-800 text-white border border-gray-700"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={isSigningUp}
          className="w-full bg-pink-600 hover:bg-pink-500 px-4 py-2 rounded text-white disabled:opacity-50 cursor-pointer"
        >
          {isSigningUp ? "Signing up..." : "Signup"}
        </button>

        {/* OR line */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-gray-900 px-2 text-gray-400">or</span>
          </div>
        </div>

        {/* Centered Google button */}
        <div className="flex justify-center">
          <GoogleLoginButton />
        </div>

        {/* Already have an account? */}
        <p className="text-sm text-center text-gray-400">
          Already have an account?{" "}
          <button
            type="button"
            className="text-pink-500 hover:underline cursor-pointer"
            onClick={() => {
              closeModals();
              openLogin();
            }}
          >
            Login
          </button>
        </p>
      </form>
    </div>
  );
}
