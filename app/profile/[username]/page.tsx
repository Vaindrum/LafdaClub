// app/profile/[username]/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/axios";
import dayjs from "dayjs";
import { useAuthStore } from "@/stores/useAuthStore";
import Loading from "@/components/Loading";

type ProfileData = {
  _id: string;
  username: string;
  profilePic: string; // URL to profile picture
  bio: string;
  createdAt: string; // ISO date string
};

export default function ProfilePage() {
  const router = useRouter();
  const { username } = useParams();
  const { authUser } = useAuthStore();

  const statsRef = useRef<HTMLDivElement>(null);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loading, setLoading] = useState(true);
  const [errorProfile, setErrorProfile] = useState<string | null>(null);
  const [errorAuth, setErrorAuth] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        const { data } = await axiosInstance.get(`user/${username}`);
        // Expect data to be: { _id, username, profilePic, bio, createdAt }
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

  useEffect(() => {
    if (!profile?._id) return;

    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get(`stats/user/${profile._id}`);
        // console.log(res.data);
        setStats(res.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [profile?._id]);

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <Loading />
      </div>
    );
  }

  if (errorProfile || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-500 px-6">
        <p>{errorProfile || "Profile not found."}</p>
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

  const joinedOn = dayjs(profile.createdAt).format("MMMM D, YYYY");
  const isOwnProfile = authUser && authUser.username === profile.username;

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-12">
      <div className="max-w-4xl mx-auto mt-15 ">
        {/* ===== Profile Header ===== */}
        <div className="flex items-center justify-between">
          {/* Left: Avatar + Username/Joined */}
          <div className="flex items-center space-x-6">
            <img
              src={profile.profilePic}
              alt={`${profile.username}’s avatar`}
              className="w-32 h-32 rounded-full object-cover border-2 border-gray-600"
            />
            <div>
              <h1 className="text-xl md:text-3xl font-bold">{profile.username}</h1>
              <p className="text-gray-400">Joined on {joinedOn}</p>
            </div>
          </div>

          {/** Desktop-only “Edit Profile” button **/}
          {isOwnProfile && (
            <button
              onClick={() => router.push(`/profile/${profile.username}/edit`)}
              className="hidden md:inline-flex bg-pink-600 hover:bg-pink-500 text-white font-semibold py-2 px-4 rounded-lg transition cursor-pointer"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/** Mobile-only “Edit Profile” button (appears below Bio) **/}
        {isOwnProfile && (
          <div className="mt-4 md:hidden">
            <button
              onClick={() => router.push(`/profile/${profile.username}/edit`)}
              className="w-full bg-pink-600 hover:bg-pink-500 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              Edit Profile
            </button>
          </div>
        )}

        {/* ===== Bio Section ===== */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Bio</h2>
          <p className="text-gray-200">
            {profile.bio || "This user has no bio yet."}
          </p>
        </div>

        {/* ===== Action Buttons ===== */}
        {isOwnProfile && (
          <div className="mt-6 flex flex-wrap gap-4">
            <button
              onClick={() => {
                statsRef.current?.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-amber-600 hover:bg-yellow-600 text-black font-semibold py-2 px-6 rounded-lg transition cursor-pointer"
            >
              View Stats
            </button>
            <button
              onClick={() => router.push(`/orders`)}
              className="bg-amber-600 hover:bg-yellow-600 text-black font-semibold py-2 px-6 rounded-lg transition cursor-pointer"
            >
              View Orders
            </button>
          </div>
        )}

        {/* ===== Game Stats Header ===== */}
        <div ref={statsRef} className="mt-12">
          <h1 className="text-3xl font-bold mb-6">
            {profile.username}'s Game Stats
          </h1>

          {/* ===== Total Battles ===== */}
          <div className="bg-white/5 px-8 py-4 w-fit rounded-2xl shadow-md flex gap-5 mb-8">
            <h2 className="text-lg font-semibold">Total Battles:</h2>
            <p className="text-2xl">{stats?.totalBattles}</p>
          </div>

          {/* ===== Favorite Picks Grid ===== */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Favorite Character */}
            <div className="bg-white/5 p-4 rounded-2xl shadow-md">
              <h2 className="text-lg font-semibold mb-2">Favorite Character</h2>
              <div className="relative">
                <img
                  src={stats?.favoriteCharacter?.image ?? "/placeholder.jpg"}
                  alt={stats?.favoriteCharacter?.name ?? ""}
                  className="w-full h-32 object-cover rounded-lg mb-1"
                />
                <div className="absolute bottom-0 left-0 w-full bg-black/20 px-2 py-1 rounded-b-lg">
                  <p className="text-white text-lg font-bold truncate">
                    {stats?.favoriteCharacter?.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Favorite Weapon */}
            <div className="bg-white/5 p-4 rounded-2xl shadow-md">
              <h2 className="text-lg font-semibold mb-2">Favorite Weapon</h2>
              <div className="relative">
                <img
                  src={stats?.favoriteWeapon?.image ?? "/placeholder.jpg"}
                  alt={stats?.favoriteWeapon?.name ?? ""}
                  className="w-full h-32 object-cover rounded-lg mb-1"
                />
                <div className="absolute bottom-0 left-0 w-full bg-black/20 px-2 py-1 rounded-b-lg">
                  <p className="text-white text-lg font-bold truncate">
                    {stats?.favoriteWeapon?.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Favorite Stage */}
            <div className="bg-white/5 p-4 rounded-2xl shadow-md">
              <h2 className="text-lg font-semibold mb-2">Favorite Stage</h2>
              <div className="relative">
                <img
                  src={stats?.favoriteStage?.image ?? "/placeholder.jpg"}
                  alt={stats?.favoriteStage?.name ?? ""}
                  className="w-full h-32 object-cover rounded-lg mb-1"
                />
                <div className="absolute bottom-0 left-0 w-full bg-black/20 px-2 py-1 rounded-b-lg">
                  <p className="text-white text-lg font-bold truncate">
                    {stats?.favoriteStage?.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Favorite Announcer */}
            <div className="bg-white/5 p-4 rounded-2xl shadow-md">
              <h2 className="text-lg font-semibold mb-2">Favorite Announcer</h2>
              <div className="relative">
                <img
                  src={stats?.favoriteAnnouncer?.image ?? "/placeholder.jpg"}
                  alt={stats?.favoriteAnnouncer?.name ?? ""}
                  className="w-full h-32 object-cover rounded-lg mb-1"
                />
                <div className="absolute bottom-0 left-0 w-full bg-black/20 px-2 py-1 rounded-b-lg">
                  <p className="text-white text-lg font-bold truncate">
                    {stats?.favoriteAnnouncer?.name}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ===== Recent Battles ===== */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Recent Battles</h2>
            {stats?.recentBattles?.length > 0 ? (
              <ul className="space-y-4">
                {stats.recentBattles.map((battle: any) => (
                  <li key={battle._id} className="bg-white/5 p-4 rounded-lg">
                    <div className="mb-2">
                      <strong>{battle.character1?.name}</strong> vs{" "}
                      <strong>{battle.character2?.name}</strong>
                    </div>
                    <div className="text-sm text-gray-400 flex flex-wrap gap-4">
                      <p>Player 1: {battle.character1.name || "N/A"}</p>
                      <p>Weapon 1: {battle.weapon1.name || "N/A"}</p>
                      <p>Player 2: {battle.character2.name || "N/A"}</p>
                      <p>Weapon 2: {battle.weapon2.name || "N/A"}</p>
                      <p>Stage: {battle.stage.name || "N/A"}</p>
                      <p className="text-gray-200">
                        Winner: {battle.winner?.name || "N/A"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No recent battles</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
