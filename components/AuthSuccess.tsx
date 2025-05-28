"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");

    if (token) {
      document.cookie = `jwt=${token}; path=/; secure; samesite=None`;
      router.push("/"); // or any authenticated page
    } else {
      router.push("/signup"); // fallback
    }
  }, []);

  return <p className="text-white">Redirecting...</p>;
}
