import { create } from "zustand";

interface ModalState {
  isLoginOpen: boolean;
  isSignupOpen: boolean;
  isLogoutOpen: boolean;
  openLogin: () => void;
  openSignup: () => void;
  openLogout: () => void;
  closeModals: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isLoginOpen: false,
  isSignupOpen: false,
  isLogoutOpen: false,
  openLogin: () => set({ isLoginOpen: true, isSignupOpen: false, isLogoutOpen: false }),
  openSignup: () => set({ isSignupOpen: true, isLoginOpen: false, isLogoutOpen: false }),
  openLogout: () => set({ isLogoutOpen: true, isLoginOpen: false, isSignupOpen: false }),
  closeModals: () => set({ isLoginOpen: false, isSignupOpen: false, isLogoutOpen: false }),
}));
