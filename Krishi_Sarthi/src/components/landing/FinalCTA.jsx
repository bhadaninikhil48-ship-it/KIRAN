import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-14 sm:py-20 bg-emerald-50/40 border-b border-stone-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Eyebrow badge */}
        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-3 py-1 rounded-full inline-block mb-3">
          JOIN THE NETWORK
        </span>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-950 tracking-tight">
          Ready to Make Agricultural Trade Smarter?
        </h2>

        {/* Short paragraph */}
        <p className="text-sm sm:text-base text-stone-600 mt-2.5 max-w-xl mx-auto leading-relaxed">
          Create an account on KIRAN to access verified mandi benchmarks, exchange direct proposals, and establish binding contracts.
        </p>

        {/* 3 Compact Buttons */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 px-4 py-2.5 rounded-full shadow-2xs transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <span>Register as Farmer</span>
            <ArrowRight size={14} />
          </Link>

          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-900 bg-white hover:bg-stone-50 border border-stone-300 px-4 py-2.5 rounded-full shadow-2xs transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <span>Register as FPO</span>
            <ArrowRight size={14} />
          </Link>

          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-900 bg-white hover:bg-stone-50 border border-stone-300 px-4 py-2.5 rounded-full shadow-2xs transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <span>Register as Buyer</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Already registered sign in link */}
        <div className="mt-5">
          <Link
            to="/login"
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:underline"
          >
            Already registered? Sign in to your dashboard →
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FinalCTA;
