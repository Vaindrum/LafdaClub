"use client";

import { useState } from "react";
import { useModalStore } from "@/stores/useModalStore";
import { useAuthStore } from "@/stores/useAuthStore";

export default function LoginModal() {
  const { isLoginOpen, closeModals } = useModalStore();
  const { login, isLoggingIn } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login({ username, password });
    if (success) closeModals();
  };

  if (!isLoginOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 p-6 rounded-lg w-[90%] max-w-sm space-y-4 shadow-xl border border-gray-700"
      >
        <h2 className="text-xl font-bold text-center text-white">Login</h2>

        <input
          type="text"
          placeholder="Username"
          className="w-full p-3 rounded bg-gray-800 text-white border border-gray-700"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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

        <div className="flex justify-between">
          <button
            type="button"
            onClick={closeModals}
            className="text-gray-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoggingIn}
            className="bg-pink-600 hover:bg-pink-500 px-4 py-2 rounded text-white disabled:opacity-50"
          >
            {isLoggingIn ? "Logging in..." : "Login"}
          </button>
        </div>
      </form>
    </div>
  );
}
