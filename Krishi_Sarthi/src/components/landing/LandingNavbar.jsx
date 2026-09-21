import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import sihLogo from "../../assets/Kiran.png";

export function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: "Ecosystem", href: "#ecosystem" },
    { label: "Who Uses KIRAN", href: "#participants" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Benefits", href: "#benefits" },
    { label: "Produce", href: "#produce" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-xs border-b border-stone-200/80 py-2.5"
          : "bg-white/90 backdrop-blur-xs py-3.5 border-b border-stone-200/50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <a
            href="/"
            className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-emerald-600 rounded-lg p-0.5"
          >
            <div className="h-8 w-8 rounded-lg bg-white shadow-2xs border border-stone-200/80 flex items-center justify-center p-0.5 shrink-0">
              <img
                src={sihLogo}
                alt="KIRAN Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-extrabold tracking-tight text-stone-950 font-sans">
                KIRAN
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-1.5 py-0.5 rounded-full">
                AgriTech
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav
            aria-label="Main Navigation"
            className="hidden md:flex items-center gap-6 lg:gap-7"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[13px] font-medium text-stone-600 hover:text-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-600 rounded px-1 py-0.5"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-[13px] font-semibold text-stone-700 hover:text-emerald-800 px-3 py-1.5 rounded-lg hover:bg-stone-50 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 px-4 py-1.5 rounded-full shadow-2xs transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
            >
              <span>Get Started</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open navigation menu"}
              className="p-1.5 rounded-lg text-stone-700 hover:text-emerald-800 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[57px] z-50 bg-stone-900/40 backdrop-blur-xs md:hidden">
          <div className="bg-white border-b border-stone-200 p-5 shadow-xl space-y-4">
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-stone-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="pt-3 border-t border-stone-100 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 px-3 rounded-lg font-semibold text-stone-700 border border-stone-200 hover:bg-stone-50 text-xs"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-full font-semibold text-white bg-emerald-800 hover:bg-emerald-900 text-xs shadow-2xs"
              >
                <span>Get Started</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default LandingNavbar;
