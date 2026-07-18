"use client";
import { HeroSection } from "@/components/HeroSection";
import { ProductsSection } from "@/components/ProductsSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProductsSection />
      <TestimonialsSection />
      <Footer />
    </>
  );
}
