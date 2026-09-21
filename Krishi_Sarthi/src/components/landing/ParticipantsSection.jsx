import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import farmerImg from "../../assets/landing/farmer.jpg";
import fpoImg from "../../assets/landing/fpo.jpg";
import buyerImg from "../../assets/landing/buyer.jpg";

export function ParticipantsSection() {
  const participants = [
    {
      role: "Farmer",
      title: "Farmer & Producers",
      badge: "Growers & Smallholders",
      image: farmerImg,
      alt: "Indian farmer inspecting crop quality in the field",
      description:
        "Sell produce directly to verified buyers with complete price visibility and contract security.",
      bullets: [
        "List produce with grade details",
        "Discover regional mandi prices",
        "Receive direct buyer offers",
        "Negotiate rates & sign contracts",
      ],
      ctaText: "Get Started as Farmer",
    },
    {
      role: "FPO",
      title: "Farmer Producer Organizations",
      badge: "Cooperative Clusters",
      image: fpoImg,
      alt: "Group of agricultural cooperative farmers collaborating",
      description:
        "Consolidate member supply into commercial volume lots and access high-demand corporate buyers.",
      bullets: [
        "Aggregate member produce",
        "Create bulk market lots",
        "Access institutional demand",
        "Track shared fulfillment",
      ],
      ctaText: "Get Started as FPO",
    },
    {
      role: "Buyer",
      title: "Institutional Buyers",
      badge: "Commercial Procurement",
      image: buyerImg,
      alt: "Agricultural produce wholesale sorting and procurement facility",
      description:
        "Procure verified agricultural commodities directly from growers with binding delivery milestones.",
      bullets: [
        "Post procurement requirements",
        "Review farm-direct offers",
        "Negotiate transparent rates",
        "Manage digital contracts",
      ],
      ctaText: "Get Started as Buyer",
    },
  ];

  return (
    <section
      id="participants"
      className="py-14 sm:py-18 bg-stone-50/50 border-b border-stone-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full">
            STAKEHOLDER PATHWAYS
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-950 tracking-tight mt-3">
            Designed for the Entire Agricultural Value Chain
          </h2>
          <p className="text-sm text-stone-600 mt-2">
            Tailored tools for producers, farmer producer organizations, and institutional buyers.
          </p>
        </div>

        {/* 3 Equal Participant Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {participants.map((p, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl overflow-hidden border border-stone-200/90 shadow-2xs hover:shadow-sm hover:border-emerald-300 transition-all flex flex-col text-left"
            >
              {/* Image with overlay badge (approx 160-180px height) */}
              <div className="relative h-44 sm:h-48 bg-stone-100 overflow-hidden">
                <img
                  src={p.image}
                  alt={p.alt}
                  loading="lazy"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-transparent" />
                <span className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-xs text-white px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-wide">
                  {p.badge}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-stone-950">
                    {p.title}
                  </h3>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    {p.description}
                  </p>

                  {/* Bullet points */}
                  <ul className="mt-4 space-y-2 text-xs text-stone-700">
                    {p.bullets.map((b, bIdx) => (
                      <li key={bIdx} className="flex items-center gap-2">
                        <CheckCircle2
                          size={14}
                          className="text-emerald-700 shrink-0"
                        />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom CTA */}
                <div className="pt-3 border-t border-stone-100">
                  <Link
                    to="/register"
                    className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200/80 px-3.5 py-2.5 rounded-xl transition-colors active:scale-[0.98]"
                  >
                    <span>{p.ctaText}</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ParticipantsSection;
