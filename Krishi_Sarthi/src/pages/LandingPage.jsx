import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Users,
  ShoppingBasket,
  FileText,
  Truck,
  ReceiptText,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  MapPin,
  Leaf,
  Scale,
  Clock,
  HelpCircle,
  Smartphone,
} from "lucide-react";
import sihLogo from "../assets/Kiran.png";
import heroImg from "../assets/landing/hero.jpg";
import farmerImg from "../assets/landing/farmer.jpg";
import fpoImg from "../assets/landing/fpo.jpg";
import buyerImg from "../assets/landing/buyer.jpg";
import { CropImage } from "../components/ui/CropImage";

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Participant details matching real application features
  const participants = [
    {
      id: "farmer",
      title: "Farmers & Producers",
      roleLabel: "Agricultural Producers",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      accentBorder: "hover:border-emerald-400",
      image: farmerImg,
      imageAlt: "Indian farmer working in an agricultural field with modern equipment",
      headline: "List harvest produce, discover mandi price trends & receive verified buyer bids directly.",
      features: [
        "Direct produce listings with custom volume and quality grades",
        "Real-time mandi rate discovery and regional price intelligence",
        "Direct buyer bids and counter-proposal negotiations",
        "Legally binding digital contracts with agreed price guarantees",
      ],
      ctaText: "Get Started as Farmer",
      ctaRole: "farmer",
    },
    {
      id: "fpo",
      title: "Farmer Producer Organizations",
      roleLabel: "Cooperatives & Collectives",
      badgeColor: "bg-teal-50 text-teal-800 border-teal-200",
      accentBorder: "hover:border-teal-400",
      image: fpoImg,
      imageAlt: "Indian farmers working together as an agricultural cooperative in the field",
      headline: "Aggregate member harvest supply and connect collective volume directly to institutional buyers.",
      features: [
        "Produce aggregation across member farmers for higher lot volumes",
        "Strengthened collective bargaining power for premium prices",
        "Direct access to enterprise & institutional buyer requirements",
        "Single-window fulfillment and dispatched consignment tracking",
      ],
      ctaText: "Get Started as FPO",
      ctaRole: "fpo",
    },
    {
      id: "buyer",
      title: "Institutional Buyers",
      roleLabel: "Agri-Business & Processors",
      badgeColor: "bg-blue-50 text-blue-800 border-blue-200",
      accentBorder: "hover:border-blue-400",
      image: buyerImg,
      imageAlt: "Agricultural procurement professional and wholesale fresh produce crates",
      headline: "Publish crop procurement demand, review farmer bids, and enforce transparent digital supply contracts.",
      features: [
        "Post specific crop demand with grade, required volume, and price ceiling",
        "Receive direct lot proposals from regional farmers and FPOs",
        "Multi-round interactive counter-offer price negotiations",
        "5-stage contract and delivery tracking from farmgate to warehouse",
      ],
      ctaText: "Get Started as Buyer",
      ctaRole: "buyer",
    },
  ];

  // 7-step real application workflow
  const workflowSteps = [
    {
      step: "01",
      title: "Publish Demand or Crop Lots",
      desc: "Buyers post specific procurement requirements (crop, grade, volume, ceiling rate), or farmers list ready harvest produce lots.",
      icon: ShoppingBasket,
      tag: "Exchange Entry",
    },
    {
      step: "02",
      title: "Market Intelligence & Rate Discovery",
      desc: "Farmers explore prevailing mandi price benchmarks and open buyer demand to discover competitive market rates.",
      icon: TrendingUp,
      tag: "Price Discovery",
    },
    {
      step: "03",
      title: "Direct Offer Submission",
      desc: "Growers submit structured lot bids against buyer requirements with stated rates, volumes, quality grade, and dispatch notes.",
      icon: FileText,
      tag: "Direct Bidding",
    },
    {
      step: "04",
      title: "Multi-Round Digital Negotiation",
      desc: "Buyers and farmers engage in real-time counter-proposals to mutually agree on final price per quintal and delivery terms.",
      icon: Scale,
      tag: "Transparent Terms",
    },
    {
      step: "05",
      title: "Digital Contract Execution",
      desc: "Once an offer is accepted, the platform instantly generates a binding digital contract with fixed rates and specs.",
      icon: ShieldCheck,
      tag: "Legal Security",
    },
    {
      step: "06",
      title: "5-Stage Fulfillment Tracker",
      desc: "Both parties monitor fulfillment across 5 clear milestones: Accepted, Confirmed, Fulfillment, Delivery, and Settlement.",
      icon: Truck,
      tag: "Full Visibility",
    },
    {
      step: "07",
      title: "Delivery & Payment Settlement",
      desc: "Consignment delivery verification is recorded, facilitating transparent payment settlement without hidden fees.",
      icon: ReceiptText,
      tag: "Completed Deal",
    },
  ];

  // Key platform benefits
  const keyBenefits = [
    {
      title: "Fair Price Discovery",
      desc: "Empowers growers with real-time mandi rate intelligence to eliminate distress selling and ensure competitive farmgate rates.",
      icon: TrendingUp,
      color: "emerald",
    },
    {
      title: "Direct Trade Linkage",
      desc: "Bypasses unnecessary intermediaries to connect independent farmers and FPOs directly with verified commercial buyers.",
      icon: Users,
      color: "blue",
    },
    {
      title: "Binding Digital Contracts",
      desc: "Every accepted agreement is formalized with agreed price, volume, and quality grade parameters locked into a digital deed.",
      icon: ShieldCheck,
      color: "emerald",
    },
    {
      title: "5-Stage Milestone Tracking",
      desc: "End-to-end milestone visibility from initial bid acceptance and dispatch to arrival verification and final payment.",
      icon: Clock,
      color: "amber",
    },
    {
      title: "Quality Grade Transparency",
      desc: "Standardized quality classifications (Grade A, Grade B) prevent arbitrary post-harvest rejections at the delivery hub.",
      icon: CheckCircle2,
      color: "teal",
    },
    {
      title: "Dedicated Dispute Support",
      desc: "Integrated platform support and dispute mediation mechanisms provide confidence and security for all trading parties.",
      icon: HelpCircle,
      color: "purple",
    },
  ];

  // Representative agricultural produce showcase
  const sampleCrops = [
    { name: "Wheat", category: "Cereals" },
    { name: "Potato", category: "Vegetables" },
    { name: "Onion", category: "Vegetables" },
    { name: "Tomato", category: "Vegetables" },
    { name: "Soybean", category: "Oilseeds" },
    { name: "Garlic", category: "Spices" },
    { name: "Carrot", category: "Vegetables" },
    { name: "Banana", category: "Fruits" },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-emerald-100 selection:text-emerald-900 font-sans">
      {/* 1. Public Sticky Navigation Bar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-xs border-b border-gray-200/80 py-3"
            : "bg-white/80 backdrop-blur-xs border-b border-gray-100 py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo & Platform Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 border border-emerald-200/80 p-1 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform duration-200">
              <img
                src={sihLogo}
                alt="KIRAN Platform Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-extrabold text-emerald-900 tracking-tight">
                  KIRAN
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100/70 text-emerald-800 border border-emerald-200/60 hidden sm:inline-block">
                  Agri Exchange
                </span>
              </div>
              <p className="text-[10px] text-gray-500 font-medium tracking-tight hidden sm:block">
                Kishan Intelligent Rate Analytics Network
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-semibold text-gray-600">
            <button
              onClick={() => scrollToSection("ecosystem")}
              className="hover:text-emerald-700 transition-colors cursor-pointer"
            >
              Ecosystem
            </button>
            <button
              onClick={() => scrollToSection("participants")}
              className="hover:text-emerald-700 transition-colors cursor-pointer"
            >
              Who Uses KIRAN
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="hover:text-emerald-700 transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("benefits")}
              className="hover:text-emerald-700 transition-colors cursor-pointer"
            >
              Benefits
            </button>
            <button
              onClick={() => scrollToSection("produce")}
              className="hover:text-emerald-700 transition-colors cursor-pointer"
            >
              Produce
            </button>
          </nav>

          {/* Desktop Direct Auth Links */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-bold text-gray-700 hover:text-emerald-700 hover:bg-emerald-50/60 rounded-xl transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-95 shadow-sm hover:shadow rounded-xl transition-all flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle Navigation Menu"
            className="sm:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden px-4 pt-3 pb-5 bg-white border-b border-gray-200 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col space-y-2 text-sm font-semibold text-gray-700">
              <button
                onClick={() => scrollToSection("ecosystem")}
                className="text-left py-2 px-3 rounded-lg hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
              >
                Ecosystem
              </button>
              <button
                onClick={() => scrollToSection("participants")}
                className="text-left py-2 px-3 rounded-lg hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
              >
                Who Uses KIRAN
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-left py-2 px-3 rounded-lg hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection("benefits")}
                className="text-left py-2 px-3 rounded-lg hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
              >
                Benefits & Trust
              </button>
              <button
                onClick={() => scrollToSection("produce")}
                className="text-left py-2 px-3 rounded-lg hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
              >
                Commodities Supported
              </button>
            </div>
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
              <Link
                to="/login"
                className="w-full text-center py-2.5 text-sm font-bold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="w-full text-center py-2.5 text-sm font-bold text-white bg-emerald-700 rounded-xl hover:bg-emerald-800 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Get Started Free</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section
        id="hero"
        className="pt-28 sm:pt-36 pb-16 sm:pb-24 bg-gradient-to-b from-emerald-50/70 via-white to-white relative overflow-hidden"
      >
        {/* Soft Background Accent Glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-emerald-200/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Hero Left Column: Strategic Value Copy */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-900 text-xs font-bold tracking-wide">
                <Leaf size={14} className="text-emerald-600 shrink-0" />
                <span>Modern Indian AgriTech Trade Infrastructure</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-gray-950 tracking-tight leading-[1.12]">
                Connecting{" "}
                <span className="text-emerald-700 underline decoration-emerald-300 decoration-wavy decoration-2 underline-offset-4">
                  Farmers, FPOs
                </span>{" "}
                & Direct Buyers for Smarter Agricultural Trade
              </h1>

              {/* Supporting Value Proposition */}
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
                KIRAN unites agricultural producers, collective FPOs, and verified
                institutional buyers on a transparent digital exchange. Discover
                real-time mandi prices, submit competitive proposals, negotiate
                counter-offers, and enforce binding digital contracts with end-to-end
                fulfillment tracking.
              </p>

              {/* Primary Call-To-Action Buttons */}
              <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-base shadow-sm hover:shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <span>Get Started Free</span>
                  <ArrowRight size={18} />
                </Link>

                <a
                  href="https://github.com/bhadaninikhil48-ship-it/KIRAN/releases/download/v1.0.0/app-release.apk"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-emerald-50/60 border border-emerald-300/80 text-gray-900 font-bold hover:border-emerald-400 shadow-2xs hover:shadow-sm active:scale-98 transition-all flex items-center justify-center gap-2.5"
                >
                  <Smartphone size={20} className="text-emerald-700 shrink-0" />
                  <div className="text-left">
                    <span className="block text-sm font-extrabold text-gray-950 leading-tight">
                      Download KIRAN App
                    </span>
                    <span className="block text-[11px] font-medium text-emerald-700 leading-tight">
                      Available for Android
                    </span>
                  </div>
                </a>

                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 font-bold text-base hover:border-gray-300 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Explore Workflow</span>
                  <ChevronRight size={18} className="text-gray-400" />
                </button>
              </div>

              {/* Verified Platform Anchors */}
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-gray-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Verified Participants</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Binding Contracts</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>5-Stage Tracking</span>
                </div>
              </div>
            </div>

            {/* Hero Right Column: Authentic Agricultural Visual with Contextual Overlays */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Hero Photograph */}
                <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-200/90 bg-gray-100 aspect-4/3 relative group">
                  <img
                    src={heroImg}
                    alt="Indian agricultural partners agreeing on agricultural trade in a golden wheat field"
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-transparent to-transparent pointer-events-none" />

                  {/* Photo Caption Badge */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                      <Sparkles size={14} />
                      <span>Direct Farmgate-to-Enterprise Linkage</span>
                    </div>
                    <p className="text-sm font-bold mt-0.5">
                      Transparent agreements across the agricultural value chain
                    </p>
                  </div>
                </div>

                {/* Floating Trust Card Top-Right */}
                <div className="absolute -top-4 -right-2 sm:-right-4 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200/80 p-3.5 shadow-lg flex items-center gap-3 animate-in fade-in duration-300">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 block uppercase tracking-wide">
                      Trade Protection
                    </span>
                    <span className="text-xs font-extrabold text-gray-900">
                      Digital Legal Contracts
                    </span>
                  </div>
                </div>

                {/* Floating Metrics Card Bottom-Left */}
                <div className="absolute -bottom-4 -left-2 sm:-left-4 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200/80 p-3.5 shadow-lg flex items-center gap-3 animate-in fade-in duration-300">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Scale size={20} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 block uppercase tracking-wide">
                      Price Transparency
                    </span>
                    <span className="text-xs font-extrabold text-gray-900">
                      Real Mandi Benchmarks
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Ecosystem Relationship Section */}
      <section
        id="ecosystem"
        className="py-16 sm:py-24 bg-gray-50/70 border-t border-b border-gray-200/80"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-extrabold text-emerald-700 tracking-wider uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
              The Trade Ecosystem
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mt-3 tracking-tight">
              How Farmer, FPO & Buyer Connect
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-3 leading-relaxed">
              KIRAN replaces fragmented middlemen with an open, direct exchange that
              empowers individual growers, enables collective aggregation, and
              fulfills enterprise procurement requirements.
            </p>
          </div>

          {/* Ecosystem Relationship Composition */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Step 1: Farmer */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between hover:border-emerald-300 hover:shadow-sm transition-all duration-200 group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Leaf size={24} />
                  </div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Origin
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                  1. Individual Farmers
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                  Harvest produce is graded and listed with precise quantity,
                  acceptable price benchmarks, and preferred delivery hubs.
                </p>

                <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span>Produce Listing & Mandi Rates</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-medium text-gray-400">
                <span>Supply Generation</span>
                <ArrowRight size={14} className="text-emerald-600 hidden md:block" />
              </div>
            </div>

            {/* Step 2: FPO Aggregation */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between hover:border-teal-300 hover:shadow-sm transition-all duration-200 group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200/80 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Users size={24} />
                  </div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Aggregation
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                  2. FPO Collective Supply
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                  Farmer Producer Organizations aggregate produce across member
                  farms to fulfill large industrial lots and gain superior bargaining.
                </p>

                <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-teal-800 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-teal-600 shrink-0" />
                  <span>Bulk Aggregation & Better Margins</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-medium text-gray-400">
                <span>Consolidated Supply</span>
                <ArrowRight size={14} className="text-teal-600 hidden md:block" />
              </div>
            </div>

            {/* Step 3: Direct Institutional Buyer */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between hover:border-blue-300 hover:shadow-sm transition-all duration-200 group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <ShoppingBasket size={24} />
                  </div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Procurement
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                  3. Institutional Buyers
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                  Food processors, retail buyers, and exporters post required
                  quantities, negotiate rates with sellers, and confirm legal deeds.
                </p>

                <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-blue-800 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                  <span>Transparent Bidding & Contract Enforcement</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-medium text-gray-400">
                <span>Contract & Settlement</span>
                <CheckCircle2 size={14} className="text-blue-600" />
              </div>
            </div>
          </div>

          {/* Central Marketplace Resolution Banner */}
          <div className="mt-8 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-bold tracking-wider text-emerald-300 uppercase">
                The Core Engine
              </span>
              <h4 className="text-lg sm:text-2xl font-extrabold tracking-tight">
                KIRAN Digital Contract & Fulfillment Engine
              </h4>
              <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl">
                Resolves negotiations into binding digital contracts, tracks
                transit stages, and ensures guaranteed clarity for every quintal traded.
              </p>
            </div>
            <Link
              to="/register"
              className="px-6 py-3 bg-white text-emerald-950 font-bold rounded-xl hover:bg-emerald-50 transition-colors shrink-0 text-sm shadow-sm"
            >
              Join the Exchange →
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Who Uses KIRAN: Detailed Three Participant Sections */}
      <section id="participants" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-extrabold text-emerald-700 tracking-wider uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
              Platform Roles
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mt-3 tracking-tight">
              Designed for the Entire Agricultural Value Chain
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-3 leading-relaxed">
              Every participant enjoys a role-tailored dashboard equipped with real
              data, digital negotiation capabilities, and transparent contract execution.
            </p>
          </div>

          {/* 3 Participant Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {participants.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between ${item.accentBorder} group`}
              >
                <div>
                  {/* Participant Realistic Photography */}
                  <div className="relative h-56 sm:h-64 overflow-hidden bg-gray-100">
                    <img
                      src={item.image}
                      alt={item.imageAlt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-gray-950/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${item.badgeColor}`}
                      >
                        {item.roleLabel}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1.5 tracking-tight">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 sm:p-7 space-y-4">
                    <p className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed italic">
                      "{item.headline}"
                    </p>

                    <div className="space-y-2.5 pt-2 border-t border-gray-100 text-xs text-gray-600">
                      {item.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle2
                            size={15}
                            className="text-emerald-600 shrink-0 mt-0.5"
                          />
                          <span className="leading-snug">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Link */}
                <div className="p-6 sm:p-7 pt-0">
                  <Link
                    to={`/register?role=${item.ctaRole || "farmer"}`}
                    state={{ role: item.ctaRole || "farmer" }}
                    className="w-full py-3 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 text-gray-800 hover:text-emerald-800 font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1.5"
                  >
                    <span>{item.ctaText}</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. How KIRAN Works (The 7-Step Real Application Flow) */}
      <section
        id="how-it-works"
        className="py-16 sm:py-24 bg-gray-50/70 border-t border-b border-gray-200/80"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-extrabold text-emerald-700 tracking-wider uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
              Clear & Transparent Flow
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mt-3 tracking-tight">
              How KIRAN Works
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-3 leading-relaxed">
              From first listing to final delivery settlement, our digital workflow
              eliminates confusion and guarantees accountability at each milestone.
            </p>
          </div>

          {/* Workflow Sequence */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {workflowSteps.slice(0, 4).map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:border-emerald-300 hover:shadow-sm transition-all duration-200 relative group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-black text-emerald-600/80">
                        {step.step}
                      </span>
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                        {step.tag}
                      </span>
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <Icon size={20} />
                    </div>

                    <h4 className="text-base font-bold text-gray-900 tracking-tight">
                      {step.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Second Row of 3 Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
            {workflowSteps.slice(4, 7).map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:border-emerald-300 hover:shadow-sm transition-all duration-200 relative group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-black text-emerald-600/80">
                        {step.step}
                      </span>
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                        {step.tag}
                      </span>
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <Icon size={20} />
                    </div>

                    <h4 className="text-base font-bold text-gray-900 tracking-tight">
                      {step.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Key Benefits Section */}
      <section id="benefits" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-extrabold text-emerald-700 tracking-wider uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
              Why KIRAN
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mt-3 tracking-tight">
              Built to Solve Real Agri-Trade Inefficiencies
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-3 leading-relaxed">
              We focus on genuine marketplace mechanics—better price visibility,
              direct communication, and contract security.
            </p>
          </div>

          {/* Benefit Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {keyBenefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-gray-200/90 p-6 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all duration-200 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                    {benefit.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-2 leading-relaxed">
                    {benefit.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Strategic Agricultural Produce Showcase */}
      <section
        id="produce"
        className="py-16 sm:py-20 bg-gray-50/70 border-t border-b border-gray-200/80"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-extrabold text-emerald-700 tracking-wider uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
              Commodity Coverage
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-3 tracking-tight">
              Active Commodities Traded Across KIRAN
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-2">
              Our automated rate intelligence tracks grains, fruits, vegetables,
              and cash crops across regional mandis.
            </p>
          </div>

          {/* Produce Grid matching Reference Image 2 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
            {sampleCrops.map((crop, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-200/90 p-2 sm:p-2.5 pb-3 flex flex-col items-center text-center shadow-2xs hover:shadow-md hover:-translate-y-1 hover:border-emerald-300 transition-all duration-200 group cursor-pointer"
              >
                <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-50 mb-2 sm:mb-2.5">
                  <CropImage
                    cropName={crop.name}
                    size="full"
                    className="w-full h-full rounded-xl border-0 shadow-none"
                  />
                </div>
                <span className="text-xs sm:text-sm font-bold text-gray-900 truncate w-full">
                  {crop.name}
                </span>
                <span className="text-[10px] sm:text-xs text-gray-500 font-medium truncate w-full mt-0.5">
                  {crop.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Trust & Platform Security Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-emerald-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-emerald-800 relative overflow-hidden">
            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-700 text-emerald-300 text-xs font-bold mb-4">
                <ShieldCheck size={15} />
                <span>Trade Safety & Verification</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Authentic Verification & Transparent Trade Enforcement
              </h2>
              <p className="text-sm sm:text-base text-emerald-100/80 mt-3 leading-relaxed">
                KIRAN protects participants through authentic profile credentials,
                timestamped audit logs of all price proposals, and legally enforceable
                digital deeds that guarantee clear delivery specifications.
              </p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-emerald-800/80 text-xs sm:text-sm">
                <div>
                  <strong className="block font-bold text-white text-base">
                    Verified Sellers
                  </strong>
                  <span className="text-emerald-200/70 text-xs">
                    Validated farmer and FPO credentials with verified farmgate locations.
                  </span>
                </div>
                <div>
                  <strong className="block font-bold text-white text-base">
                    Audit-Logged Bids
                  </strong>
                  <span className="text-emerald-200/70 text-xs">
                    Every counter-proposal and acceptance timestamped for full clarity.
                  </span>
                </div>
                <div>
                  <strong className="block font-bold text-white text-base">
                    Dispute Mediation
                  </strong>
                  <span className="text-emerald-200/70 text-xs">
                    Integrated support portal to review delivery specs and quality disputes.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Final Call to Action (CTA) & Role Selection */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-emerald-50/50 to-emerald-100/40 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-xs font-extrabold text-emerald-800 tracking-wider uppercase bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
            Join the Network
          </span>

          <h2 className="text-3xl sm:text-5xl font-black text-gray-950 tracking-tight">
            Ready to Make Agricultural Trade Smarter?
          </h2>

          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Create your account today. Whether you are selling harvests, aggregating
            collective supply, or procuring wholesale commodities, KIRAN provides the
            digital infrastructure to trade with confidence.
          </p>

          {/* Quick Role Selection Buttons linking to existing Register page */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register?role=farmer"
              state={{ role: "farmer" }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-sm hover:shadow active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <span>Register as Farmer</span>
              <ArrowRight size={15} />
            </Link>

            <Link
              to="/register?role=fpo"
              state={{ role: "fpo" }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-sm hover:shadow active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <span>Register as FPO</span>
              <ArrowRight size={15} />
            </Link>

            <Link
              to="/register?role=buyer"
              state={{ role: "buyer" }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-sm hover:shadow active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <span>Register as Buyer</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="pt-4 text-xs sm:text-sm text-gray-500">
            <span>Already registered on KIRAN? </span>
            <Link
              to="/login"
              className="font-bold text-emerald-700 hover:text-emerald-900 underline underline-offset-2"
            >
              Sign In to Your Dashboard →
            </Link>
          </div>
        </div>
      </section>

      {/* 10. Public Footer */}
      <footer className="bg-gray-950 text-gray-400 py-12 sm:py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            {/* Col 1: Platform Overview */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 p-1 flex items-center justify-center">
                  <img
                    src={sihLogo}
                    alt="KIRAN Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-xl font-black text-white tracking-tight">
                  KIRAN
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Kishan Intelligent Rate Analytics Network. Empowering Indian
                agriculture through direct market linkages, digital negotiations,
                and transparent contracts.
              </p>
            </div>

            {/* Col 2: Navigation Links */}
            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                Platform
              </h5>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    onClick={() => scrollToSection("ecosystem")}
                    className="hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    Trade Ecosystem
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("participants")}
                    className="hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    Participant Roles
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("how-it-works")}
                    className="hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    How KIRAN Works
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("benefits")}
                    className="hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    Benefits
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Role Portals */}
            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                Portals
              </h5>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/login" className="hover:text-emerald-400 transition-colors">
                    Farmer Portal
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-emerald-400 transition-colors">
                    FPO Collective Exchange
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-emerald-400 transition-colors">
                    Institutional Buyer Center
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-emerald-400 transition-colors">
                    Market Intelligence
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Trust & Support */}
            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                Trust & Support
              </h5>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/support" className="hover:text-emerald-400 transition-colors">
                    Grievance & Support Desk
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-emerald-400 transition-colors">
                    Digital Contracts
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-emerald-400 transition-colors">
                    Create Free Account
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="pt-8 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <p>© {new Date().getFullYear()} KIRAN (Kishan Intelligent Rate Analytics Network). All rights reserved.</p>
            <p className="flex items-center gap-1.5">
              <span>Modern Agricultural Trade Platform</span>
              <span>•</span>
              <span className="text-emerald-500 font-semibold">KrishiSarthi</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
