'use client';

import { useState } from 'react';
import UserLeaderboards from '@/components/UserLeaderboards';
import CharacterLeaderboards from '@/components/CharacterLeaderboards';
import StageLeaderboards from '@/components/StageLeaderboards';
import WeaponLeaderboards from '@/components/WeaponLeaderboards';
import AnnouncerLeaderboards from '@/components/AnnouncerLeaderboards';

const tabs = ['users', 'characters', 'stages', 'weapons', 'announcers'];

export default function LeaderboardsPage() {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <main className="min-h-screen text-white px-6 py-10">
      <h1 className="text-4xl font-bold text-center mb-8">Leaderboards</h1>

      {/* Mini Navbar */}
      <div className="flex justify-center gap-4 mb-10">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`capitalize px-4 py-2 rounded-md font-semibold ${
              activeTab === tab ? 'bg-pink-600' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="max-w-4xl mx-auto">
        {activeTab === 'users' && <UserLeaderboards />}
        {activeTab === 'characters' && <CharacterLeaderboards />}
        {activeTab === 'stages' && <StageLeaderboards />}
        {activeTab === 'weapons' && <WeaponLeaderboards />}
        {activeTab === 'announcers' && <AnnouncerLeaderboards />}
      </div>
    </main>
  );
}
