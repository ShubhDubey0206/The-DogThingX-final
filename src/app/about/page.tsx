"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Sparkles, ShieldCheck, Award, Star, MessageSquare } from "lucide-react";
import { Footer } from "@/components/Footer";

export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } },
  };

  return (
    <>
      <main className="min-h-screen bg-background text-foreground pb-16">
        {/* Decorative background shapes */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#F5A623]/5 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#29ABE2]/5 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <p className="text-sm text-muted-foreground">
              <Link href="/" className="hover:text-[#F5A623] transition-colors">Home</Link>
              <span className="mx-2">›</span>
              <span>About Us</span>
            </p>
          </nav>

          {/* Hero Section */}
          <section className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <span className="px-4 py-1.5 rounded-full bg-[#F5A623]/10 text-[#F5A623] text-xs font-bold uppercase tracking-wider">
                Our Story
              </span>
              <h1 className="text-4xl md:text-6xl font-black mt-6 tracking-tight leading-tight">
                Crafting Happy Lives for <br />
                <span className="text-[#29ABE2]">Pets & Pet Parents</span>
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto mt-6 leading-relaxed">
                From premium nutrition to honest adoption advisory and custom aquascaping, 
                The Dog Thingx is Talegaon&apos;s ultimate pet companion.
              </p>
            </motion.div>
          </section>

          {/* Story & Philosophy */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-extrabold tracking-tight">
                Founded with Passion & Care
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                At <span className="font-semibold text-foreground">The Dog Thingx</span>, we believe that pets are not just companions—they are cherished members of the family. Founded by <span className="font-semibold text-[#F5A623]">Prasad</span> in Talegaon Dabhade, Pune, our store began as a dream to create a welcoming haven where pet parents could find high-quality care, honest guidance, and premium products.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We have moved away from transaction-based pet shopping. Under Prasad&apos;s personal leadership, we ensure that every puppy, bird, or fish is rehomed responsibly, and we consult directly with families to recommend optimal diets and setups for their beloved pets.
              </p>
              <div className="flex gap-4 pt-2">
                <Link
                  href="/shop"
                  className="bg-[#F5A623] text-[#111111] font-bold rounded-full px-6 py-3 text-sm hover:bg-[#d4891a] active:scale-95 transition-all shadow-lg shadow-[#F5A623]/20"
                >
                  Explore Store
                </Link>
                <Link
                  href="/pets"
                  className="bg-card border border-border text-foreground font-bold rounded-full px-6 py-3 text-sm hover:border-[#F5A623] hover:text-[#F5A623] active:scale-95 transition-all"
                >
                  Adopt a Pet
                </Link>
              </div>
            </motion.div>

            {/* Visual Glassmorphic Info Panel */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-card/45 backdrop-blur-md border border-card-border p-8 rounded-3xl relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#29ABE2]/10 rounded-full blur-2xl" />
              <h3 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
                <Sparkles className="text-[#F5A623]" size={20} /> Quick Highlights
              </h3>
              <ul className="space-y-4 text-sm">
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#F5A623]/20 flex items-center justify-center text-[#F5A623] shrink-0 mt-0.5">✓</div>
                  <div>
                    <span className="font-semibold block text-foreground">Responsible Adoptions</span>
                    We strictly vet homes and offer lifetime dietary guidance for puppies, kittens, and birds.
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#29ABE2]/20 flex items-center justify-center text-[#29ABE2] shrink-0 mt-0.5">✓</div>
                  <div>
                    <span className="font-semibold block text-foreground">Bespoke Aquariums</span>
                    We specialize in premium custom fish tanks, fresh-water aquascaping, and live-plant setups.
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#F5A623]/20 flex items-center justify-center text-[#F5A623] shrink-0 mt-0.5">✓</div>
                  <div>
                    <span className="font-semibold block text-foreground">Honest Advice & Consultations</span>
                    Prasad bhai offers personalized training and nutrition counseling to keep your pets healthy and happy.
                  </div>
                </li>
              </ul>
            </motion.div>
          </section>

          {/* Pillars of Our Values */}
          <section className="mb-24">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold tracking-tight">Our Core Pillars</h2>
              <p className="text-muted-foreground mt-2">The standards we live by each day</p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {[
                {
                  icon: Heart,
                  title: "Unconditional Care",
                  desc: "Every pet in our nursery receives daily veterinary checkups, play, and clean nutrition.",
                  color: "text-red-500",
                  bg: "bg-red-500/10",
                },
                {
                  icon: ShieldCheck,
                  title: "Premium Quality",
                  desc: "We stock only certified, nutritional food brands and durable, non-toxic pet accessories.",
                  color: "text-[#29ABE2]",
                  bg: "bg-[#29ABE2]/10",
                },
                {
                  icon: Award,
                  title: "Bespoke Aquascapes",
                  desc: "We bring natural ecosystems into your house with clean water maintenance and premium design.",
                  color: "text-purple-500",
                  bg: "bg-purple-500/10",
                },
                {
                  icon: MessageSquare,
                  title: "Expert Guidance",
                  desc: "Get honest recommendations from Prasad for pet health, diet changes, and aquarium care.",
                  color: "text-[#F5A623]",
                  bg: "bg-[#F5A623]/10",
                },
              ].map((pillar, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="bg-card border border-card-border p-6 rounded-2xl hover:border-[#F5A623] hover:shadow-lg transition-all group"
                >
                  <div className={`w-12 h-12 rounded-xl ${pillar.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <pillar.icon className={pillar.color} size={24} />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-foreground">{pillar.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{pillar.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* Interactive Statistics / Accomplishments */}
          <section className="bg-card/30 border border-card-border rounded-3xl p-10 mb-20 relative overflow-hidden">
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#F5A623]/5 rounded-full blur-2xl" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
              <div>
                <div className="text-3xl sm:text-4xl font-black text-[#F5A623]">500+</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-2">Happy Pet Adoptions</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black text-[#29ABE2]">10k+</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-2">Premium Products Sold</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black text-[#F5A623]">50+</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-2">Custom Aquariums Setup</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black text-green-500">4.9⭐</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-2">Google Ratings (Pune)</div>
              </div>
            </div>
          </section>

          {/* Find Us / Store Details */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-card border border-card-border p-6 rounded-2xl space-y-2">
              <h4 className="font-bold text-foreground">📍 Location</h4>
              <p className="text-sm text-muted-foreground">
                The Dog Thingx, Talegaon Dabhade, Pune, Maharashtra, India.
              </p>
            </div>
            <div className="bg-card border border-card-border p-6 rounded-2xl space-y-2">
              <h4 className="font-bold text-foreground">📞 Call Us</h4>
              <a href="tel:9960878712" className="text-sm text-[#F5A623] hover:underline block">
                9960878712
              </a>
              <span className="text-xs text-muted-foreground block">Available 10 AM - 9 PM</span>
            </div>
            <div className="bg-card border border-card-border p-6 rounded-2xl space-y-2">
              <h4 className="font-bold text-foreground">✉️ Email Support</h4>
              <a href="mailto:thedogthingx@gmail.com" className="text-sm text-[#29ABE2] hover:underline block">
                thedogthingx@gmail.com
              </a>
              <span className="text-xs text-muted-foreground block">We reply within 24 hours</span>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
