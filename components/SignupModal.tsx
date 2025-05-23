"use client";

import { useState } from "react";
import { useModalStore } from "@/stores/useModalStore";
import { useAuthStore } from "@/stores/useAuthStore";

export default function SignupModal() {
  const { isSignupOpen, closeModals } = useModalStore();
  const { signup, isSigningUp } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signup({ username, password });
    closeModals(); // No need to check success since failure won't set `authUser`
  };

  if (!isSignupOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 p-6 rounded-lg w-[90%] max-w-sm space-y-4 shadow-xl border border-gray-700"
      >
        <h2 className="text-xl font-bold text-center text-white">Signup</h2>

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
            disabled={isSigningUp}
            className="bg-pink-600 hover:bg-pink-500 px-4 py-2 rounded text-white disabled:opacity-50"
          >
            {isSigningUp ? "Signing up..." : "Signup"}
          </button>
        </div>
      </form>
    </div>
  );
}
