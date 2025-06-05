"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/")
  }, []);

  return <p className="text-white">Redirecting...</p>;
}
