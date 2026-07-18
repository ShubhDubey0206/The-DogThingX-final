"use client";
import Link from "next/link";
import { motion } from "framer-motion";

const PAW_POSITIONS = [
  { top: "10%", left: "5%", delay: 0 },
  { top: "20%", left: "80%", delay: 0.4 },
  { top: "60%", left: "3%", delay: 0.8 },
  { top: "70%", left: "85%", delay: 1.2 },
  { top: "40%", left: "70%", delay: 1.6 },
  { top: "85%", left: "20%", delay: 2.0 },
];

function PawPrint() {
  return (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="#F5A623">
      <ellipse cx="16" cy="21" rx="7" ry="6" />
      <ellipse cx="9" cy="13" rx="2.5" ry="3.5" />
      <ellipse cx="23" cy="13" rx="2.5" ry="3.5" />
      <ellipse cx="13" cy="10" rx="2" ry="3" />
      <ellipse cx="19" cy="10" rx="2" ry="3" />
    </svg>
  );
}

export function HeroSection() {
  const scrollToFooter = () => document.getElementById("footer")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section
      id="hero"
      className="relative min-h-[calc(100vh-64px)] flex items-center overflow-hidden px-4 sm:px-6 lg:px-8 py-16"
    >
      {/* Floating paw prints */}
      {PAW_POSITIONS.map((pos, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{ top: pos.top, left: pos.left }}
          animate={{ opacity: [0, 0.15, 0], y: [0, -30, 0] }}
          transition={{ duration: 3, delay: pos.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          <PawPrint />
        </motion.div>
      ))}

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left: Text */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-flex items-center bg-[#F5A623] text-[#111111] rounded-full text-sm font-semibold px-4 py-1.5 mb-6">
            Pune&apos;s Favourite Pet Shop 🐾
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold text-[#29ABE2] leading-tight mb-4">
            The Dog Thingx
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-lg">
            &ldquo;Take a step for your pets, they&apos;ll love you more&rdquo;
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/shop"
              data-testid="link-browse-shop"
              className="inline-flex items-center justify-center bg-[#F5A623] text-[#111111] rounded-full px-8 py-3 font-bold text-base hover:bg-[#d4891a] hover:scale-105 active:scale-95 transition-all text-center"
            >
              Browse Shop
            </Link>
            <button
              onClick={scrollToFooter}
              data-testid="button-contact-us"
              className="inline-flex items-center justify-center border-2 border-[#F5A623] text-[#F5A623] rounded-full px-8 py-3 font-bold text-base hover:bg-[#F5A623] hover:text-[#111111] active:scale-95 transition-all"
            >
              Contact Us
            </button>
          </div>
        </motion.div>

        {/* Right: Image */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative"
        >
          <img
            src="https://images.unsplash.com/photo-1601758174114-e711c0cbaa69?w=700&q=80"
            alt="Happy pets at The Dog Thingx"
            className="w-full h-96 object-cover rounded-2xl"
          />
          <div className="absolute -bottom-4 -left-4 bg-[#F5A623] text-[#111111] rounded-2xl px-5 py-3 font-bold text-sm shadow-lg">
            Dogs · Cats · Birds · Fish
          </div>
        </motion.div>
      </div>
    </section>
  );
}
