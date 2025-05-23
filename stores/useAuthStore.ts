import {create} from "zustand";
import { axiosInstance } from "../lib/axios";
// import toast from "react-hot-toast";

type AuthUser = {
  _id: string;
  username: string;
  // add other fields returned from backend
};

type AuthStore = {
  authUser: AuthUser | null;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isUpdatingProfile: boolean;
  isLoggingOut: boolean;
  isCheckingAuth: boolean;

  checkAuth: () => Promise<void>;
  signup: (data: { username: string; password: string }) => Promise<void>;
  login: (data: { username: string; password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: { username?: string; password?: string }) => Promise<void>;
};


export const useAuthStore = create<AuthStore>((set) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isLoggingOut: false,

    isCheckingAuth: true,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            console.log("user:",res.data);
            set({authUser: res.data});
        } catch (error: any) {
            console.error("Error in checkAuth:",error.message);
            set({authUser: null})
        } finally{
            set({isCheckingAuth: false});
        }
    },

    signup: async (data) => {
        set({isSigningUp: true});
        try{
            const res = await axiosInstance.post("/auth/signup", data);
            set({authUser: res.data});
            // toast.success("Account created successfully");
        
        } catch(error: any){
            // toast.error(error.response.data.message);
            console.error("Error in signup:",error.message);
        } finally{
            set({isSigningUp: false});
        }
    },

    login: async (data) => {
        set({isLoggingIn: true});
        try {
            const res = await axiosInstance.post("/auth/login", data);
            set({authUser: res.data});
            // toast.success("Logged In Successfully");
            return true;
        } catch (error: any) {
            // toast.error(error.response.data.message);
            console.error("Error in login:",error.message);
            return false;
        } finally{
            set({isLoggingIn: false});
        }
    },

    logout: async () => {
        set({isLoggingOut: true});
        try {
            await axiosInstance.post("/auth/logout");
            set({authUser: null});
            // toast.success("Logged Out successfully");
        } catch (error: any) {
            // toast.error(error.response.data.message);
            console.error("Error in logout:",error.message);
        } finally{
            set({isLoggingOut: false});
        }
    },

    updateProfile: async (data) => {
        set({isUpdatingProfile: true});
        try {
            const res = await axiosInstance.patch("auth/update-profile", data);
            set({authUser: res.data});
            // toast.success("Profile updated successfully");
        } catch (error: any) {
            console.error("Error in updateProfile:", error);
            // toast.error(error.response.data.message);
        } finally{
            set({isUpdatingProfile: false});
        }
    },
}))