"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import axios from "axios";
import { useParams } from "next/navigation";
import { axiosInstance } from "@/lib/axios";

export default function UserStatsPage() {
  const { authUser } = useAuthStore();
  const {username} = useParams();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get("stats/user");
        setStats(res.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-white">
        <h1 className="text-2xl font-bold mb-4">Loading Stats...</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-800 p-4 rounded-lg animate-pulse h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 text-white">
        <h1 className="text-2xl font-bold">No stats found</h1>
      </div>
    );
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mt-15 mb-6">{username}'s Stats</h1>
        <div className="bg-white/5 px-8 py-4 w-fit rounded-2xl shadow-md flex gap-5">
          <h2 className="text-lg font-semibold mb-1">Total Battles:</h2>
          <p className="text-2xl">{stats.totalBattles}</p>
        </div>
      <div className="grid grid-cols-2 py-5 md:grid-cols-6 gap-6">

         <div className="bg-white/5 p-4 rounded-2xl shadow-md flex gap-3">
        <div className="relative hover:shadow-lg transition">
          <h2 className="text-lg font-semibold mb-1">Favorite Character</h2>
          <img src={stats.favoriteCharacter.image} alt={stats.favoriteCharacter.name} width={200} className="w-32 h-32 object-cover rounded-lg"/>
          <div className="absolute bottom-0 left-0 w-full bg-black/10 px-2 py-1 rounded-b-lg">
              <p className="text-white text-lg z-10 font-bold truncate">{stats.favoriteCharacter?.name}</p>
            </div>
        </div>
        </div>

         <div className="bg-white/5 p-4 rounded-2xl shadow-md flex gap-3">
        <div className="relative hover:shadow-lg transition">
          <h2 className="text-lg font-semibold mb-1">Favorite Weapon</h2>
          <img src={stats.favoriteWeapon.image} alt={stats.favoriteWeapon.name} width={200} className="w-32 h-32 object-cover rounded-lg"/>
          <div className="absolute bottom-0 left-0 w-full bg-black/10 px-2 py-1 rounded-b-lg">
              <p className="text-white text-lg z-10 font-bold truncate">{stats.favoriteWeapon?.name}</p>
            </div>
        </div>
        </div>

        <div className="bg-white/5 p-4 rounded-2xl shadow-md flex gap-3">
        <div className="relative hover:shadow-lg transition">
          <h2 className="text-lg font-semibold mb-1">Favorite Stage</h2>
          <img src={stats.favoriteStage.image} alt={stats.favoriteStage.name} width={200} className="w-32 h-32 object-cover rounded-lg"/>
          <div className="absolute bottom-0 left-0 w-full bg-black/10 px-2 py-1 rounded-b-lg">
              <p className="text-white text-lg z-10 font-bold truncate">{stats.favoriteStage?.name}</p>
            </div>
        </div>
        </div>

         <div className="bg-white/5 p-4 rounded-2xl shadow-md flex gap-3">
        <div className="relative hover:shadow-lg transition">
          <h2 className="text-lg font-semibold mb-1">Favorite Announcer</h2>
          <img src={stats.favoriteAnnouncer.image} alt={stats.favoriteAnnouncer.name} width={200} className="w-32 h-32 object-cover rounded-lg"/>
          <div className="absolute bottom-0 left-0 w-full bg-black/10 px-2 py-1 rounded-b-lg">
              <p className="text-white text-lg z-10 font-bold truncate">{stats.favoriteAnnouncer?.name}</p>
            </div>
        </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Recent Battles</h2>
        {stats.recentBattles.length > 0 ? (
          <ul className="space-y-4">
            {stats.recentBattles.map((battle: any) => (
              <li key={battle._id} className="bg-white/5 p-4 rounded-lg">
                <div>
                  <strong>{battle.character1?.name}</strong> vs <strong>{battle.character2?.name}</strong>
                </div>
                <div className="text-sm text-gray-400 flex-row md:flex gap-5">
                  <p>Player 1: {battle.character1.name || "N/A"}</p>
                  <p>Weapon 1: {battle.weapon1.name || "N/A"}</p>
                  <p>Player 2: {battle.character2.name || "N/A"}</p>
                  <p>Weapon 2: {battle.weapon2.name || "N/A"}</p>
                  <p>Stage: {battle.stage.name || "N/A"}</p>
                  <p className="text-gray-200">Winner: {battle.winner?.name || "N/A"}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No recent battles</p>
        )}
      </div>
    </div>
  );
}
