'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import UserLeaderboards from '@/components/UserLeaderboards';
import CharacterLeaderboards from '@/components/CharacterLeaderboards';
import StageLeaderboards from '@/components/StageLeaderboards';
import WeaponLeaderboards from '@/components/WeaponLeaderboards';
import AnnouncerLeaderboards from '@/components/AnnouncerLeaderboards';

const tabs = ['users', 'characters', 'weapons', 'stages', 'announcers'];

const tabVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

export default function LeaderboardsPage() {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="relative min-h-screen">
      {/* Background Layer */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(/lobby.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(10px)', // blur only the background
        }}
      />

      {/* Overlay to darken if needed */}
      <div className="absolute inset-0 bg-black/40 z-0" />

      {/* Foreground Content */}
      <main className="relative z-10 text-white px-4 md:px-6 py-8 md:py-10">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 md:mb-8 mt-16 md:mt-20">
          Leaderboards
        </h1>

        {/* Mini Navbar (responsive wrap) */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-6 md:mb-10">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`capitalize text-sm md:text-base px-3 md:px-4 py-2 rounded-md font-semibold transition-colors cursor-pointer
                ${
                  activeTab === tab
                    ? 'bg-pink-600'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content Container */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode='wait'>
            {activeTab === 'users' && (
              <motion.div
                key="users"
                variants={tabVariant}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <UserLeaderboards />
              </motion.div>
            )}
            {activeTab === 'characters' && (
              <motion.div
                key="characters"
                variants={tabVariant}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <CharacterLeaderboards />
              </motion.div>
            )}
            {activeTab === 'weapons' && (
              <motion.div
                key="weapons"
                variants={tabVariant}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <WeaponLeaderboards />
              </motion.div>
            )}
            {activeTab === 'stages' && (
              <motion.div
                key="stages"
                variants={tabVariant}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <StageLeaderboards />
              </motion.div>
            )}
            {activeTab === 'announcers' && (
              <motion.div
                key="announcers"
                variants={tabVariant}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <AnnouncerLeaderboards />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
