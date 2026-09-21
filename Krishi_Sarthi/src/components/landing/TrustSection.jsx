import { ShieldCheck, FileCheck, Scale } from "lucide-react";

export function TrustSection() {
  const pillars = [
    {
      icon: ShieldCheck,
      title: "Verified Sellers",
      description:
        "Producers and FPOs are onboarded with location and crop credential verification, ensuring authentic farm-gate origin.",
    },
    {
      icon: FileCheck,
      title: "Audit-Logged Bids",
      description:
        "Every trade proposal, counter-offer, and agreed contract term is permanently timestamped with a transparent audit trail.",
    },
    {
      icon: Scale,
      title: "Dispute Mediation",
      description:
        "Structured platform mediation protocols and objective quality verification protect both parties if trade discrepancies arise.",
    },
  ];

  return (
    <section className="py-14 sm:py-18 bg-white border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Large Dark Green Rounded Rectangle */}
        <div className="rounded-3xl bg-emerald-950 text-white p-8 sm:p-12 lg:p-14 shadow-lg border border-emerald-900 text-center max-w-6xl mx-auto relative overflow-hidden">
          {/* Subtle background glow */}
          <div
            className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-800/20 blur-3xl pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-3xl mx-auto">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-900/80 border border-emerald-800 px-3 py-1 rounded-full inline-block mb-4">
              Trade Safety & Verification
            </span>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Authentic Verification & Transparent Trade Enforcement
            </h2>

            <p className="text-xs sm:text-sm text-emerald-200/80 mt-3 leading-relaxed max-w-2xl mx-auto">
              KIRAN provides the digital trust layer necessary for high-value agricultural commerce between remote producers and institutional buyers.
            </p>

            {/* Three Compact Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-10 sm:mt-12 text-left">
              {pillars.map((pillar, idx) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-emerald-900/40 border border-emerald-800/80 backdrop-blur-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-9 w-9 rounded-xl bg-emerald-800/80 text-emerald-300 border border-emerald-700/80 flex items-center justify-center mb-4">
                        <Icon size={18} />
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-white mb-1.5">
                        {pillar.title}
                      </h3>
                      <p className="text-xs text-emerald-200/80 leading-relaxed">
                        {pillar.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TrustSection;
