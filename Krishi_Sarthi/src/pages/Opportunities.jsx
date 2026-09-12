import { useRef, useEffect } from "react";
import {
  MapPin,
  ArrowRight,
  Info,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { animateStagger } from "../utils/animations";

export function Opportunities() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      animateStagger(containerRef.current.querySelectorAll(".opp-card-anim"), {
        delay: 0.05,
      });
    }
  }, []);

  const opportunities = [
    {
      rank: "#1 Best Option",
      name: "FreshMart Direct Procurement",
      category: "Institutional Retailer",
      location: "Indore Logistics Hub",
      crop: "Tomato (Grade A)",
      score: 91,
      netRealization: 2520,
      nominalPrice: 2600,
      deductions: 80, // transport
      demand: "High",
      reliability: "94%",
      payment: "3 Days (Escrow)",
      distance: "32 km",
      recommended: true,
      reason: "Highest net realization per quintal after deducting minimal local transit expenses.",
    },
    {
      rank: "#2 Option",
      name: "Indore APMC Mandi Auction",
      category: "Regulated APMC Yard",
      location: "Chhoithram Mandi, Indore",
      crop: "Tomato (Grade A/B)",
      score: 84,
      netRealization: 2440,
      nominalPrice: 2750,
      deductions: 310, // cess + porterage + local transit
      demand: "Medium",
      reliability: "88%",
      payment: "Same Day (Cash/Direct)",
      distance: "18 km",
      recommended: false,
      reason: "Instant liquidity on auction day, but APMC market cess and loading fees reduce net margins.",
    },
    {
      rank: "#3 Option",
      name: "Malwa FPO Shared Aggregation",
      category: "Farmer Producer Co-op",
      location: "Depalpur Aggregation Center",
      crop: "Tomato (Grade A)",
      score: 81,
      netRealization: 2410,
      nominalPrice: 2490,
      deductions: 80,
      demand: "High (Bulk Order)",
      reliability: "96%",
      payment: "5 Days (Consolidated)",
      distance: "12 km",
      recommended: false,
      reason: "Zero transport hassle; collection vehicle visits cluster center.",
    },
    {
      rank: "#4 Option",
      name: "Local Mandi Trader (Bhopal)",
      category: "Traditional Private Trader",
      location: "Karond Mandi, Bhopal",
      crop: "Tomato (Grade A)",
      score: 72,
      netRealization: 2280,
      nominalPrice: 2450,
      deductions: 170,
      demand: "Low",
      reliability: "68%",
      payment: "7–10 Days Credit",
      distance: "195 km",
      recommended: false,
      reason: "Longer transit route with deferred payment risk.",
    },
  ];

  return (
    <div ref={containerRef} className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Best Selling Opportunities Matrix
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Algorithmic ranking weighted by real pocket realization, buyer credit reliability, and logistics overhead.
          </p>
        </div>

        <Link to="/sell">
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            List Fresh Produce Lot
          </Button>
        </Link>
      </div>

      {/* Opportunity Comparison Cards */}
      <div className="space-y-4">
        {opportunities.map((opp, idx) => (
          <div
            key={idx}
            className={`opp-card-anim rounded-2xl border transition-all p-5 sm:p-6 ${
              opp.recommended
                ? "bg-gradient-to-br from-emerald-50/70 via-white to-white border-2 border-emerald-500 shadow-xs hover:shadow-md"
                : "bg-white border-gray-200/90 hover:border-gray-300 shadow-2xs"
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      opp.recommended
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {opp.rank}
                  </span>
                  <span className="text-xs text-gray-400">• {opp.category}</span>
                </div>

                <div className="flex items-baseline gap-2 flex-wrap">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                    {opp.name}
                  </h3>
                  <span className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                    <MapPin size={13} className="text-gray-400" />
                    {opp.location} ({opp.distance})
                  </span>
                </div>

                <p className="text-xs text-gray-500">
                  Target Produce: <strong className="text-gray-700">{opp.crop}</strong>
                </p>
              </div>

              {/* Opportunity Score Block */}
              <div className="flex items-center gap-5 bg-white p-3.5 rounded-xl border border-gray-100 shadow-2xs">
                <div className="text-right">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-700">
                    {opp.score}
                    <span className="text-xs text-gray-400 font-bold">/100</span>
                  </span>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    Opportunity Score
                  </p>
                </div>

                <div className="h-8 w-px bg-gray-200" />

                <div className="text-left">
                  <span className="text-xs text-gray-400 block">Est. Net Realization</span>
                  <span className="text-lg sm:text-xl font-black text-gray-900">
                    ₹{opp.netRealization}
                  </span>
                  <span className="text-xs text-gray-500"> / quintal</span>
                </div>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 text-xs">
              <div>
                <span className="text-gray-400 block text-[11px]">Nominal Quoted Rate</span>
                <span className="font-semibold text-gray-800">₹{opp.nominalPrice}/q</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Transit & Mandi Cost</span>
                <span className="font-semibold text-red-600">-₹{opp.deductions}/q</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Buyer Reliability</span>
                <span className="font-bold text-emerald-700">{opp.reliability}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">Payment Settlement</span>
                <span className="font-semibold text-gray-800">{opp.payment}</span>
              </div>
            </div>

            {/* Why This Option Explanation & Action */}
            <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-gray-600 flex items-center gap-1.5">
                <Info size={14} className="text-emerald-600 flex-shrink-0" />
                <span>{opp.reason}</span>
              </p>

              <Link to="/buyers">
                <Button size="sm" variant={opp.recommended ? "primary" : "outline"} icon={ArrowRight}>
                  Connect with Buyer
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Opportunities;