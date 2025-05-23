import { create } from "zustand";

interface ModalState {
  isLoginOpen: boolean;
  isSignupOpen: boolean;
  openLogin: () => void;
  openSignup: () => void;
  closeModals: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isLoginOpen: false,
  isSignupOpen: false,
  openLogin: () => set({ isLoginOpen: true, isSignupOpen: false }),
  openSignup: () => set({ isSignupOpen: true, isLoginOpen: false }),
  closeModals: () => set({ isLoginOpen: false, isSignupOpen: false }),
}));
