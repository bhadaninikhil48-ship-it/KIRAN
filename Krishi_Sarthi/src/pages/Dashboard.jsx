import { useState, useEffect, useRef, useContext, useCallback } from "react";
import { useTranslation } from "react-i18next";
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
  Package,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  ArrowRight,
  Calendar,
  Radio,
} from "lucide-react";

import { animateStagger, animateCounter } from "../utils/animations";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";
import { CropImage } from "../components/ui/CropImage";
import { EmptyState } from "../components/ui/EmptyState";
import { AuthContext } from "../context/AuthContext";
import { api } from "../services/api";

export function Dashboard() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);

  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState("hi-IN");
  const [voiceStatus, setVoiceStatus] = useState("Ready");
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceResponse, setVoiceResponse] = useState("");

  // Backend data states
  const [marketPrices, setMarketPrices] = useState([]);
  const [activeLot, setActiveLot] = useState(null);
  const [produceList, setProduceList] = useState([]);
  const [produceStats, setProduceStats] = useState({ total: 0, available: 0, sold: 0 });
  const [bestOpp, setBestOpp] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const scoreRef = useRef(null);
  const cardsContainerRef = useRef(null);
  const actionsRef = useRef(null);

  // Load real backend data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoadingData(true);
      setFetchError(null);

      // 1. Fetch Market Prices
      const priceRes = await api.get("/api/market/prices");
      const prices = priceRes?.prices || [];
      setMarketPrices(prices);

      // 2. Fetch Farmer Produce
      const prodRes = await api.get("/api/produce/my");
      const list = prodRes?.produce || [];
      setProduceList(list);
      if (list.length > 0) {
        setActiveLot(list[0]);
      } else {
        setActiveLot(null);
      }

      // 3. Fetch Produce Stats
      const statsRes = await api.get("/api/produce/stats");
      if (statsRes) {
        setProduceStats({
          total: statsRes.total || 0,
          available: statsRes.available || 0,
          sold: statsRes.sold || 0,
        });
      }

      // 4. Fetch Best Opportunities (Open buyer requirements or highest market rate)
      const reqRes = await api.get("/api/buyer/requirements/open");
      const reqs = reqRes?.requirements || [];
      if (reqs.length > 0) {
        setBestOpp({
          type: "buyer",
          title: reqs[0].buyer_name || "Institutional Procurement Hub",
          crop: reqs[0].crop_name,
          grade: reqs[0].quality_grade || "Grade A",
          price: Number(reqs[0].max_price || 0),
          quantity: Number(reqs[0].quantity),
          unit: reqs[0].unit,
          location: reqs[0].location || "Regional Hub",
          score: 92,
          demand: "High",
          deliveryDate: reqs[0].required_by,
        });
      } else if (prices.length > 0) {
        setBestOpp({
          type: "market",
          title: `${prices[0].market_name} Auction`,
          crop: prices[0].crop_name,
          grade: "Mandi Standard",
          price: Number(prices[0].modal_price),
          quantity: Number(prices[0].arrival_quantity || 100),
          unit: prices[0].arrival_unit || "quintal",
          location: `${prices[0].district || ""}, ${prices[0].state || ""}`,
          score: 88,
          demand: "Active Session",
          deliveryDate: prices[0].price_date,
        });
      } else {
        setBestOpp(null);
      }
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
      setFetchError("Unable to refresh latest market data. Displaying cached indicators.");
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // GSAP entrance and score animation
  useEffect(() => {
    if (!loadingData && cardsContainerRef.current) {
      const cards = cardsContainerRef.current.querySelectorAll(".dashboard-card");
      if (cards.length > 0) {
        animateStagger(cards, {
          delay: 0.05,
          duration: 0.4,
        });
      }
    }

    if (scoreRef.current && bestOpp) {
      animateCounter(scoreRef.current, bestOpp.score || 90, 1.2);
    }
  }, [loadingData, bestOpp]);

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

      // Match against real market prices from DB
      let matchedPrice = null;
      for (const p of marketPrices) {
        if (text.includes(p.crop_name.toLowerCase())) {
          matchedPrice = p;
          break;
        }
      }

      let message;
      if (matchedPrice) {
        message = `Today's ${matchedPrice.crop_name} modal price is ₹${Number(matchedPrice.modal_price).toLocaleString()} per ${matchedPrice.arrival_unit || "quintal"} in ${matchedPrice.market_name}.`;
      } else if (marketPrices.length > 0) {
        message = `Available live mandi prices in ${marketPrices[0].market_name}: ${marketPrices[0].crop_name} at ₹${Number(marketPrices[0].modal_price).toLocaleString()}/quintal.`;
      } else {
        message = `I heard: "${event.results[0][0].transcript}". Please ask for Mandi rates of Tomato, Potato, Onion, or Wheat.`;
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

  const topMarketPrice = marketPrices[0];

  // Helper for price spread bar
  const calculatePricePosition = (min, modal, max) => {
    const minVal = Number(min || 0);
    const modalVal = Number(modal || 0);
    const maxVal = Number(max || 0);
    if (maxVal <= minVal) return 50;
    const pct = ((modalVal - minVal) / (maxVal - minVal)) * 100;
    return Math.max(5, Math.min(95, pct));
  };

  return (
    <div ref={cardsContainerRef} className="space-y-6 sm:space-y-8 min-w-0">
      {fetchError && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-3 text-amber-800 text-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <AlertCircle size={18} className="text-amber-600 shrink-0" />
            <span className="truncate">{fetchError}</span>
          </div>
          <button
            type="button"
            onClick={fetchDashboardData}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors shrink-0 cursor-pointer"
          >
            <RefreshCw size={13} />
            Retry
          </button>
        </div>
      )}

      {loadingData ? (
        <div className="space-y-6 animate-pulse">
          <div className="h-36 sm:h-32 bg-white border border-gray-200/80 rounded-2xl p-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-white border border-gray-200/80 rounded-2xl p-5" />
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-white border border-gray-200/80 rounded-xl p-4" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            <div className="h-72 bg-white border border-gray-200/80 rounded-2xl p-6" />
            <div className="h-72 bg-white border border-gray-200/80 rounded-2xl p-6" />
          </div>
          <div className="h-48 bg-white border border-gray-200/80 rounded-2xl p-6" />
        </div>
      ) : (
        <>
          {/* 1. Welcome */}
          <div className="dashboard-card bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-7 shadow-xs hover:border-gray-300 transition-all">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0">
                <Link
                  to="/profile"
                  title="View & Edit Profile Photo"
                  className="shrink-0 transition-transform hover:scale-105"
                >
                  <Avatar
                    src={user?.avatar}
                    name={user?.name || "Farmer"}
                    role={user?.role || "farmer"}
                    size="xl"
                    ring
                    className="border-2 border-emerald-500/30 shadow-xs"
                  />
                </Link>

                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      KIRAN Live Exchange
                    </span>
                    <span className="text-xs text-gray-500 font-medium hidden sm:inline-flex items-center gap-1">
                      <Clock size={12} className="text-gray-400" />
                      {t("dashboard.mandiSession")}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 truncate">
                    {t("dashboard.greeting")}, {user?.name || "Farmer"}
                  </h1>

                  <p className="text-gray-500 text-sm max-w-xl font-normal leading-relaxed line-clamp-2">
                    {t("dashboard.subtitle")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap sm:flex-nowrap shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                <Link to="/sell?action=new" state={{ newCrop: true }} className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
                    icon={ShoppingBasket}
                  >
                    {t("dashboard.listProduce")}
                  </Button>
                </Link>

                <Link to="/opportunities" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full sm:w-auto text-emerald-800 border-emerald-300 hover:bg-emerald-50/70 hover:text-emerald-900 font-medium"
                    icon={TrendingUp}
                  >
                    {t("dashboard.viewBestMatch")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* 2. KPI Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="dashboard-card border-gray-200/90 p-4 sm:p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Lots Listed</p>
              <div className="flex items-center justify-between gap-3 mt-2">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">{produceStats.total}</h3>
                <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Package size={20} />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100 font-medium">Registered farm lots</p>
            </Card>

            <Card className="dashboard-card border-gray-200/90 p-4 sm:p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Available Lots</p>
              <div className="flex items-center justify-between gap-3 mt-2">
                <h3 className="text-2xl sm:text-3xl font-bold text-emerald-600">{produceStats.available}</h3>
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <ShoppingBasket size={20} />
                </div>
              </div>
              <p className="text-xs text-emerald-700 mt-3 pt-3 border-t border-gray-100 font-medium">Ready for buyer bids</p>
            </Card>

            <Card className="dashboard-card border-gray-200/90 p-4 sm:p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Completed Deals</p>
              <div className="flex items-center justify-between gap-3 mt-2">
                <h3 className="text-2xl sm:text-3xl font-bold text-blue-600">{produceStats.sold}</h3>
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100 font-medium">Settled & dispatched</p>
            </Card>

            <Card className="dashboard-card border-gray-200/90 p-4 sm:p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Benchmark Mandi Rate</p>
              <div className="flex items-baseline gap-1 mt-1">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {topMarketPrice ? `₹${Number(topMarketPrice.modal_price).toLocaleString()}` : "₹2,750"}
                </h3>
                <span className="text-xs font-medium text-gray-400">
                  /{topMarketPrice?.arrival_unit || "quintal"}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100 font-medium truncate">
                {topMarketPrice ? `${topMarketPrice.crop_name} • ${topMarketPrice.market_name}` : "Live APMC Network"}
              </p>
            </Card>
          </div>

          {/* 3. Quick Actions */}
          <div ref={actionsRef} className="dashboard-card space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">{t("dashboard.quickActions")}</h2>
              <span className="text-xs text-gray-500 font-medium">{t("dashboard.directAccess")}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Link
                to="/markets"
                className="bg-white border border-gray-200/90 hover:border-blue-400 hover:shadow-xs hover:-translate-y-0.5 rounded-xl p-4 sm:p-5 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                    <Store size={20} />
                  </div>
                  <ArrowUpRight size={16} className="text-gray-300 group-hover:text-blue-600 transition-all" />
                </div>
                <p className="font-semibold text-gray-900 text-sm sm:text-base group-hover:text-blue-700">
                  {t("dashboard.marketPrices")}
                </p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{t("dashboard.marketPricesDescription")}</p>
              </Link>

              <Link
                to="/sell?action=new"
                state={{ newCrop: true }}
                className="bg-white border border-gray-200/90 hover:border-emerald-400 hover:shadow-xs hover:-translate-y-0.5 rounded-xl p-4 sm:p-5 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <ShoppingBasket size={20} />
                  </div>
                  <ArrowUpRight size={16} className="text-gray-300 group-hover:text-emerald-600 transition-all" />
                </div>
                <p className="font-semibold text-gray-900 text-sm sm:text-base group-hover:text-emerald-700">
                  {t("dashboard.listProduce")}
                </p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">List your harvest for verified buyers.</p>
              </Link>

              <Link
                to="/buyers"
                className="bg-white border border-gray-200/90 hover:border-purple-400 hover:shadow-xs hover:-translate-y-0.5 rounded-xl p-4 sm:p-5 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                    <Users size={20} />
                  </div>
                  <ArrowUpRight size={16} className="text-gray-300 group-hover:text-purple-600 transition-all" />
                </div>
                <p className="font-semibold text-gray-900 text-sm sm:text-base group-hover:text-purple-700">
                  {t("dashboard.findBuyers")}
                </p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{t("dashboard.findBuyersDescription")}</p>
              </Link>

              <Link
                to="/transactions"
                className="bg-white border border-gray-200/90 hover:border-amber-400 hover:shadow-xs hover:-translate-y-0.5 rounded-xl p-4 sm:p-5 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                    <ReceiptText size={20} />
                  </div>
                  <ArrowUpRight size={16} className="text-gray-300 group-hover:text-amber-600 transition-all" />
                </div>
                <p className="font-semibold text-gray-900 text-sm sm:text-base group-hover:text-amber-700">
                  {t("dashboard.transactions")}
                </p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{t("dashboard.transactionsDescription")}</p>
              </Link>
            </div>
          </div>

          {/* 4. Produce Statistics Summary Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 border-gray-200/90 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Lots Listed</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{produceStats.total}</h3>
              </div>
              <Package size={20} className="text-gray-700" />
            </Card>

            <Card className="p-4 border-gray-200/90 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Available Lots</p>
                <h3 className="text-2xl font-bold text-emerald-600 mt-0.5">{produceStats.available}</h3>
              </div>
              <ShoppingBasket size={20} className="text-emerald-700" />
            </Card>

            <Card className="p-4 border-gray-200/90 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Completed Deals / Sold</p>
                <h3 className="text-2xl font-bold text-blue-600 mt-0.5">{produceStats.sold}</h3>
              </div>
              <ReceiptText size={20} className="text-blue-700" />
            </Card>
          </div>

          {/* 5. Market Intelligence & Farmer Produce */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <Card className="dashboard-card border-gray-200/90 hover:border-emerald-300">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <CropImage
                    crop={topMarketPrice?.crop_name || "Tomato"}
                    size="card"
                    className="rounded-xl shadow-xs shrink-0 border border-gray-200"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {t("dashboard.liveMandiBenchmark")}
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 mt-0.5 truncate">
                      {topMarketPrice
                        ? `${topMarketPrice.crop_name} (${topMarketPrice.market_name})`
                        : t("dashboard.todayTomatoPrice")}
                    </h3>
                  </div>
                </div>
                <Badge variant="emerald" dot className="shrink-0">
                  {topMarketPrice?.district || "Live Feed"}
                </Badge>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                  {topMarketPrice ? `₹${Number(topMarketPrice.modal_price).toLocaleString()}` : "₹2,750"}
                </span>
                <span className="text-sm font-medium text-gray-500">
                  / {topMarketPrice?.arrival_unit || "quintal"}
                </span>
              </div>

              {topMarketPrice && topMarketPrice.min_price != null && topMarketPrice.max_price != null && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
                    <span>Min: ₹{Number(topMarketPrice.min_price).toLocaleString()}</span>
                    <span className="text-emerald-700 font-semibold">
                      Modal: ₹{Number(topMarketPrice.modal_price).toLocaleString()}
                    </span>
                    <span>Max: ₹{Number(topMarketPrice.max_price).toLocaleString()}</span>
                  </div>
                  <div className="relative w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-emerald-500 rounded-full" />
                    <div
                      className="absolute top-0 bottom-0 w-2 bg-white rounded-full shadow border border-gray-400 -translate-x-1/2"
                      style={{
                        left: `${calculatePricePosition(
                          topMarketPrice.min_price,
                          topMarketPrice.modal_price,
                          topMarketPrice.max_price
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <span className="text-xs text-gray-500 truncate">
                  {topMarketPrice
                    ? `${topMarketPrice.crop_name} • ${topMarketPrice.market_name}`
                    : "Live APMC Network"}
                </span>
                <Link to="/markets" className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1">
                  View Market <ChevronRight size={14} />
                </Link>
              </div>
            </Card>

            <Card className="dashboard-card border-gray-200/90 hover:border-emerald-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {activeLot?.crop_name && (
                      <CropImage
                        crop={activeLot.crop_name}
                        size="card"
                        className="rounded-xl shadow-xs shrink-0 border border-gray-200"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {t("dashboard.activeFarmLot")}
                      </p>
                      <h3 className="text-lg font-bold text-gray-900 mt-1 truncate">
                        {activeLot ? `${activeLot.crop_name} Lot` : "My Farm Produce"}
                      </h3>
                    </div>
                  </div>

                  {activeLot ? (
                    <StatusBadge status={activeLot.status} />
                  ) : (
                    <Badge variant="gray">No Active Lot</Badge>
                  )}
                </div>

                {activeLot ? (
                  <>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <span className="text-gray-400 block text-[11px]">Crop</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <CropImage crop={activeLot.crop_name} size="xs" className="rounded shrink-0" />
                          <span className="font-bold text-gray-900">{activeLot.crop_name}</span>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <span className="text-gray-400 block text-[11px]">Quantity</span>
                        <span className="font-bold text-gray-900 block mt-1">
                          {Number(activeLot.quantity || 0).toLocaleString("en-IN")} {activeLot.unit || "kg"}
                        </span>
                        {activeLot.unit === "kg" && (
                          <span className="text-[11px] text-gray-500">
                            ({(Number(activeLot.quantity || 0) / 100).toFixed(1)} quintals)
                          </span>
                        )}
                      </div>

                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <span className="text-gray-400 block text-[11px]">Quality Grade</span>
                        <span className="font-semibold text-emerald-700 block mt-1">
                          {activeLot.quality_grade || "Standard Grade"}
                        </span>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <span className="text-gray-400 block text-[11px]">Storage / Location</span>
                        <span className="font-semibold text-gray-800 truncate block mt-1">
                          {activeLot.location || user?.district || "Farm Storage"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <span className="text-gray-400 block text-[11px]">Availability Date</span>
                      <span className="font-semibold text-gray-800 block mt-1">
                        {activeLot.available_from
                          ? String(activeLot.available_from).split("T")[0]
                          : activeLot.expected_harvest_date
                          ? String(activeLot.expected_harvest_date).split("T")[0]
                          : "Immediate"}
                      </span>
                    </div>

                    {produceList.length > 1 && (
                      <p className="mt-3 text-xs text-gray-500 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                        You have <strong>{produceList.length} total lots</strong> listed across your inventory.
                      </p>
                    )}
                  </>
                ) : (
                  <div className="mt-4">
                    <EmptyState
                      icon={ShoppingBasket}
                      title="No Produce Listed Yet"
                      description="List your current crop harvest to enable direct buyer matchmaking and algorithm recommendations."
                      actionLabel="+ List First Harvest"
                      onAction={() => {}}
                      className="py-6 sm:py-8 bg-gray-50/50"
                    />
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <Link to="/sell" className="text-xs text-gray-600 hover:text-gray-900 font-medium hover:underline">
                  Manage All Produce
                </Link>

                <Link
                  to="/sell?action=new"
                  state={{ newCrop: true }}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1 hover:underline"
                >
                  {activeLot ? t("dashboard.updateLot") : "+ List Harvest"}
                  <ChevronRight size={14} />
                </Link>
              </div>
            </Card>
          </div>

          {/* 6. Best Selling Opportunity */}
          {bestOpp && (
            <div className="dashboard-card">
              <Link
                to="/opportunities"
                className="block group bg-gradient-to-br from-emerald-50/50 via-white to-white border border-emerald-200 hover:border-emerald-400 rounded-2xl p-5 sm:p-7 shadow-xs hover:shadow-sm transition-all duration-200"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                  <div className="flex items-start gap-4 min-w-0">
                    <CropImage
                      crop={bestOpp.crop}
                      size="lot"
                      className="rounded-2xl shadow-sm shrink-0 border border-emerald-200 hidden sm:block"
                    />

                    <div className="space-y-2.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300/60">
                          <Sparkles size={13} className="text-emerald-600" />
                          {t("dashboard.bestOpportunity")}
                        </span>
                        <span className="text-xs text-gray-500 hidden sm:inline font-medium">
                          {t("dashboard.maximizedNetRealization")}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-baseline gap-3">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:text-emerald-900 transition-colors">
                          {bestOpp.title}
                        </h2>
                        <span className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                          <MapPin size={14} className="text-emerald-600 shrink-0" />
                          {bestOpp.location}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="text-3xl sm:text-4xl font-extrabold text-emerald-700 tracking-tight">
                          ₹{bestOpp.price.toLocaleString()}
                        </span>
                        <span className="text-sm font-medium text-gray-500">/ {bestOpp.unit || "quintal"}</span>

                        {bestOpp.price && bestOpp.quantity && (
                          <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/90 px-2.5 py-1 rounded-md ml-1 border border-emerald-200">
                            Est. Payout: ₹
                            {(bestOpp.price * (bestOpp.unit === "quintal" ? bestOpp.quantity : bestOpp.quantity / 100)).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6 bg-white p-4 rounded-xl border border-emerald-200/80 shadow-2xs shrink-0">
                    <div className="text-right">
                      <div className="flex items-baseline justify-end gap-1">
                        <span
                          ref={scoreRef}
                          className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight"
                        >
                          {bestOpp.score}
                        </span>
                        <span className="text-sm font-bold text-gray-400">/100</span>
                      </div>
                      <p className="text-[11px] font-semibold text-gray-700 uppercase tracking-wide">
                        {t("dashboard.opportunityScore")}
                      </p>
                    </div>

                    <div className="h-10 w-px bg-gray-200 hidden sm:block" />

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                      <div>
                        <span className="text-gray-400 block text-[11px]">Crop</span>
                        <div className="flex items-center gap-1.5">
                          <CropImage crop={bestOpp.crop} size="xs" className="rounded shrink-0" />
                          <span className="font-bold text-gray-900">{bestOpp.crop}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-gray-400 block text-[11px]">Grade</span>
                        <span className="font-bold text-emerald-700">{bestOpp.grade}</span>
                      </div>

                      <div>
                        <span className="text-gray-400 block text-[11px]">Volume</span>
                        <span className="font-bold text-gray-800">
                          {bestOpp.quantity} {bestOpp.unit}
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-400 block text-[11px]">Delivery</span>
                        <span className="font-bold text-gray-800">
                          {bestOpp.deliveryDate ? String(bestOpp.deliveryDate).split("T")[0] : "Prompt"}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                      <ArrowUpRight size={20} />
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-gray-400 mt-3 pt-3 border-t border-emerald-100 flex items-center gap-1.5 font-medium">
                  <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                  {t("dashboard.opportunityDisclaimer")}
                </p>
              </Link>
            </div>
          )}

          {/* 7. Multilingual Voice Assistant */}
          <Card className="dashboard-card border-gray-200/90 overflow-hidden shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60 inline-flex items-center gap-1">
                    🎙 {t("dashboard.voiceAssistant")}
                  </span>

                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full transition-colors ${
                      voiceStatus === "Listening..."
                        ? "bg-red-50 text-red-700 border border-red-200 animate-pulse"
                        : voiceStatus === "Processing..."
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : voiceStatus === "Response Ready"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}
                  >
                    {t("dashboard.status")}: {voiceStatus}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900">{t("dashboard.multilingualSpeech")}</h3>
                <p className="text-xs sm:text-sm text-gray-500 font-normal">{t("dashboard.voiceDescription")}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200/70">
                  <button
                    type="button"
                    onClick={() => setLanguage("hi-IN")}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                      language === "hi-IN"
                        ? "bg-white text-emerald-800 shadow-xs font-semibold"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    हिंदी (Hindi)
                  </button>

                  <button
                    type="button"
                    onClick={() => setLanguage("en-IN")}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                      language === "en-IN"
                        ? "bg-white text-emerald-800 shadow-xs font-semibold"
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
                  className={`relative p-3.5 rounded-full text-white transition-all shadow-sm active:scale-95 cursor-pointer ${
                    isListening
                      ? "bg-red-600 hover:bg-red-700 ring-4 ring-red-100 animate-pulse"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  <Mic size={20} />
                  {isListening && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                    </span>
                  )}
                </button>
              </div>
            </div>

            {(voiceTranscript || voiceResponse || isListening) && (
              <div className="mt-4 pt-4 border-t border-gray-100 bg-gray-50/70 rounded-xl p-4 text-xs sm:text-sm space-y-2.5">
                {voiceTranscript && (
                  <div className="flex items-start gap-2 text-gray-700">
                    <span className="font-semibold text-gray-900 shrink-0">{t("dashboard.youAsked")}:</span>
                    <span className="italic bg-white px-2.5 py-1 rounded-md border border-gray-200/70">
                      "{voiceTranscript}"
                    </span>
                  </div>
                )}

                {voiceResponse && (
                  <div className="flex items-start gap-2.5 text-emerald-900 bg-emerald-50/90 p-3 rounded-xl border border-emerald-200">
                    <Volume2 size={18} className="text-emerald-700 flex-shrink-0 mt-0.5" />
                    <span className="font-medium leading-relaxed">{voiceResponse}</span>
                  </div>
                )}

                {isListening && (
                  <div className="flex items-center gap-2 text-red-600 font-medium pt-1">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                    {t("dashboard.speakCropName")}
                  </div>
                )}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

export default Dashboard;