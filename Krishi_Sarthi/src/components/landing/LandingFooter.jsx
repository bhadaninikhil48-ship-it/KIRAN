import { Link } from "react-router-dom";
import sihLogo from "../../assets/Kiran.png";

export function LandingFooter() {
  return (
    <footer className="bg-stone-950 text-stone-300 py-10 sm:py-14 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-stone-800/80 text-left">
          {/* Column 1: Brand (spans 2 on desktop) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-white p-0.5 flex items-center justify-center shrink-0">
                <img
                  src={sihLogo}
                  alt="KIRAN Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-base font-extrabold tracking-tight text-white font-sans">
                KIRAN
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded">
                AgriTech
              </span>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              Connecting Farmers, FPOs, and Institutional Buyers through transparent Mandi intelligence, digital trade offers, counter-negotiation, and binding contracts.
            </p>

            <p className="text-[11px] text-stone-500 font-medium">
              National Agricultural Digital Infrastructure
            </p>
          </div>

          {/* Column 2: Platform Links */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-white mb-3">
              Platform
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-400">
              <li>
                <a href="#ecosystem" className="hover:text-white transition-colors">
                  Ecosystem
                </a>
              </li>
              <li>
                <a href="#participants" className="hover:text-white transition-colors">
                  Who Uses KIRAN
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#benefits" className="hover:text-white transition-colors">
                  Benefits
                </a>
              </li>
              <li>
                <a href="#produce" className="hover:text-white transition-colors">
                  Produce
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Portals */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-white mb-3">
              Portals
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-400">
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Farmer Portal
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  FPO Cluster Portal
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Buyer Procurement
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Sign In to Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Trust & Support */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-white mb-3">
              Trust & Support
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-400">
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Support & Help
                </Link>
              </li>
              <li>
                <span className="text-stone-500 cursor-default">
                  Dispute Protocols
                </span>
              </li>
              <li>
                <span className="text-stone-500 cursor-default">
                  Terms of Trade
                </span>
              </li>
              <li>
                <span className="text-stone-500 cursor-default">
                  Privacy Policy
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-500">
          <p>© 2026 KIRAN AgriTech Platform. All rights reserved.</p>
          <p>Engineered for Transparent Agricultural Trade</p>
        </div>
      </div>
    </footer>
  );
}

export default LandingFooter;
