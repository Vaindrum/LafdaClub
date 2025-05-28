"use client";

import { useModalStore } from "@/stores/useModalStore";
import { useAuthStore } from "@/stores/useAuthStore";

export default function LogoutPrompt() {
  const { isLogoutOpen, closeModals } = useModalStore();
  const { logout } = useAuthStore();

  const handleConfirm = async () => {
    await logout();
    closeModals();
  };

  if (!isLogoutOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex justify-center items-center">
      <div className="bg-gray-900 p-6 rounded-lg w-[90%] max-w-sm shadow-xl border border-gray-700 text-white">
        <h2 className="text-lg font-bold mb-4">Confirm Logout</h2>
        <p className="mb-6 text-gray-300">Are you sure you want to logout?</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={closeModals}
            className="text-gray-400 hover:text-white transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="bg-pink-600 hover:bg-pink-500 px-4 py-2 rounded text-white cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
