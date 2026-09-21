import {
  TrendingUp,
  Users,
  FileCheck,
  Truck,
  Award,
  ShieldCheck,
} from "lucide-react";

export function BenefitsSection() {
  const benefits = [
    {
      icon: TrendingUp,
      title: "Fair Price Discovery",
      description:
        "Transparent APMC mandi modal rates and regional price spread indicators ensure competitive market pricing without hidden deductions.",
    },
    {
      icon: Users,
      title: "Direct Trade Linkage",
      description:
        "Connect growers and farmer cooperatives directly with verified buyers, eliminating informal multi-tier commission agent chains.",
    },
    {
      icon: FileCheck,
      title: "Binding Digital Contracts",
      description:
        "Formalized transaction agreements with clearly documented quantity, price, delivery timelines, and defect tolerance terms.",
    },
    {
      icon: Truck,
      title: "5-Stage Milestone Tracking",
      description:
        "End-to-end visibility from listing creation, offer exchange, and contract signing through transit status to final delivery.",
    },
    {
      icon: Award,
      title: "Quality Grade Transparency",
      description:
        "Standardized quality specifications (Grade A/B/C) ensure both farmer and buyer align on physical crop standards before transit.",
    },
    {
      icon: ShieldCheck,
      title: "Dedicated Dispute Support",
      description:
        "Integrated mediation workflow and platform dispute resolution for weight variations, transit delays, or specification mismatch.",
    },
  ];

  return (
    <section
      id="benefits"
      className="py-14 sm:py-18 bg-stone-50/60 border-b border-stone-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full">
            SYSTEMIC ADVANTAGES
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-950 tracking-tight mt-3">
            Built to Solve Real Agri-Trade Inefficiencies
          </h2>
          <p className="text-sm text-stone-600 mt-2">
            Engineered to overcome informal middleman exploitation, price opacity, and contract uncertainty.
          </p>
        </div>

        {/* Compact 3 x 2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto text-left">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center justify-center mb-4">
                    <Icon size={18} />
                  </div>
                  <h3 className="text-base font-bold text-stone-900 mb-1.5">
                    {b.title}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {b.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default BenefitsSection;
