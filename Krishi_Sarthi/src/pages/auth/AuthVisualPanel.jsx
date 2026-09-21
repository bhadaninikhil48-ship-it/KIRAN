import { useState, useEffect } from "react";
import { Sparkles, Leaf } from "lucide-react";
import farmerImg from "../../assets/landing/farmer.jpg";
import buyerImg from "../../assets/landing/buyer.jpg";
import fpoImg from "../../assets/landing/fpo.jpg";
import heroImg from "../../assets/landing/hero.jpg";

const SLIDES = [
  {
    image: farmerImg,
    alt: "Indian farmer in agricultural field with modern equipment",
    tag: "Direct Farmgate Linkage",
    title: "From Farmgate to Enterprise",
    desc: "Empowering growers with transparent mandi rate intelligence, direct buyer bids, and fair price discovery.",
  },
  {
    image: buyerImg,
    alt: "Wholesale fresh produce crates in commercial agricultural market",
    tag: "Quality & Verification",
    title: "Quality Harvests, Verified Lots",
    desc: "Connecting institutional buyers with standardized quality produce directly from verified regional growers.",
  },
  {
    image: fpoImg,
    alt: "Group of Indian farmers working together in agricultural paddy field",
    tag: "Collective Agriculture",
    title: "Stronger Together as FPOs",
    desc: "Aggregating produce across member farms to unlock bulk industrial procurement demand and higher collective margins.",
  },
  {
    image: heroImg,
    alt: "Agricultural partners agreeing on trade in a golden wheat field",
    tag: "Contract Enforcement",
    title: "Binding Digital Trade Contracts",
    desc: "Negotiate counter-proposals with confidence and execute legally binding deeds with 5-stage fulfillment tracking.",
  },
];

export function AuthVisualPanel({ className = "" }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance slideshow every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-emerald-950 text-white shadow-xl ${className}`}
    >
      {/* Background Images with Crossfade */}
      {SLIDES.map((slide, index) => {
        const isActive = index === currentSlide;
        return (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out pointer-events-none ${
              isActive ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              className={`w-full h-full object-cover transition-transform duration-7000 ease-out ${
                isActive ? "scale-105" : "scale-100"
              }`}
            />
          </div>
        );
      })}

      {/* Multi-Stop Gradient Overlays for Readability & Depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950/95 via-gray-950/40 to-emerald-950/40 pointer-events-none" />
      <div className="absolute inset-0 bg-emerald-950/15 mix-blend-multiply pointer-events-none" />

      {/* Top Brand Capsule */}
      <div className="relative z-10 p-6 sm:p-8 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-emerald-300 text-xs font-bold tracking-wide">
          <Leaf size={14} className="text-emerald-400 shrink-0" />
          <span>KIRAN Agricultural Network</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-200/80 font-medium">
          <Sparkles size={14} className="text-amber-400" />
          <span>Real-time Agri-Trade</span>
        </div>
      </div>

      {/* Bottom Content Area */}
      <div className="relative z-10 p-6 sm:p-8 mt-auto flex flex-col justify-end space-y-4">
        {/* Animated Slide Copy */}
        <div className="min-h-[100px] flex flex-col justify-end">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-300 bg-emerald-900/60 px-2.5 py-0.5 rounded-full w-fit border border-emerald-400/30 mb-2">
            {SLIDES[currentSlide].tag}
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
            {SLIDES[currentSlide].title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-200/90 mt-1.5 leading-relaxed max-w-md">
            {SLIDES[currentSlide].desc}
          </p>
        </div>

        {/* Carousel Indicator Dots */}
        <div className="flex items-center gap-2 pt-2">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentSlide
                  ? "w-8 bg-emerald-400"
                  : "w-2 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default AuthVisualPanel;
