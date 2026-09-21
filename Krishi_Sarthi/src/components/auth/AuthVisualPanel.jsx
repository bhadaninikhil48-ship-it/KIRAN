import { useState, useEffect, useCallback } from "react";
import img1 from "../../assets/auth/auth-farmer-1.jpg";
import img2 from "../../assets/auth/auth-farmer-2.jpg";
import img3 from "../../assets/auth/auth-farm-3.jpg";
import img4 from "../../assets/auth/auth-market-4.jpg";
import { isReducedMotion } from "../../utils/animations";

const slides = [
  {
    image: img1,
    badge: "DIRECT FARMGATE LINKAGE",
    headline: "From Farmgate to Enterprise",
    caption:
      "Empowering growers with transparent mandi rate intelligence, direct buyer connections, and fair price discovery.",
    alt: "Indian farmer in lush agricultural field inspecting healthy crops",
  },
  {
    image: img2,
    badge: "STRUCTURED CONTRACTING",
    headline: "Binding Trade Agreements",
    caption:
      "Milestone-based fulfillment, transparent digital contracts, and dispute mitigation for agricultural collectives.",
    alt: "Farmers working together in harvest paddy field",
  },
  {
    image: img3,
    badge: "FPO CONSOLIDATION",
    headline: "Collective Farm Power",
    caption:
      "Empowering farmer producer clusters to aggregate harvest volumes and access national institutional buyers.",
    alt: "Agricultural farming landscape with fertile green fields",
  },
  {
    image: img4,
    badge: "ENTERPRISE SOURCING",
    headline: "Verified Produce Pipeline",
    caption:
      "Standardized grading, transparent pricing benchmarks, and dependable procurement logistics across India.",
    alt: "Fresh agricultural produce graded and sorted for procurement",
  },
];

export function AuthVisualPanel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const reducedMotion = isReducedMotion();

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 4500);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full h-full min-h-[360px] lg:min-h-[600px] rounded-2xl lg:rounded-[22px] overflow-hidden select-none bg-stone-950 flex flex-col justify-between p-5 sm:p-7"
    >
      {/* Background Images Cross-fade */}
      {slides.map((slide, idx) => {
        const isActive = idx === current;
        return (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              loading={idx === 0 ? "eager" : "lazy"}
              className={`w-full h-full object-cover object-center ${
                !reducedMotion && isActive ? "scale-105 transition-transform duration-7000 ease-out" : ""
              }`}
            />
          </div>
        );
      })}

      {/* Dark & Emerald Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/45 to-stone-950/30 z-20" />
      <div className="absolute inset-0 bg-emerald-950/20 mix-blend-multiply z-20 pointer-events-none" />

      {/* Top Floating Glass Pills */}
      <div className="relative z-30 flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white/95 text-[11px] font-medium shadow-xs">
          <span className="text-emerald-400">🌿</span>
          <span>KIRAN Agricultural Network</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white/90 text-[11px] font-medium shadow-xs">
          <span className="text-amber-300">✦</span>
          <span>Real-time Agri-Trade</span>
        </div>
      </div>

      {/* Bottom Floating Messaging Area */}
      <div className="relative z-30 text-left text-white space-y-2.5 pt-12 sm:pt-16">
        {/* Small Green Badge */}
        <div>
          <span className="inline-block bg-[#047857] text-white font-bold text-[10px] tracking-wider uppercase px-2.5 py-0.5 rounded shadow-xs">
            {slides[current].badge}
          </span>
        </div>

        {/* Strong SaaS Headline */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight tracking-tight">
          {slides[current].headline}
        </h2>

        {/* Supporting Contextual Description */}
        <p className="text-xs sm:text-sm text-stone-200/90 leading-relaxed max-w-sm">
          {slides[current].caption}
        </p>

        {/* Pagination Indicators */}
        <div className="flex items-center gap-1.5 pt-2" role="tablist" aria-label="Agricultural photo slides">
          {slides.map((_, idx) => {
            const isActive = idx === current;
            return (
              <button
                key={idx}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Show slide ${idx + 1}`}
                onClick={() => setCurrent(idx)}
                className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                  isActive
                    ? "w-7 bg-emerald-400 shadow-xs"
                    : "w-2 bg-white/40 hover:bg-white/75"
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const AuthImageCarousel = AuthVisualPanel;
export default AuthVisualPanel;
