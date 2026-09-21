import { useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Store,
  ArrowRight,
  Info,
  MapPin,
  Truck,
  Sparkles,
  HelpCircle,
} from "lucide-react";

export function MarketIntelligenceSection() {
  const [selectedCrop, setSelectedCrop] = useState("Tomato");

  // Illustrative preview data
  const illustrativeSamples = {
    Tomato: {
      market: "Nashik APMC",
      state: "Maharashtra",
      modalPrice: "₹2,520",
      minPrice: "₹2,100",
      maxPrice: "₹2,800",
      trend: "+5.8%",
      arrival: "850 Quintals",
      transportEst: "₹140/q",
      netRealization: "₹2,380/q",
      grade: "Grade A Hybrid",
    },
    Onion: {
      market: "Lasalgaon APMC",
      state: "Maharashtra",
      modalPrice: "₹1,850",
      minPrice: "₹1,600",
      maxPrice: "₹2,150",
      trend: "+3.2%",
      arrival: "1,200 Quintals",
      transportEst: "₹160/q",
      netRealization: "₹1,690/q",
      grade: "Medium Red Export",
    },
    Wheat: {
      market: "Indore APMC",
      state: "Madhya Pradesh",
      modalPrice: "₹2,475",
      minPrice: "₹2,350",
      maxPrice: "₹2,600",
      trend: "+1.9%",
      arrival: "2,400 Quintals",
      transportEst: "₹110/q",
      netRealization: "₹2,365/q",
      grade: "Lokwan Grade 1",
    },
    Soybean: {
      market: "Ujjain APMC",
      state: "Madhya Pradesh",
      modalPrice: "₹4,650",
      minPrice: "₹4,300",
      maxPrice: "₹4,820",
      trend: "-0.8%",
      arrival: "950 Quintals",
      transportEst: "₹180/q",
      netRealization: "₹4,470/q",
      grade: "Yellow Oilseed Grade",
    },
  };

  const currentSample = illustrativeSamples[selectedCrop];

  return (
    <section
      id="market-intelligence"
      className="py-16 sm:py-24 bg-stone-50/70 border-b border-stone-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-semibold uppercase tracking-wider mb-3">
            <Store size={14} />
            <span>Price Discovery Engine</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight font-serif">
            Market Intelligence Preview
          </h2>
          <p className="mt-3 text-base sm:text-lg text-stone-600 leading-relaxed">
            Understand mandi price dynamics, regional rate variations, and estimated transport costs before agreeing to sell or purchase produce.
          </p>
        </div>

        {/* Intelligence Card Mockup Container */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-stone-200">
          {/* Crop Selector Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 mb-6 border-b border-stone-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Select Commodity:
              </span>
              <div className="flex items-center gap-1.5">
                {Object.keys(illustrativeSamples).map((crop) => (
                  <button
                    key={crop}
                    type="button"
                    onClick={() => setSelectedCrop(crop)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      selectedCrop === crop
                        ? "bg-emerald-800 text-white shadow-2xs"
                        : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                    }`}
                  >
                    {crop}
                  </button>
                ))}
              </div>
            </div>

            {/* Illustrative Disclaimer Label */}
            <div className="inline-flex items-center gap-1 text-[11px] text-stone-500 bg-stone-100 px-2.5 py-1 rounded-md">
              <Info size={13} className="text-stone-400 shrink-0" />
              <span>Illustrative Platform Preview</span>
            </div>
          </div>

          {/* Core Analytics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-left">
            {/* 1. APMC Modal Benchmark */}
            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
              <div className="flex items-center justify-between text-xs text-emerald-800 mb-1">
                <span className="font-semibold uppercase tracking-wider">
                  Mandi Modal Price
                </span>
                <span className="font-bold bg-emerald-200/80 px-1.5 py-0.5 rounded text-[10px]">
                  {currentSample.trend}
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950 font-mono my-1">
                {currentSample.modalPrice}
                <span className="text-xs font-normal text-emerald-800">/quintal</span>
              </div>
              <p className="text-xs text-emerald-800 mt-2 flex items-center gap-1">
                <MapPin size={13} className="text-emerald-700 shrink-0" />
                <span>
                  {currentSample.market}, {currentSample.state}
                </span>
              </p>
            </div>

            {/* 2. Min / Max Price Spread */}
            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block mb-1">
                Mandi Price Spread
              </span>
              <div className="flex items-center justify-between py-1 border-b border-stone-200/80 text-xs">
                <span className="text-stone-600">Minimum Rate:</span>
                <span className="font-bold text-stone-900 font-mono">
                  {currentSample.minPrice}/q
                </span>
              </div>
              <div className="flex items-center justify-between py-1 text-xs">
                <span className="text-stone-600">Maximum Rate:</span>
                <span className="font-bold text-stone-900 font-mono">
                  {currentSample.maxPrice}/q
                </span>
              </div>
              <div className="mt-2 text-[11px] text-stone-500 flex justify-between">
                <span>Arrival Volume:</span>
                <span className="font-medium text-stone-700">
                  {currentSample.arrival}
                </span>
              </div>
            </div>

            {/* 3. Transport & Net Realization */}
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-900 block mb-1">
                Est. Net Realization
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-950 font-mono my-1">
                {currentSample.netRealization}
              </div>
              <p className="text-xs text-amber-900 mt-2 flex items-center gap-1">
                <Truck size={13} className="text-amber-700 shrink-0" />
                <span>Less transport: ~{currentSample.transportEst}</span>
              </p>
            </div>
          </div>

          {/* Bottom Clarification Notice */}
          <div className="p-4 bg-stone-100 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
            <div className="flex items-start gap-2.5">
              <Info size={16} className="text-stone-500 shrink-0 mt-0.5" />
              <p className="text-xs text-stone-600 leading-relaxed">
                <strong className="text-stone-800 font-semibold">
                  Notice:
                </strong>{" "}
                The figures shown above are sample illustrations depicting how KIRAN presents APMC modal rates, price ranges, and transit estimates. Authenticated users access live Mandi intelligence feeds directly inside the platform.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 shrink-0 hover:underline"
            >
              <span>Sign In for Live Feeds</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MarketIntelligenceSection;
