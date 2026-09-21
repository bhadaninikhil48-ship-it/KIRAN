import { Link } from "react-router-dom";
import {
  Wheat,
  Users,
  Building2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export function EcosystemSection() {
  const cards = [
    {
      num: "01",
      icon: Wheat,
      category: "PRIMARY PRODUCER",
      title: "Individual Farmers",
      description:
        "List graded produce, review verified APMC mandi benchmarks, receive direct purchase offers, and sign digital contracts.",
      benefit: "Fair gate prices & zero informal commission.",
      tag: "Direct Trade Link",
      color: "emerald",
    },
    {
      num: "02",
      icon: Users,
      category: "AGGREGATION CLUSTER",
      title: "FPO Collective Supply",
      description:
        "Aggregate member harvest lots into high-volume commercial consignments, access institutional demand, and coordinate bulk fulfillment.",
      benefit: "Collective bargaining & scale advantage.",
      tag: "Aggregation Pathway",
      color: "emerald",
    },
    {
      num: "03",
      icon: Building2,
      category: "COMMERCIAL DEMAND",
      title: "Institutional Buyers",
      description:
        "Post procurement requirements with quality benchmarks, source directly from growers or FPOs, and track multi-stage delivery.",
      benefit: "Traceable origin & contractual assurance.",
      tag: "Direct Sourcing",
      color: "emerald",
    },
  ];

  return (
    <section
      id="ecosystem"
      className="py-14 sm:py-18 bg-white border-b border-stone-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full">
            THE TRADE ECOSYSTEM
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-950 tracking-tight mt-3">
            How Farmer, FPO & Buyer Connect
          </h2>
          <p className="text-sm text-stone-600 mt-2">
            Independent market participation with transparent, contractual trade pathways.
          </p>
        </div>

        {/* 3 Compact Ecosystem Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto mb-8">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.num}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-sm hover:border-emerald-300 transition-all text-left flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center justify-center">
                      <Icon size={18} />
                    </div>
                    <span className="text-xs font-bold text-stone-400 font-mono">
                      {card.num}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-800">
                    {card.category}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 mt-0.5 mb-2">
                    {card.title}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed mb-3">
                    {card.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px]">
                  <span className="text-stone-500 font-medium truncate">
                    {card.benefit}
                  </span>
                  <span className="shrink-0 font-semibold text-emerald-800 bg-emerald-50/80 px-2 py-0.5 rounded text-[10px]">
                    {card.tag}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Horizontal KIRAN Digital Contract & Fulfillment Engine Banner */}
        <div className="max-w-6xl mx-auto rounded-2xl bg-emerald-950 text-white p-6 sm:p-7 shadow-md border border-emerald-900 flex flex-col sm:flex-row items-center justify-between gap-5 text-left">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
                KIRAN Digital Contract & Fulfillment Engine
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-emerald-200/80 max-w-2xl leading-relaxed">
              Enforcing bilateral trade terms, quality benchmarks, transport milestones, and transparent settlement between independent producers, FPOs, and buyers.
            </p>
          </div>

          <Link
            to="/register"
            className="shrink-0 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-950 bg-white hover:bg-stone-100 px-4 py-2.5 rounded-xl shadow-2xs transition-all active:scale-[0.98]"
          >
            <span>Join the Exchange</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default EcosystemSection;
