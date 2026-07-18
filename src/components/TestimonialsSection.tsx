"use client";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

const TESTIMONIALS = [
  { name: "Priya Sharma", city: "Wakad, Pune", initials: "PS", quote: "Prasad bhai is so knowledgeable about dogs. My Labrador puppy is thriving on the diet he recommended. The Dog Thingx is our go-to!" },
  { name: "Rahul Kadam", city: "Talegaon Dabhade", initials: "RK", quote: "Bought our first aquarium setup here. The team helped set everything up perfectly. The fish are healthy and the tank looks stunning!" },
  { name: "Sneha Joshi", city: "Chakan, Pune", initials: "SJ", quote: "Luna, our Persian cat, loves the Catit water fountain we bought. Delivery was quick and packaging was great. Highly recommend!" },
  { name: "Amit Patil", city: "Pimpri-Chinchwad", initials: "AP", quote: "Got our Beagle puppy Rocky from here. Healthy, vaccinated, and full of love. Prasad was honest about the whole adoption process." },
  { name: "Kavita Deshpande", city: "Dehu Road, Pune", initials: "KD", quote: "Great variety of bird food and accessories. My cockatiels have never been happier. Prices are very reasonable compared to city stores." },
  { name: "Sanjay More", city: "Talegaon Dabhade", initials: "SM", quote: "The dog harness I bought here saved us during walks — no more pulling. Quality products at fair prices. Will keep coming back!" },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.15 }}
          className="text-2xl font-bold mb-10"
        >
          Happy Pet Parents ❤️
        </motion.h2>
        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {TESTIMONIALS.map((t) => (
            <motion.div
              key={t.name}
              variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="bg-card border border-card-border rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#F5A623] flex items-center justify-center text-[#111111] font-bold text-sm shrink-0">
                  {t.initials}
                </div>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.city}</div>
                </div>
              </div>
              <div className="flex items-center gap-0.5 mb-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={13} fill="#F5C518" stroke="#F5C518" />
                ))}
              </div>
              <p className="text-sm italic text-foreground line-clamp-4">{t.quote}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
