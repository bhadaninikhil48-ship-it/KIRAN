import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import gsap from "gsap";
import { isReducedMotion } from "../../utils/animations";
import heroImg from "../../assets/landing/hero.jpg";

export function HeroSection() {
  const heroRef = useRef(null);

  useEffect(() => {
    if (!heroRef.current || isReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.from(".hero-anim", {
        opacity: 0,
        y: 14,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out",
        clearProps: "all",
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative pt-24 pb-14 md:pt-32 md:pb-20 bg-gradient-to-b from-white via-emerald-50/30 to-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column (~58% width) */}
          <div className="lg:col-span-7 text-left space-y-5">
            {/* Small rounded badge */}
            <div className="hero-anim inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>India's Agricultural Trade & Intelligence Network</span>
            </div>

            {/* Bold Headline */}
            <h1 className="hero-anim text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold text-stone-950 tracking-tight leading-[1.12]">
              Connecting Farmers, FPOs & Direct Buyers for{" "}
              <span className="text-emerald-800">
                Smarter Agricultural Trade
              </span>
            </h1>

            {/* Short Concise Description */}
            <p className="hero-anim text-sm sm:text-base md:text-lg text-stone-600 leading-relaxed max-w-xl">
              KIRAN connects Farmers, FPOs and Buyers through market intelligence, digital offers, negotiation, contracts and fulfillment tracking.
            </p>

            {/* Compact CTA Row */}
            <div className="hero-anim flex flex-wrap items-center gap-3 pt-1">
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 px-5 py-2.5 rounded-full shadow-2xs transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
              >
                <span>Get Started Free</span>
                <ArrowRight size={15} />
              </Link>

              <a
                href="#how-it-works"
                className="inline-flex items-center gap-1 text-sm font-semibold text-stone-700 hover:text-stone-950 bg-white hover:bg-stone-50 border border-stone-300 px-4 py-2.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <span>Explore Workflow</span>
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="hero-anim pt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-stone-600 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-700 shrink-0" />
                <span>Verified Participants</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-700 shrink-0" />
                <span>Binding Contracts</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-700 shrink-0" />
                <span>5-Stage Tracking</span>
              </div>
            </div>
          </div>

          {/* Right Column (~42% width) with Rounded Agricultural Image & Floating Cards */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Image Container */}
              <div className="relative rounded-2xl overflow-hidden shadow-md border border-stone-200/80 bg-stone-100 aspect-[4/3]">
                <img
                  src={heroImg}
                  alt="Indian farmer standing proudly in an agricultural field"
                  fetchPriority="high"
                  className="w-full h-full object-cover object-center"
                />
              </div>

              {/* Floating Card 1: Top-Right (Trade Protection / Digital Contracts) */}
              <div className="absolute -top-3 -right-2 sm:-right-4 bg-white/95 backdrop-blur-xs rounded-xl px-3.5 py-2.5 shadow-md border border-stone-200/90 text-left flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center justify-center shrink-0">
                  <ShieldCheck size={17} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-stone-900 leading-tight">
                    Trade Protection
                  </p>
                  <p className="text-[10px] text-stone-500 font-medium">
                    Digital Contracts
                  </p>
                </div>
              </div>

              {/* Floating Card 2: Bottom-Left (Price Transparency / Mandi Benchmarks) */}
              <div className="absolute -bottom-3 -left-2 sm:-left-4 bg-white/95 backdrop-blur-xs rounded-xl px-3.5 py-2.5 shadow-md border border-stone-200/90 text-left flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center justify-center shrink-0">
                  <TrendingUp size={17} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-stone-900 leading-tight">
                    Price Transparency
                  </p>
                  <p className="text-[10px] text-stone-500 font-medium">
                    Mandi Benchmarks
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
