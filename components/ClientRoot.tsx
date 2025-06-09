"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import Navbar from "./Navbar";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";
import LogoutPrompt from "./LogoutPrompt";
import Loading from "./Loading";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 

export default function ClientRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  const { checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <div className="h-screen flex items-center justify-center text-white bg-black">
        <Loading />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <LoginModal />
      <SignupModal />
      <LogoutPrompt />
      {children}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
}
