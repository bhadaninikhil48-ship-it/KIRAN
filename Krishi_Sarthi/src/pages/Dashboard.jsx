import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Mic,
  TrendingUp,
  Store,
  ShoppingBasket,
  Users,
  ReceiptText,
  ArrowUpRight,
  ShieldCheck,
  MapPin,
  Sparkles,
  Volume2,
  ChevronRight,
} from "lucide-react";
import { animateStagger, animateCounter } from "../utils/animations";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

export function Dashboard() {
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState("hi-IN");
  const [voiceStatus, setVoiceStatus] = useState("Ready"); // Ready, Listening..., Processing..., Response Ready
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceResponse, setVoiceResponse] = useState("");

  const scoreRef = useRef(null);
  const cardsContainerRef = useRef(null);
  const actionsRef = useRef(null);

  // GSAP entrance and score animation
  useEffect(() => {
    if (cardsContainerRef.current) {
      const cards = cardsContainerRef.current.querySelectorAll(".dashboard-card");
      animateStagger(cards, { delay: 0.1, duration: 0.45 });
    }

    if (scoreRef.current) {
      animateCounter(scoreRef.current, 91, 1.2);
    }
  }, []);

  const startVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setVoiceStatus("Listening...");
    setIsListening(true);
    setVoiceTranscript("");
    setVoiceResponse("");

    recognition.onstart = () => {
      setVoiceStatus("Listening...");
    };

    recognition.onspeechstart = () => {
      setVoiceStatus("Processing...");
    };

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript.toLowerCase();
      setVoiceTranscript(event.results[0][0].transcript);
      setVoiceStatus("Response Ready");

      let message;
      if (text.includes("tomato") || text.includes("टमाटर") || text.includes("tamatar")) {
        message = "Today's Tomato modal price is ₹2,750 per quintal with High Demand in Indore.";
      } else if (text.includes("onion") || text.includes("प्याज") || text.includes("pyaz")) {
        message = "Today's Onion modal price is ₹1,850 per quintal in Nashik APMC.";
      } else if (text.includes("potato") || text.includes("आलू") || text.includes("aloo")) {
        message = "Today's Potato modal price is ₹1,420 per quintal in Agra APMC.";
      } else if (text.includes("wheat") || text.includes("गेहूं") || text.includes("gehun")) {
        message = "Today's Wheat MSP benchmark is ₹2,275 per quintal.";
      } else {
        message = "I heard: \"" + event.results[0][0].transcript + "\". For demo, try asking about Tomato or Mandi prices.";
      }

      setVoiceResponse(message);

      if ("speechSynthesis" in window) {
        const speech = new SpeechSynthesisUtterance(message);
        speech.lang = language;
        window.speechSynthesis.speak(speech);
      }
    };

    recognition.onerror = (e) => {
      setVoiceStatus("Ready");
      setIsListening(false);
      if (e.error !== "no-speech") {
        setVoiceResponse("Could not understand your voice. Please try again.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setTimeout(() => {
        setVoiceStatus((prev) => (prev === "Response Ready" ? prev : "Ready"));
      }, 800);
    };

    try {
      recognition.start();
    } catch (err) {
      console.warn("Speech recognition error:", err);
      setIsListening(false);
      setVoiceStatus("Ready");
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Greeting Section & Quick Indicators */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-emerald-900 to-emerald-800 text-white p-5 sm:p-7 rounded-2xl shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
              SIH 2026 Prototype
            </span>
            <span className="text-xs text-emerald-200">
              Mandi Session: Active (Day Open)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Good Morning, Kiran Patel 
          </h1>
          <p className="text-emerald-100/90 text-sm max-w-xl">
            Here's your real-time farm market intelligence and highest net-realization selling opportunities today.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <Link to="/sell">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white text-emerald-900 hover:bg-emerald-50 border-none font-semibold"
              icon={ShoppingBasket}
            >
              List Produce
            </Button>
          </Link>
          <Link to="/opportunities">
            <Button
              variant="outline"
              size="sm"
              className="bg-emerald-800/60 text-white border-emerald-600 hover:bg-emerald-700/60"
              icon={TrendingUp}
            >
              View Best Match
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid container with cards */}
      <div ref={cardsContainerRef} className="space-y-6">
        {/* Row 1: Market Intelligence & Farmer Produce */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* Card 1: Today's Market Price */}
          <Card className="dashboard-card border-gray-200/90 hover:border-emerald-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Live Mandi Benchmark
                </p>
                <h3 className="text-lg font-bold text-gray-900 mt-1">
                  Today's Tomato Modal Price
                </h3>
              </div>
              <Badge variant="emerald" dot>
                +8% This Week
              </Badge>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                ₹2,750
              </span>
              <span className="text-sm font-medium text-gray-500">
                / quintal
              </span>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-gray-400 block">Min Price</span>
                <span className="font-semibold text-gray-700">₹2,400/q</span>
              </div>
              <div>
                <span className="text-gray-400 block">Max Price</span>
                <span className="font-semibold text-gray-700">₹2,950/q</span>
              </div>
              <div>
                <span className="text-gray-400 block">Indore Mandi Arrival</span>
                <span className="font-semibold text-gray-700">420 Tonnes</span>
              </div>
            </div>
          </Card>

          {/* Card 2: Your Produce Lot */}
          <Card className="dashboard-card border-gray-200/90 hover:border-emerald-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Active Farm Lot
                </p>
                <h3 className="text-lg font-bold text-gray-900 mt-1">
                  Kiran's Ready Produce
                </h3>
              </div>
              <Badge variant="green">Ready for Dispatch</Badge>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-emerald-700 tracking-tight">
                800 kg
              </span>
              <span className="text-sm font-medium text-gray-500">
                (8 Quintals)
              </span>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 font-medium text-gray-700">
                <span>🍅 Tomato</span>
                <span className="text-gray-300">•</span>
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                  Grade A (Export/Retail Quality)
                </span>
              </div>
              <Link
                to="/sell"
                className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-0.5 hover:underline"
              >
                Update Lot <ChevronRight size={14} />
              </Link>
            </div>
          </Card>
        </div>

        {/* 2. Best Selling Opportunity Spotlight */}
        <div className="dashboard-card">
          <Link
            to="/opportunities"
            className="block group bg-gradient-to-br from-emerald-50/70 via-white to-white border-2 border-emerald-500/70 hover:border-emerald-600 rounded-2xl p-5 sm:p-7 shadow-xs hover:shadow-md transition-all duration-200"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              {/* Left Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    <Sparkles size={12} className="text-emerald-600" />
                    #1 Algorithm Recommended Opportunity
                  </span>
                  <span className="text-xs text-gray-500 hidden sm:inline">
                    Maximized Net Realization
                  </span>
                </div>

                <div className="flex flex-wrap items-baseline gap-3">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    FreshMart Direct Procurement
                  </h2>
                  <span className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                    <MapPin size={14} className="text-gray-400" /> Indore Logistics Hub (32 km)
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-emerald-700">
                    ₹2,520
                  </span>
                  <span className="text-sm font-medium text-gray-500">
                    / quintal
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded ml-1">
                    Estimated Lot Payout: ₹20,160
                  </span>
                </div>
              </div>

              {/* Right: Opportunity Score Capsule */}
              <div className="flex items-center gap-4 sm:gap-6 bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs">
                <div className="text-right">
                  <div className="flex items-baseline justify-end gap-1">
                    <span
                      ref={scoreRef}
                      className="text-3xl sm:text-4xl font-black text-emerald-600"
                    >
                      91
                    </span>
                    <span className="text-sm font-bold text-gray-400">/100</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Opportunity Score
                  </p>
                </div>

                <div className="h-10 w-px bg-gray-200 hidden sm:block" />

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div>
                    <span className="text-gray-400 block">Demand</span>
                    <span className="font-bold text-emerald-700">High</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Reliability</span>
                    <span className="font-bold text-emerald-700">94%</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Payment</span>
                    <span className="font-bold text-gray-800">3 Days</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Distance</span>
                    <span className="font-bold text-gray-800">32 km</span>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:translate-x-1 transition-transform">
                  <ArrowUpRight size={22} />
                </div>
              </div>
            </div>

            {/* Micro disclaimer as instructed */}
            <p className="text-[11px] text-gray-400 mt-3 pt-3 border-t border-emerald-100 flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-emerald-600" />
              Opportunity score calculated via multi-factor weighting: net realization, buyer reliability rating, transit overhead, and settlement cycle (SIH demo metrics).
            </p>
          </Link>
        </div>

        {/* 3. Voice Support Section */}
        <Card className="dashboard-card border-gray-200/90 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  🎙 Voice Assistant
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full transition-colors ${
                    voiceStatus === "Listening..."
                      ? "bg-red-100 text-red-700 animate-pulse"
                      : voiceStatus === "Processing..."
                      ? "bg-blue-100 text-blue-700"
                      : voiceStatus === "Response Ready"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  Status: {voiceStatus}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Multilingual Speech Intelligence
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">
                Ask in your native dialect about mandi rates, MSP, or buyer requirements without typing.
              </p>
            </div>

            {/* Language Selector and Trigger Button */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setLanguage("hi-IN")}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    language === "hi-IN"
                      ? "bg-white text-emerald-700 shadow-2xs font-semibold"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  हिंदी (Hindi)
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("en-IN")}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    language === "en-IN"
                      ? "bg-white text-emerald-700 shadow-2xs font-semibold"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  English
                </button>
              </div>

              <button
                type="button"
                onClick={startVoice}
                aria-label={isListening ? "Listening active" : "Start voice assistant"}
                className={`relative p-3.5 rounded-full text-white transition-all shadow-sm active:scale-95 ${
                  isListening
                    ? "bg-red-600 hover:bg-red-700 ring-4 ring-red-200 animate-pulse"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                <Mic size={20} />
                {isListening && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Voice Output Visualizer */}
          {(voiceTranscript || voiceResponse || isListening) && (
            <div className="mt-4 pt-4 border-t border-gray-100 bg-gray-50/60 rounded-xl p-3.5 text-xs sm:text-sm space-y-2">
              {voiceTranscript && (
                <div className="flex items-start gap-2 text-gray-600">
                  <span className="font-semibold text-gray-800">You asked:</span>
                  <span className="italic">"{voiceTranscript}"</span>
                </div>
              )}
              {voiceResponse && (
                <div className="flex items-start gap-2 text-emerald-800 bg-emerald-50/80 p-2.5 rounded-lg border border-emerald-200/60">
                  <Volume2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">{voiceResponse}</span>
                </div>
              )}
              {isListening && (
                <div className="flex items-center gap-2 text-red-600 font-medium">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
                  Listening... Speak crop name like "Tomato price" or "टमाटर का भाव".
                </div>
              )}
            </div>
          )}
        </Card>

        {/* 4. Quick Actions Grid */}
        <div ref={actionsRef} className="dashboard-card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Quick Actions
            </h2>
            <span className="text-xs text-gray-500 font-medium">
              Direct Access
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Link
              to="/sell"
              className="bg-white border border-gray-200/90 hover:border-emerald-500 hover:shadow-sm rounded-xl p-4 sm:p-5 transition-all text-left group"
            >
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <ShoppingBasket size={20} />
              </div>
              <p className="font-semibold text-gray-900 text-sm sm:text-base group-hover:text-emerald-700 transition-colors">
                Sell Produce
              </p>
              <p className="text-xs text-gray-500 mt-1">
                List new crop or lot for buyers
              </p>
            </Link>

            <Link
              to="/markets"
              className="bg-white border border-gray-200/90 hover:border-emerald-500 hover:shadow-sm rounded-xl p-4 sm:p-5 transition-all text-left group"
            >
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Store size={20} />
              </div>
              <p className="font-semibold text-gray-900 text-sm sm:text-base group-hover:text-blue-700 transition-colors">
                Market Prices
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Live APMC modal rates & trends
              </p>
            </Link>

            <Link
              to="/buyers"
              className="bg-white border border-gray-200/90 hover:border-emerald-500 hover:shadow-sm rounded-xl p-4 sm:p-5 transition-all text-left group"
            >
              <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Users size={20} />
              </div>
              <p className="font-semibold text-gray-900 text-sm sm:text-base group-hover:text-purple-700 transition-colors">
                Find Buyers
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Connect with verified traders
              </p>
            </Link>

            <Link
              to="/transactions"
              className="bg-white border border-gray-200/90 hover:border-emerald-500 hover:shadow-sm rounded-xl p-4 sm:p-5 transition-all text-left group"
            >
              <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <ReceiptText size={20} />
              </div>
              <p className="font-semibold text-gray-900 text-sm sm:text-base group-hover:text-amber-700 transition-colors">
                Transactions
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Track delivery and payment status
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;