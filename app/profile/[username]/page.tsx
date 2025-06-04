// app/profile/[username]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/axios";
import dayjs from "dayjs";
import { useAuthStore } from "@/stores/useAuthStore";
import Loading from "@/components/Loading";

type ProfileData = {
  username: string;
  profilePic: string;   // URL to profile picture
  bio: string;
  createdAt: string;    // ISO date string
};

export default function ProfilePage() {
  const router = useRouter();
  const { username } = useParams(); 
  const { authUser } = useAuthStore();

  const [profile, setProfile] = useState<ProfileData | null>(null);
//   const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  const [loadingProfile, setLoadingProfile] = useState(true);

  const [errorProfile, setErrorProfile] = useState<string | null>(null);
  const [errorAuth, setErrorAuth] = useState<string | null>(null);

  // Fetch profile data for “username”
  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        const { data } = await axiosInstance.get(`user/${username}`);
        // Expect data to be: { username, profilePic, bio, createdAt }
        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setErrorProfile("Could not load profile.");
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [username]);


  // Format “Joined on” date
  const joinedOn = profile
    ? dayjs(profile.createdAt).format("MMMM D, YYYY")
    : "";

  // If still loading either profile or auth, show a loader
  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p><Loading /></p>
      </div>
    );
  }

  // If profile failed to load
  if (errorProfile || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-500 px-6">
        <p>{errorProfile || "Profile not found."}</p>
      </div>
    );
  }

  // If auth check failed
  if (errorAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-500 px-6">
        <p>{errorAuth}</p>
      </div>
    );
  }

  // Determine whether to show “Edit Profile”
  const isOwnProfile = authUser && authUser.username === profile.username;

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-12">
      <div className="max-w-xl mx-auto bg-gray-800 rounded-2xl p-8 space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center space-y-4">
          <img
            src={profile.profilePic}
            alt={`${profile.username}’s avatar`}
            className="w-32 h-32 rounded-full object-cover border-4 border-pink-500"
          />
          <h1 className="text-3xl font-bold">{profile.username}</h1>
          <p className="text-gray-400">Joined on {joinedOn}</p>
        </div>

        {/* Bio */}
        <div className="px-4">
          <h2 className="text-xl font-semibold mb-2">Bio</h2>
          <p className="text-gray-200">{profile.bio || "This user has no bio yet."}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row items-center justify-center space-y-3 md:space-y-0 md:space-x-4">
          {isOwnProfile && (
            <button
              onClick={() => router.push(`/profile/${profile.username}/edit`)}
              className="w-full md:w-auto bg-pink-600 hover:bg-pink-500 text-white px-6 py-2 rounded-xl font-semibold transition"
            >
              Edit Profile
            </button>
          )}
          <button
            onClick={() => router.push(`/profile/${profile.username}/stats`)}
            className="w-full md:w-auto bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-xl font-semibold transition"
          >
            View Stats
          </button>
          <button
            onClick={() => router.push(`/orders`)}
            className="w-full md:w-auto bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-xl font-semibold transition"
          >
            View Orders
          </button>
        </div>
      </div>
    </div>
  );
}
