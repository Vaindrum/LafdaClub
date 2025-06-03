'use client';

import { useEffect, useState } from 'react';
import { axiosInstance } from '@/lib/axios';

type Weapon = {
  _id: string;
  name: string;
  image: string;
  played: number;
  wins: number;
  winRatio: number;
};

export default function WeaponLeaderboards() {
  const [weapons, setWeapons] = useState<Weapon[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axiosInstance.get('stats/weaponLeaderboards');
        setWeapons(data.topWeapons); // expecting an array sorted by rank
      } catch (err) {
        console.error('Failed to fetch weapons leaderboard:', err);
      }
    };
    fetchData();
  }, []);

  // Split out the top 3 and the remainder
  const topThree = weapons.slice(0, 3);
  const others = weapons.slice(3);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 text-white flex-col items-center justify-center">
      <div className='flex items-center justify-center'>
      <p className='font-semibold opacity-60'>Ranked by Win Rate</p>
      </div>
      {/* Top 3 Podium Section */}
      <div className="relative flex justify-center items-end gap-2">
        {/* 2nd place (left) */}
        {topThree[1] && (
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src={topThree[1].image} 
                alt={topThree[1].name}
                width={80}
                height={80}
                className="rounded-full border-4 border-slate-500 w-22 h-22"
              />
              <div className="absolute -top-2 -left-2 bg-slate-500 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center">
                2
              </div>
            </div>
            <div className="-mt-2 -mb-4 text-center bg-pink-700 py-4  px-2 w-20 h-25 rounded-t-2xl">
              <p className="font-semibold truncate">{topThree[1].name}</p>
              <p className="text-yellow-300 text-xl">{topThree[1].winRatio * 100}%</p>
            </div>
          </div>
        )}

        {/* 1st place (center) */}
        {topThree[0] && (
          <div className="flex flex-col items-center -mb-4">
            <div className="relative">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-yellow-400 text-2xl"></div>
              <img
                src={topThree[0].image}
                alt={topThree[0].name}
                width={100}
                height={100}
                className="rounded-full border-4 border-amber-400 w-25 h-25"
              />
              <div className="absolute -top-2 -left-2 bg-amber-400 text-black text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center">
                1
              </div>
            </div>
            <div className="-mt-2 text-center bg-pink-600 py-6 px-2 w-25 h-30 rounded-t-2xl">
              <p className="font-semibold truncate">{topThree[0].name}</p>
              <p className="text-2xl text-yellow-300">{topThree[0].winRatio * 100}%</p>
            </div>
          </div>
        )}

        {/* 3rd place (right) */}
        {topThree[2] && (
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src={topThree[2].image}
                alt={topThree[2].name}
                width={70}
                height={70}
                className="rounded-full border-4 border-amber-800 w-20 h-20"
              />
              <div className="absolute -top-2 -left-2 bg-amber-800  text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                3
              </div>
            </div>
            <div className="-mt-2 -mb-4 text-center bg-pink-800 py-6 px-2 w-20 h-20 rounded-t-2xl">
              <p className="font-semibold truncate">{topThree[2].name}</p>
              <p className="text-yellow-300 text-lg">{topThree[2].winRatio * 100}%</p>
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      {/* <hr className="border-gray-700" /> */}

      {/* Rest of Leaderboard */}
      <div className="space-y-4 ">
        {others.map((w, idx) => {
          const rank = idx + 4; // since `others` starts at index 3 (rank 4)
          return (
            <div
              key={w._id}
              className="flex items-center justify-between bg-gray-800 px-4 py-3 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-gray-400 w-6 text-right">{rank}</span>
                <img
                  src={w.image}
                  alt={w.name}
                  width={40}
                  height={40}
                  className="rounded-full w-10 h-10"
                />
                <div>
                  <p className="font-medium">{w.name}</p>
                  <div className='flex gap-5'>
                  <p className="text-gray-400 text-sm">Played: {w.played}</p>
                  <p className="text-gray-400 text-sm">Wins: {w.wins}</p>
                  </div>
                </div>
              </div>
              <div className='flex gap-5'>
              <p className="font-semibold">{w.winRatio * 100}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
