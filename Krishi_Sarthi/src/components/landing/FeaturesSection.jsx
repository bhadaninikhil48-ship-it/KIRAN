import {
  TrendingUp,
  Users,
  ShieldCheck,
  FileCheck,
  Truck,
  MessageSquare,
  Sparkles,
  Award,
} from "lucide-react";

export function FeaturesSection() {
  const capabilities = [
    {
      icon: TrendingUp,
      title: "Mandi Market Intelligence",
      description:
        "Access APMC mandi modal rates, price spreads, and historical trends across key agricultural markets to inform selling and purchasing decisions.",
      color: "emerald",
    },
    {
      icon: Users,
      title: "Direct Trade Linkage",
      description:
        "Connect growers and farmer cooperatives directly with verified institutional buyers, bypassing informal commission agent networks.",
      color: "stone",
    },
    {
      icon: Award,
      title: "Standardized Quality Grading",
      description:
        "Classify produce by verified grades (Grade A, B, C) and clear specifications, ensuring both parties align on quality before contracting.",
      color: "amber",
    },
    {
      icon: MessageSquare,
      title: "Digital Offers & Counter-Bidding",
      description:
        "Exchange formal trade proposals and engage in transparent counter-negotiation over price, quantity, and delivery deadlines.",
      color: "emerald",
    },
    {
      icon: FileCheck,
      title: "Formal Digital Contracts",
      description:
        "Automatically generate binding digital contracts specifying agreed rates, quality benchmarks, delivery windows, and trade obligations.",
      color: "stone",
    },
    {
      icon: Truck,
      title: "Fulfillment & Milestone Tracking",
      description:
        "Track consignment progression across critical fulfillment milestones: dispatch preparation, transit updates, and final warehouse arrival.",
      color: "amber",
    },
  ];

  return (
    <section
      id="features"
      className="py-16 sm:py-24 bg-white border-b border-stone-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles size={14} />
            <span>Platform Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight font-serif">
            Key Capabilities of the KIRAN Platform
          </h2>
          <p className="mt-3 text-base sm:text-lg text-stone-600 leading-relaxed">
            Built from the ground up to bring structure, transparency, and contractual certainty to agricultural commerce.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <div
                key={idx}
                className="p-6 sm:p-7 rounded-2xl bg-stone-50 border border-stone-200/90 hover:border-emerald-300 hover:bg-white transition-all shadow-2xs hover:shadow-md text-left flex flex-col justify-between"
              >
                <div>
                  <div className="h-11 w-11 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center mb-5 border border-emerald-200/60 shadow-2xs">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-stone-900 font-serif mb-2">
                    {cap.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {cap.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-stone-200/60 flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
                  <ShieldCheck size={14} className="text-emerald-700" />
                  <span>Built-in Platform Feature</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
