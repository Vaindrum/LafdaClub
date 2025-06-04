// app/play/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { axiosInstance } from "@/lib/axios";
import SelectionBox from "@/components/SelectionBox";
import Loading from "@/components/Loading";

// ─── IMPORT FRAMER MOTION ─────────────────────────────────────────────────────
import { motion, Variants } from "framer-motion";

type GameData = {
  characters: { _id: string; name: string; image: string }[];
  weapons: { _id: string; name: string; image: string }[];
  stages: { _id: string; name: string; image: string }[];
  announcers: { _id: string; name: string; image: string }[];
};

// ─── FRAMER MOTION VARIANTS ────────────────────────────────────────────────────
// Container that staggers its children
const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.08,
      when: "beforeChildren",
    },
  },
};

// Each child will fade in
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function PlayGamePage() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const [gameData, setGameData] = useState<GameData | null>(null);
  const [p1, setP1] = useState<GameData["characters"][0] | null>(null);
  const [p2, setP2] = useState<GameData["characters"][0] | null>(null);
  const [w1, setW1] = useState<GameData["weapons"][0] | null>(null);
  const [w2, setW2] = useState<GameData["weapons"][0] | null>(null);
  const [stage, setStage] = useState<GameData["stages"][0] | null>(null);
  const [announcer, setAnnouncer] = useState<GameData["announcers"][0] | null>(null);
  const [narration, setNarration] = useState<string>("");

  // Which box is open? (null if none)
  const [openBoxId, setOpenBoxId] = useState<string | null>(null);

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

  const randomFromArray = <T,>(arr: T[]): T =>
    arr[Math.floor(Math.random() * arr.length)];

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
    setP1(randomChar1);
    setP2(randomChar2);
    setW1(randomWeapon1);
    setW2(randomWeapon2);
    setStage(randomFromArray(d.stages));
    setAnnouncer(randomFromArray(d.announcers));
    setNarration("");
    setOpenBoxId(null);
  };

  const toggleGrid = (boxId: string) => {
    setOpenBoxId((current) => (current === boxId ? null : boxId));
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
      sectionRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      alert("Battle failed to start.");
      console.error(err);
    }
  };

  if (!gameData) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <Loading />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black">
      {/* Background (blurred stage image) */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${stage?.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(10px)",
        }}
      />
      <div className="absolute inset-0 bg-black/40 z-0" />

      {/*** ─── DESKTOP UI ───────────────────────────────────────────── ***/}
      <motion.main
        className="hidden md:block relative z-10 px-40 py-10 text-white"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-4xl font-bold text-center mb-5 mt-14"
          variants={itemVariants}
        >
          Start a Battle
        </motion.h1>

        {/* Row 1: Player1 - Stage - Player2 */}
        <motion.div className="flex justify-between items-start" variants={itemVariants}>
          {/* Player 1 */}
          <div className="flex flex-col items-center space-y-8">
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 1 }}
              className={`relative ${openBoxId === "p1" ? "z-30" : "z-10"}`}
            >
              <SelectionBox
                boxId="p1"
                isOpen={openBoxId === "p1"}
                onToggle={toggleGrid}
                placement="right"
                label="Player 1"
                name={p1?.name}
                image={p1?.image}
                items={gameData.characters}
                type="character"
                selectedId={p1?._id}
                onChange={setP1}
                sizeClass="w-70 h-70"
              />
            </motion.div>
          </div>

          {/* Stage */}
          <div className="flex flex-col items-center">
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 1 }}
              className={`relative ${openBoxId === "stage" ? "z-30" : "z-10"}`}
            >
              <SelectionBox
                boxId="stage"
                isOpen={openBoxId === "stage"}
                onToggle={toggleGrid}
                placement="right"
                label="Stage"
                image={stage?.image}
                name={stage?.name}
                items={gameData.stages}
                type="stage"
                selectedId={stage?._id}
                onChange={setStage}
                sizeClass="w-120 h-70"
              />
            </motion.div>
          </div>

          {/* Player 2 */}
          <div className="flex flex-col items-center space-y-8">
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 1 }}
              className={`relative ${openBoxId === "p2" ? "z-30" : "z-10"}`}
            >
              <SelectionBox
                boxId="p2"
                isOpen={openBoxId === "p2"}
                onToggle={toggleGrid}
                placement="left"
                label="Player 2"
                image={p2?.image}
                name={p2?.name}
                items={gameData.characters}
                type="character"
                selectedId={p2?._id}
                onChange={setP2}
                sizeClass="w-70 h-70"
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Row 2: Weapon1 - Announcer & Buttons - Weapon2 */}
        <motion.div className="mt-8 flex justify-between items-center" variants={itemVariants}>
          {/* Weapon 1 */}
          <div className="flex flex-col items-center">
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 1 }}
              className={`relative ${openBoxId === "w1" ? "z-30" : "z-10"}`}
            >
              <SelectionBox
                boxId="w1"
                isOpen={openBoxId === "w1"}
                onToggle={toggleGrid}
                placement="right"
                label="Weapon 1"
                image={w1?.image}
                name={w1?.name}
                items={gameData.weapons}
                type="weapon"
                selectedId={w1?._id}
                onChange={setW1}
                sizeClass="w-40 h-40"
              />
            </motion.div>
          </div>

          {/* Announcer & Buttons */}
          <div className="flex items-center space-x-8">
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 1 }}
              className={`relative ${openBoxId === "announcer" ? "z-30" : "z-10"}`}
            >
              <SelectionBox
                boxId="announcer"
                isOpen={openBoxId === "announcer"}
                onToggle={toggleGrid}
                placement="right"
                label="Announcer"
                name={announcer?.name}
                image={announcer?.image}
                items={gameData.announcers}
                type="announcer"
                selectedId={announcer?._id}
                onChange={setAnnouncer}
                sizeClass="w-40 h-40"
              />
            </motion.div>

            <div className="flex flex-col space-y-4">
              <motion.button
                onClick={handleBattleStart}
                className="bg-pink-600 hover:bg-pink-500 px-20 py-2 rounded-xl font-bold cursor-pointer"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Battle
              </motion.button>
              <motion.button
                onClick={() => randomizeAll()}
                className="bg-gray-700 hover:bg-gray-600 px-20 py-2 rounded-lg font-medium cursor-pointer"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🎲 Randomize All
              </motion.button>
            </div>
          </div>

          {/* Weapon 2 */}
          <div className="flex flex-col items-center">
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 1 }}
              className={`relative ${openBoxId === "w2" ? "z-30" : "z-10"}`}
            >
              <SelectionBox
                boxId="w2"
                isOpen={openBoxId === "w2"}
                onToggle={toggleGrid}
                placement="left"
                label="Weapon 2"
                image={w2?.image}
                name={w2?.name}
                items={gameData.weapons}
                type="weapon"
                selectedId={w2?._id}
                onChange={setW2}
                sizeClass="w-40 h-40"
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Battle Narration */}
        <motion.div className="mt-12 text-center" variants={itemVariants}>
          <h2 className="text-2xl font-bold mb-4">Battle Narration</h2>
          <motion.p
            className="mx-auto max-w-3xl bg-gray-900 p-4 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {narration || "Awaiting battle..."}
          </motion.p>
        </motion.div>

        {/* Stats & Leaderboard Buttons */}
        <motion.div
          className="mt-10 flex justify-center gap-6"
          ref={sectionRef}
          variants={itemVariants}
        >
          <motion.button
            className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Your Stats
          </motion.button>
          <motion.button
            className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Global Leaderboard
          </motion.button>
        </motion.div>
      </motion.main>

      {/*** ─── MOBILE UI ───────────────────────────────────────────── ***/}
      <div className="md:hidden relative z-10 px-4 py-6 text-white space-y-6">
        <h1 className="text-2xl font-bold text-center mt-15 mb-4">Start a Battle</h1>

        {/* Player 1 & 2 (two columns) */}
        <div className="flex items-center justify-between gap-2 mx-2">
        <div className="bg-black/50 p-2 w-fit rounded-lg">
          <SelectionBox
            boxId="p1"
            isOpen={openBoxId === "p1"}
            onToggle={toggleGrid}
            placement="center"
            label="Player 1"
            name={p1?.name}
            image={p1?.image}
            items={gameData.characters}
            type="character"
            selectedId={p1?._id}
            onChange={setP1}
            sizeClass="w-24 h-24"
          />
          </div>
        <div className="bg-black/50 p-2 w-fit rounded-lg">
          <SelectionBox
            boxId="p2"
            isOpen={openBoxId === "p2"}
            onToggle={toggleGrid}
            placement="center"
            label="Player 2"
            name={p2?.name}
            image={p2?.image}
            items={gameData.characters}
            type="character"
            selectedId={p2?._id}
            onChange={setP2}
            sizeClass="w-24 h-24"
          />
        </div>
        </div>

        {/* Weapon 1, Announcer, Weapon 2 (three columns) */}
        <div className="flex gap-2 items-center justify-center">
        <div className="bg-black/50 p-2 w-fit rounded-lg">
          <SelectionBox
            boxId="w1"
            isOpen={openBoxId === "w1"}
            onToggle={toggleGrid}
            placement="center"
            label="Weapon 1"
            name={w1?.name}
            image={w1?.image}
            items={gameData.weapons}
            type="weapon"
            selectedId={w1?._id}
            onChange={setW1}
            sizeClass="w-20 h-20"
          />
          </div>
        <div className="bg-black/50 p-2 w-fit rounded-lg">
          <SelectionBox
            boxId="announcer"
            isOpen={openBoxId === "announcer"}
            onToggle={toggleGrid}
            placement="center"
            label="Announcer"
            name={announcer?.name}
            image={announcer?.image}
            items={gameData.announcers}
            type="announcer"
            selectedId={announcer?._id}
            onChange={setAnnouncer}
            sizeClass="w-20 h-20"
          />
          </div>
        <div className="bg-black/50 p-2 w-fit rounded-lg">
          <SelectionBox
            boxId="w2"
            isOpen={openBoxId === "w2"}
            onToggle={toggleGrid}
            placement="center"
            label="Weapon 2"
            name={w2?.name}
            image={w2?.image}
            items={gameData.weapons}
            type="weapon"
            selectedId={w2?._id}
            onChange={setW2}
            sizeClass="w-20 h-20"
          />
          </div>
        </div>

        {/* Stage (full width) */}
        <div className="flex items-center justify-center">
        <div className="bg-black/50 p-2 w-fit rounded-lg">
        <SelectionBox
          boxId="stage"
          isOpen={openBoxId === "stage"}
          onToggle={toggleGrid}
          placement="center"
          label="Stage"
          name={stage?.name}
          image={stage?.image}
          items={gameData.stages}
          type="stage"
          selectedId={stage?._id}
          onChange={setStage}
          sizeClass="w-full h-32"
          />
          </div>
          </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleBattleStart}
            className="w-full bg-pink-600 hover:bg-pink-500 py-2 rounded-lg font-bold"
          >
            Start Battle
          </button>
          <button
            onClick={() => randomizeAll()}
            className="w-full bg-gray-700 hover:bg-gray-600 py-2 rounded-lg font-medium"
          >
            🎲 Randomize All
          </button>
        </div>

        {/* Narration */}
        <div className="mt-6 text-center">
          <h2 className="text-xl font-bold mb-2">Battle Narration</h2>
          <p className="bg-gray-900 p-3 rounded-lg">{narration || "Awaiting battle..."}</p>
        </div>

        {/* Stats & Leaderboard */}
        <div className="mt-6 flex flex-col gap-3 mb-20">
          <button className="bg-gray-800 hover:bg-gray-700 py-2 rounded-lg font-medium">
            Your Stats
          </button>
          <button className="bg-gray-800 hover:bg-gray-700 py-2 rounded-lg font-medium">
            Global Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}
