"use client";

import { useEffect, useState } from "react";
import { axiosInstance } from "@/lib/axios";

type GameData = {
  characters: { _id: string; name: string; image: string }[];
  weapons: { _id: string; name: string; image: string }[];
  stages: { _id: string; name: string; image: string }[];
  announcers: { _id: string; name: string; image: string }[];
};

export default function PlayGamePage() {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [p1, setP1] = useState<GameData["characters"][0] | null>(null);
  const [p2, setP2] = useState<GameData["characters"][0] | null>(null);
  const [w1, setW1] = useState<GameData["weapons"][0] | null>(null);
  const [w2, setW2] = useState<GameData["weapons"][0] | null>(null);
  const [stage, setStage] = useState<GameData["stages"][0] | null>(null);
  const [announcer, setAnnouncer] = useState<GameData["announcers"][0] | null>(null);
  const [narration, setNarration] = useState<string>("");

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const { data } = await axiosInstance.get("/game/details");
        setGameData(data);
        randomizeAll(data);
      } catch (err) {
        console.error("Failed to fetch game details", err);
      }
    };

    fetchGameDetails();
  }, []);

  const randomFromArray = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const randomizeAll = (data?: GameData) => {
    const d = data || gameData;
    if (!d) return;

    const randomChar1 = randomFromArray(d.characters);
    let randomChar2 = randomFromArray(d.characters);
    while (randomChar2._id === randomChar1._id) {
      randomChar2 = randomFromArray(d.characters);
    }

    const randomWeapon1 = randomFromArray(d.weapons);
    let randomWeapon2 = randomFromArray(d.weapons);
    while (randomWeapon2._id === randomWeapon1._id) {
      randomWeapon2 = randomFromArray(d.weapons);
    }

    const randomStage = randomFromArray(d.stages);
    // const randomBackground = randomFromArray(d.stages);
    const randomAnnouncer = randomFromArray(d.announcers);

    setP1(randomChar1);
    setP2(randomChar2);
    setW1(randomWeapon1);
    setW2(randomWeapon2);
    setStage(randomStage);
    setAnnouncer(randomAnnouncer);

    setNarration(""); // reset narration if re-randomized
  };

  const handleBattleStart = async () => {
    if (!p1 || !p2 || !w1 || !w2 || !stage || !announcer) {
      alert("Please select all options");
      return;
    }

    try {
      const { data } = await axiosInstance.post("/game/fight", {
        characterId1: p1,
        weaponId1: w1,
        characterId2: p2,
        weaponId2: w2,
        stageId: stage,
        announcerId: announcer,
      });

      setNarration(data.result);
    } catch (err) {
      alert("Battle failed to start.");
      console.error(err);
    }
  };

  if (!gameData) return <div className="text-white p-10">Loading...</div>;

  return (
    <div className="relative min-h-screen">
      {/* Background Layer */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${stage?.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(10px)", // this blurs only the background
        }}
      />

      {/* Overlay to darken if needed */}
      <div className="absolute inset-0 bg-black/40 z-0" />

      {/* Foreground Content */}
      <main className="relative z-10 text-white px-6 py-10">


        <h1 className="text-4xl font-bold text-center mb-8 mt-20">Start a Battle</h1>

        <div className="grid grid-cols-3 gap-4">
          {/* Left: Player 1 & Weapon 1 */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl mb-2">Player 1</h2>
              <img src={p1?.image} alt="player 1" width={200} height={200} />
              <select value={p1?._id || ""}
                onChange={(e) => {
                  const selected = gameData.characters.find((c) => c._id === e.target.value);
                  setP1(selected || null);
                }}
                className="w-1/2 bg-gray-800 p-2 rounded">
                <option value="">Select Character</option>
                {gameData.characters.map((char) => (
                  <option key={char._id} value={char._id}>
                    {char.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h2 className="text-xl mb-2">Weapon 1</h2>
              <img src={w1?.image} alt="weapon 1" width={100} />
              <select value={w1?._id || ""}
                onChange={(e) => {
                  const selected = gameData.weapons.find((w) => w._id === e.target.value);
                  setW1(selected || null);
                }}
                className="w-1/2 bg-gray-800 p-2 rounded">
                <option value="">Select Weapon</option>
                {gameData.weapons.map((wpn) => (
                  <option key={wpn._id} value={wpn._id}>
                    {wpn.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Center: Stage, Bot & Start Button */}
          <div className="space-y-6 flex flex-col items-center">
            <div>
              <h2 className="text-xl mb-2">Stage</h2>
              <img src={stage?.image} alt="stage" width={300} />
              <select value={stage?._id}
                onChange={(e) => {
                  const selected = gameData.stages.find((s) => s._id === e.target.value);
                  setStage(selected || null);
                }}
                className="w-full bg-gray-800 p-2 rounded">
                <option value="">Select Stage</option>
                {gameData.stages.map((stg) => (
                  <option key={stg._id} value={stg._id}>
                    {stg.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h2 className="text-xl mb-2">Announcer Bot</h2>
              <img src={announcer?.image} alt="announcer bot" width={100} />
              <select value={announcer?._id || ""}
                onChange={(e) => {
                  const selected = gameData.announcers.find((a) => a._id === e.target.value);
                  setAnnouncer(selected || null);
                }}
                className="w-full bg-gray-800 p-2 rounded">
                <option value="">Select Bot</option>
                {gameData.announcers.map((bot) => (
                  <option key={bot._id} value={bot._id}>
                    {bot.name}
                  </option>
                ))}
              </select>
            </div>

            <button onClick={handleBattleStart} className="bg-pink-600 hover:bg-pink-500 px-6 py-2 rounded-xl font-bold mt-6">
              Start Battle
            </button>

            <button onClick={() => randomizeAll()} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg mt-2">
              🎲 Randomize All
            </button>
          </div>

          {/* Right: Player 2 & Weapon 2 */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl mb-2">Player 2</h2>
              <img src={p2?.image} alt="player 2" width={200} height={200}/>
              <select value={p2?._id || ""}
                onChange={(e) => {
                  const selected = gameData.characters.find((c) => c._id === e.target.value);
                  setP2(selected || null);
                }}
                className="w-1/2 bg-gray-800 p-2 rounded">
                <option value="">Select Character</option>
                {gameData.characters.map((char) => (
                  <option key={char._id} value={char._id}>
                    {char.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h2 className="text-xl mb-2">Weapon 2</h2>
              <img src={w2?.image} alt="weapon 2" width={100} />
              <select value={w2?._id || ""}
                onChange={(e) => {
                  const selected = gameData.weapons.find((w) => w._id === e.target.value);
                  setW2(selected || null);
                }}
                className="w-1/2 bg-gray-800 p-2 rounded">
                <option value="">Select Weapon</option>
                {gameData.weapons.map((wpn) => (
                  <option key={wpn._id} value={wpn._id}>
                    {wpn.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Battle Narration Output */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Battle Narration</h2>
          <p className="bg-gray-900 p-4 rounded-lg max-w-4xl mx-auto">{narration || "Awaiting battle..."}</p>
        </div>

        {/* Stats & Leaderboards */}
        <div className="mt-10 flex justify-center gap-6">
          <button className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg">Your Stats</button>
          <button className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg">Global Leaderboard</button>
        </div>
      </main>
    </div>
  );
}
