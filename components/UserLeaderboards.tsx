'use client';

import { useEffect, useState } from 'react';
import { FaCrown } from 'react-icons/fa';
import { axiosInstance } from '@/lib/axios';
import { useRouter } from 'next/navigation';

type User = {
  _id: string;
  name: string;
  battlesWon: number;
  totalBattles: number;
  user: {
    _id: string;
    username: string;
    profilePic: string;
  };
  favoriteCharacter: {
    _id: string;
    name: string;
    image: string;
  };
  favoriteWeapon: {
    _id: string;
    name: string;
    image?: string;
  };
  favoriteStage: {
    _id: string;
    name: string;
    image?: string;
  };
  favoriteAnnouncer: {
    _id: string;
    name: string;
    image?: string;
  };
};

export default function UserLeaderboards() {
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axiosInstance.get('stats/userLeaderboards');
        setUsers(data.topUsers); // expecting an array sorted by rank
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      }
    };
    fetchData();
  }, []);

  // Split out the top 3 and the remainder
  const topThree = users.slice(0, 3);
  const others = users.slice(3);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 text-white">
       <div className='flex items-center justify-center'>
      <p className='font-semibold opacity-60'>Ranked by Battles Played</p>
      </div>
      {/* Top 3 Podium Section */}
      <div className="relative flex justify-center items-end gap-2">
        {/* 2nd place (left) */}
        {topThree[1] && (
          <div key="second" className="flex flex-col items-center">
            <div className="relative">
              <img
                src={topThree[1].user.profilePic || "/avatar.png"} 
                alt={topThree[1].user.username}
                width={80}
                height={80}
                  onClick={() => {router.push(`/profile/${topThree[1].user.username}`)}}
                className="rounded-full border-4 border-slate-500 w-22 h-22 cursor-pointer"
              />
              <div className="absolute -top-2 -left-2 bg-slate-500 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center">
                2
              </div>
            </div>
            <div className="-mt-2 -mb-4 text-center bg-pink-700 py-4  px-2 w-20 h-25 rounded-t-2xl">
              <p
                  onClick={() => {router.push(`/profile/${topThree[1].user.username}`)}}
               className="font-semibold truncate cursor-pointer">{topThree[1].user.username.split(" ")[0]}</p>
              <p className="text-yellow-300 text-xl">{topThree[1].totalBattles}</p>
            </div>
          </div>
        )}

        {/* 1st place (center) */}
        {topThree[0] && (
          <div key="first" className="flex flex-col items-center -mb-4">
            <div className="relative">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-yellow-400 text-2xl"><FaCrown size={30} /></div>
              <img
                src={topThree[0].user.profilePic || "/avatar.png"}
                alt={topThree[0].user.username}
                width={100}
                height={100}
                  onClick={() => {router.push(`/profile/${topThree[0].user.username}`)}}
                className="rounded-full border-4 border-amber-400 w-25 h-25 cursor-pointer"
              />
              <div className="absolute -top-2 -left-2 bg-amber-400 text-black text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center">
                1
              </div>
            </div>
            <div className="-mt-2 text-center bg-pink-600 py-6 px-2 w-25 h-30 rounded-t-2xl">
              <p 
                  onClick={() => {router.push(`/profile/${topThree[0].user.username}`)}}
              className="font-semibold truncate cursor-pointer">{topThree[0].user.username.split(" ")[0]}</p>
              <p className="text-2xl text-yellow-300">{topThree[0].totalBattles}</p>
            </div>
          </div>
        )}

        {/* 3rd place (right) */}
        {topThree[2] && (
          <div key="third" className="flex flex-col items-center">
            <div className="relative">
              <img
                src={topThree[2].user.profilePic || "/avatar.png"}
                alt={topThree[2].user.username}
                width={70}
                height={70}
                  onClick={() => {router.push(`/profile/${topThree[2].user.username}`)}}
                className="rounded-full border-4 border-amber-800 w-20 h-20 cursor-pointer"
              />
              <div className="absolute -top-2 -left-2 bg-amber-800 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                3
              </div>
            </div>
            <div className="-mt-2 -mb-4 text-center bg-pink-800 py-6 px-2 w-20 h-20 rounded-t-2xl">
              <p
                  onClick={() => {router.push(`/profile/${topThree[2].user.username}`)}}
               className="font-semibold truncate cursor-pointer">{topThree[2].user.username.split(" ")[0]}</p>
              <p className="text-yellow-300 text-lg">{topThree[2].totalBattles}</p>
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      {/* <hr className="border-gray-700" /> */}

      {/* Rest of Leaderboard */}
      <div className="space-y-4 md:mx-55">
        {others.map((u, idx) => {
          const rank = idx + 4; // since `others` starts at index 3 (rank 4)
          return (
            <div
              key={u._id}
              className="flex items-center justify-between bg-gray-800 px-4 py-3 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-gray-400 w-6 text-right">{rank}</span>
                <img
                  src={u.user.profilePic || "/avatar.png"}
                  alt={u.user.username}
                  width={40}
                  height={40}
                  onClick={() => {router.push(`/profile/${u.user.username}`)}}
                  className="rounded-full w-12 h-12 cursor-pointer"
                />
                <div>
                  <p 
                  onClick={() => {router.push(`/profile/${u.user.username}`)}}
                   className="font-medium truncate cursor-pointer">{u.user.username}</p>
                  <p className="text-gray-400 text-sm">Fav Char: {u.favoriteCharacter.name}</p>
                </div>
              </div>
              <p className="font-semibold">{u.totalBattles}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
