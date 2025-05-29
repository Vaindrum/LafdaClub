'use client';

import { useEffect, useState } from 'react';
import { axiosInstance } from '@/lib/axios';

type User = {
  _id: string;
  username: string;
  battlesWon: number;
  totalFights: number;
};

export default function CharacterLeaderboards() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await axiosInstance.get('/leaderboards/users');
      setUsers(data.topUsers); // assuming API returns topUsers[]
    };
    fetchData();
  }, []);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border border-gray-700">
        <thead>
          <tr className="bg-gray-800 text-left">
            <th className="px-4 py-2">#</th>
            <th className="px-4 py-2">Username</th>
            <th className="px-4 py-2">Battles Won</th>
            <th className="px-4 py-2">Total Fights</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, idx) => (
            <tr key={user._id} className="border-t border-gray-700">
              <td className="px-4 py-2">{idx + 1}</td>
              <td className="px-4 py-2">{user.username}</td>
              <td className="px-4 py-2">{user.battlesWon}</td>
              <td className="px-4 py-2">{user.totalFights}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
