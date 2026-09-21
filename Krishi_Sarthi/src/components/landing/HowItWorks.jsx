import {
  TrendingUp,
  Package,
  Send,
  MessageSquare,
  FileCheck,
  Truck,
  CheckCircle2,
} from "lucide-react";

export function HowItWorks() {
  const row1 = [
    {
      step: "01",
      icon: TrendingUp,
      title: "Market Intelligence",
      description:
        "Access APMC mandi modal rates, daily price trends, and transport deductions to inform your selling and buying strategy.",
    },
    {
      step: "02",
      icon: Package,
      title: "Produce & Requirement",
      description:
        "Farmers list graded produce lots; Buyers publish clear procurement specifications with quality grades and deadlines.",
    },
    {
      step: "03",
      icon: Send,
      title: "Digital Offers",
      description:
        "Submit and receive direct trade proposals specifying rates per quintal and logistics terms without broker markups.",
    },
    {
      step: "04",
      icon: MessageSquare,
      title: "Negotiation",
      description:
        "Participate in structured in-app counter-bidding until mutual consensus is achieved on pricing and dispatch dates.",
    },
  ];

  const row2 = [
    {
      step: "05",
      icon: FileCheck,
      title: "Digital Contract",
      description:
        "Formal contract generated recording agreed prices, delivery milestones, and quality standards with legal certainty.",
    },
    {
      step: "06",
      icon: Truck,
      title: "Fulfillment Tracking",
      description:
        "Monitor consignment progression across key milestones: dispatch preparation, transit updates, and warehouse arrival.",
    },
    {
      step: "07",
      icon: CheckCircle2,
      title: "Delivery & Settlement",
      description:
        "Produce inspection, weight verification, and secure payment settlement tracking with platform dispute protection.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-14 sm:py-18 bg-white border-b border-stone-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full">
            CLEAR & TRANSPARENT FLOW
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-950 tracking-tight mt-3">
            How KIRAN Works
          </h2>
          <p className="text-sm text-stone-600 mt-2">
            A structured 7-stage agricultural trade cycle from discovery to verified settlement.
          </p>
        </div>

        {/* 7 Cards Layout: Exactly 4 on Row 1, 3 on Row 2 (Desktop) */}
        <div className="max-w-6xl mx-auto">
          {/* Row 1: 4 cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {row1.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-sm hover:border-emerald-300 hover:-translate-y-0.5 transition-all text-left flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center justify-center">
                        <Icon size={16} />
                      </div>
                      <span className="text-xs font-bold text-stone-400 font-mono">
                        {item.step}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-stone-900 mb-1.5">
                      {item.title}
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Row 2: 3 cards centered */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mt-4 sm:mt-5 max-w-5xl mx-auto">
            {row2.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-sm hover:border-emerald-300 hover:-translate-y-0.5 transition-all text-left flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center justify-center">
                        <Icon size={16} />
                      </div>
                      <span className="text-xs font-bold text-stone-400 font-mono">
                        {item.step}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-stone-900 mb-1.5">
                      {item.title}
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
