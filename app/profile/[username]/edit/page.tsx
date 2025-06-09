// app/profile/[username]/edit/page.tsx
"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { axiosInstance } from "@/lib/axios";
import dayjs from "dayjs";
import { useAuthStore } from "@/stores/useAuthStore";
import { useModalStore } from "@/stores/useModalStore";
import { toast } from "react-toastify";

type UserProfile = {
  username: string;
  email: string;
  bio: string;
  profilePic: string; // URL to current profile picture
};

export default function EditProfilePage() {
  const router = useRouter();
  const { username: routeUsername } = useParams(); // e.g. { username: "johndoe" }

  const {authUser} = useAuthStore();
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [errorAuth, setErrorAuth] = useState<string | null>(null);

  const [formUsername, setFormUsername] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formBio, setFormBio] = useState("");
  const [previewPic, setPreviewPic] = useState<string>(""); // for showing a preview
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [errorSave, setErrorSave] = useState<string | null>(null);

  const {openLogin} = useModalStore();

useEffect(() => {
    if (!authUser) {
      toast.info("Login to Edit Your Profile")
      openLogin();
    }
  }, [authUser]);

  if (!authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg bg-gray-900 text-white gap-2">
        <p>Please</p>
          <p className="text-pink-500 hover:text-pink-400 cursor-pointer" onClick={() => openLogin()}>log in</p>
            <p>to continue...</p>
      </div>
    );
  }

  // 1) Fetch logged-in user (“me”)
  useEffect(() => {
    const fetchAuth = async () => {
      setLoadingAuth(true);
      try {
        const { data } = await axiosInstance.get(`user/${routeUsername}`);
        // Expect { username, email, bio, profilePic }
        // console.log(authUser?.username);
        // console.log(data.username);
        if (authUser?.username !== data.username) {
          // If the route username doesn't match authenticated user, redirect to their profile
          router.replace(`/profile/${routeUsername}`);
          toast.warn("You can only edit your own profile!")
          return;
        }
        setFormUsername(data.username);
        setFormEmail(data.email);
        setFormBio(data.bio || "");
        setPreviewPic(data.profilePic);
      } catch (err) {
        console.error("Error fetching auth user:", err);
        setErrorAuth("Could not load your profile.");
      } finally {
        setLoadingAuth(false);
      }
    };
    fetchAuth();
  }, [routeUsername, router]);

  // 2) Handle file input change (preview + store File)
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(null);
      return;
    }
    const file = e.target.files[0];
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPreviewPic(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // 3) Handle form submission
   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) return;

    setSaving(true);
    setErrorSave(null);

    try {
      // Build JSON payload
      const payload: any = {
        username: formUsername,
        email: formEmail,
        bio: formBio,
      };
      // If a new file was selected, include base64 string as profilePic
      if (selectedFile && previewPic.startsWith("data:")) {
        payload.profilePic = previewPic;
      }

      const res = await axiosInstance.patch("auth/update-profile", payload, {
        headers: { "Content-Type": "application/json" },
      });

      // On success, redirect to updated profile
      toast.success("Profile Updated")
      router.push(`/profile/${res.data.username}`);
    } catch (err: any) {
      toast.error("Error Updating Profile");
      console.error("Error saving profile:", err);
      setErrorSave(err.response?.data?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  // 4) Loading / error states
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Loading your profile…</p>
      </div>
    );
  }

  if (errorAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-500 px-6">
        <p>{errorAuth}</p>
      </div>
    );
  }

  

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-12">
      <div className="max-w-xl mx-auto bg-gray-800 rounded-2xl p-8 space-y-6 mt-15">
        <h1 className="text-3xl font-bold text-center">Edit Your Profile</h1>

        {/* Profile Picture Preview & Upload */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-pink-500">
            {previewPic ? (
              <img
                src={previewPic}
                alt="Profile Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-400">
                No image
              </div>
            )}
          </div>
          
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="text-sm text-gray-300 cursor-pointer bg-gray-600 w-50 px-4 py-2 rounded-lg"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block mb-1">Username</label>
            <input
              type="text"
              value={formUsername}
              onChange={(e) => setFormUsername(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-gray-700 text-white focus:outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1">Email</label>
            <input
              type="email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-gray-700 text-white focus:outline-none"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block mb-1">Bio</label>
            <textarea
              value={formBio}
              onChange={(e) => setFormBio(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded-xl bg-gray-700 text-white focus:outline-none resize-none"
            />
          </div>

          {errorSave && (
            <p className="text-red-400 text-sm">{errorSave}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className={`w-full bg-pink-600 hover:bg-pink-500 py-2 rounded-xl font-semibold transition cursor-pointer ${
              saving ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
