import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-between bg-black text-white px-6 py-10">
      <section className="text-center mt-20">
        <h1 className="text-5xl font-bold mb-4 tracking-widest">LafdaClub</h1>
        <p className="text-lg text-gray-300 mb-8">Merch. Mayhem. Multiplayer Madness.</p>
        <div className="flex gap-4 justify-center">
          <a
            href="/merch"
            className="bg-pink-600 hover:bg-pink-500 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            Explore Merch
          </a>
          <a
            href="/game"
            className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-6 py-3 rounded-xl transition"
          >
            Enter Arena
          </a>
        </div>
      </section>

      <footer className="mt-32 text-sm text-gray-500 text-center">
        &copy; {new Date().getFullYear()} LafdaClub. All rights reserved.
      </footer>
    </main>
  );
}