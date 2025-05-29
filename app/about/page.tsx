"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen text-white px-6 py-16 relative overflow-hidden">
      {/* Glitch background overlay */}
      <div className="absolute inset-0 opacity-20">
        <Image
          src="/bg-glitch.png"
          alt="glitch background"
          layout="fill"
          objectFit="cover"
          className="z-0"
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto space-y-16">
        {/* Hero section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <Image
            src="/lafda-icon.png"
            alt="LafdaClub Logo"
            width={120}
            height={120}
            className="mx-auto mb-4"
          />
          <h1 className="text-5xl font-extrabold tracking-widest text-pink-500 uppercase">
            About LafdaClub
          </h1>
          <p className="text-lg mt-4 max-w-2xl mx-auto text-gray-300">
            Where pixels rebel, chaos thrives, and style tells stories. Welcome to the movement.
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-16">
          {[
            {
              title: "What is LafdaClub?",
              text:
                "LafdaClub isn’t just a brand — it’s a movement for chaos lovers, glitch-dwellers, and pixel rebels. Born from gaming, late-night rants, and bold expression, we make things loud, weird, and real.",
            },
            {
              title: "Our Merch",
              text:
                "We drop limited graphic tees, hoodies, caps, and more — loaded with pixel art, glitchcore vibes, and neon chaos. Each item levels up your fit.",
            },
            {
              title: "Design Philosophy",
              text:
                "We’re inspired by retro games, Y2K visuals, internet decay, and whatever makes you feel seen. Our merch speaks in pixels and shouts in color.",
            },
            {
              title: "Quality Assurance",
              text:
                "Our merch is built to last. Premium fabrics, vivid prints, stitched to survive. No fast fashion — just durable streetwear with soul.",
            },
            {
              title: "The Club",
              text:
                "LafdaClub is a crew of artists, gamers, coders, and internet kids who never grew up. You’re one of us now. Let’s make lafdas together.",
            },
            {
              title: "Built Different",
              text:
                "We’re not selling hype. We’re building a universe. One pixel, one glitch, one drop at a time. Welcome to LafdaClub.",
            },
          ].map((section, idx) => (
            <motion.section
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              className="space-y-4"
            >
              <h2 className="text-3xl font-bold text-pink-400 border-b border-pink-600 pb-2">
                {section.title}
              </h2>
              <p className="text-lg leading-relaxed text-gray-300">{section.text}</p>
            </motion.section>
          ))}
        </div>

        {/* Members section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-pink-400 mb-6">Meet the Members</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 justify-center">
            {["founder", "designer", "dev"].map((role, i) => (
              <div
                key={i}
                className="flex flex-col items-center bg-gray-800 p-4 rounded-xl border border-pink-500 shadow-lg"
              >
                <Image
                  src={`/members/${role}.png`}
                  alt={role}
                  width={80}
                  height={80}
                  className="rounded-full mb-3"
                />
                <p className="text-lg capitalize font-medium">{role}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Socials */}
        <div className="text-center pt-10 border-t border-gray-700">
          <h3 className="text-xl font-semibold text-pink-300 mb-2">Join the Club</h3>
          <p className="text-gray-400 mb-4">Follow us and share your chaos</p>
          <div className="flex justify-center gap-6">
            {[
              { icon: "🐦", name: "Twitter", href: "https://twitter.com/lafdaclub" },
              { icon: "📸", name: "Instagram", href: "https://instagram.com/lafdaclub" },
              { icon: "🎮", name: "Discord", href: "https://discord.gg/lafdaclub" },
            ].map((social, i) => (
              <Link
                key={i}
                href={social.href}
                target="_blank"
                className="text-pink-400 hover:text-pink-300 text-lg"
              >
                {social.icon} {social.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
