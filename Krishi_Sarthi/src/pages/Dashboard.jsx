import { useState, useEffect, useRef, useContext } from "react";
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
} from "lucide-react";

import { animateStagger, animateCounter } from "../utils/animations";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";
import { CropImage } from "../components/ui/CropImage";
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
  const [produceStats, setProduceStats] = useState({ total: 0, available: 0, sold: 0 });
  const [bestOpp, setBestOpp] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  const scoreRef = useRef(null);
  const cardsContainerRef = useRef(null);
  const actionsRef = useRef(null);

  // Load real backend data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoadingData(true);

        // 1. Fetch Market Prices
        const priceRes = await api.get("/api/market/prices");
        const prices = priceRes?.prices || [];
        setMarketPrices(prices);

        // 2. Fetch Farmer Produce
        const prodRes = await api.get("/api/produce/my");
        const produceList = prodRes?.produce || [];
        if (produceList.length > 0) {
          setActiveLot(produceList[0]);
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
        }
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchDashboardData();
  }, []);

  // GSAP entrance and score animation
  useEffect(() => {
    if (cardsContainerRef.current) {
      const cards = cardsContainerRef.current.querySelectorAll(".dashboard-card");
      animateStagger(cards, {
        delay: 0.1,
        duration: 0.45,
      });
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

  return (
    <div ref={cardsContainerRef} className="space-y-6 sm:space-y-8">
      {/* 1. Dashboard Header Section */}
      <div className="dashboard-card flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-emerald-900 to-emerald-800 text-white p-5 sm:p-7 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
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
              className="border-2 border-emerald-400/30 shadow-md"
            />
          </Link>

          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                KIRAN Live Exchange
              </span>

              <span className="text-xs text-emerald-200">
                {t("dashboard.mandiSession")}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white truncate">
              {t("dashboard.greeting")}, {user?.name || "Farmer"}
            </h1>

            <p className="text-emerald-100/90 text-sm max-w-xl truncate">
              {t("dashboard.subtitle")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap shrink-0">
          <Link to="/sell?action=new" state={{ newCrop: true }}>
            <Button
              variant="secondary"
              size="sm"
              className="bg-white text-emerald-950 hover:bg-emerald-50 font-bold border border-white shadow-sm"
              icon={ShoppingBasket}
            >
              {t("dashboard.listProduce")}
            </Button>
          </Link>

          {/* View Best Match Button */}
          <Link to="/opportunities">
            <Button
              variant="primary"
              size="sm"
              className="bg-emerald-800 text-white border-2 border-emerald-300/80 hover:bg-emerald-700 hover:border-emerald-200 font-bold shadow-sm"
              icon={TrendingUp}
            >
              {t("dashboard.viewBestMatch")}
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Quick Actions (Exact Order: 1. Market Prices, 2. Sell Produce, 3. Find Buyers, 4. Transactions) */}
      <div ref={actionsRef} className="dashboard-card space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-gray-900">
            {t("dashboard.quickActions")}
          </h2>

          <span className="text-xs text-gray-500 font-medium">
            {t("dashboard.directAccess")}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Action 1: Market Prices */}
          <Link
            to="/markets"
            className="bg-white border border-gray-200/90 hover:border-blue-500 hover:shadow-sm rounded-xl p-4 sm:p-5 transition-all text-left group"
          >
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Store size={20} />
            </div>

            <p className="font-semibold text-gray-900 text-sm sm:text-base group-hover:text-blue-700 transition-colors">
              {t("dashboard.marketPrices")}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              {t("dashboard.marketPricesDescription")}
            </p>
          </Link>

          {/* Action 2: Sell Produce (Navigates directly to Sell New Crop) */}
          <Link
            to="/sell?action=new"
            state={{ newCrop: true }}
            className="bg-white border border-gray-200/90 hover:border-emerald-500 hover:shadow-sm rounded-xl p-4 sm:p-5 transition-all text-left group"
          >
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <ShoppingBasket size={20} />
            </div>

            <p className="font-semibold text-gray-900 text-sm sm:text-base group-hover:text-emerald-700 transition-colors">
              {t("dashboard.sellProduce")}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              {t("dashboard.sellProduceDescription")}
            </p>
          </Link>

          {/* Action 3: Find Buyers */}
          <Link
            to="/buyers"
            className="bg-white border border-gray-200/90 hover:border-purple-500 hover:shadow-sm rounded-xl p-4 sm:p-5 transition-all text-left group"
          >
            <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Users size={20} />
            </div>

            <p className="font-semibold text-gray-900 text-sm sm:text-base group-hover:text-purple-700 transition-colors">
              {t("dashboard.findBuyers")}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              {t("dashboard.findBuyersDescription")}
            </p>
          </Link>

          {/* Action 4: Transactions */}
          <Link
            to="/transactions"
            className="bg-white border border-gray-200/90 hover:border-amber-500 hover:shadow-sm rounded-xl p-4 sm:p-5 transition-all text-left group"
          >
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <ReceiptText size={20} />
            </div>

            <p className="font-semibold text-gray-900 text-sm sm:text-base group-hover:text-amber-700 transition-colors">
              {t("dashboard.transactions")}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              {t("dashboard.transactionsDescription")}
            </p>
          </Link>
        </div>
      </div>

      {/* Produce Statistics Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-gray-200/90 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Lots Listed
            </p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">
              {produceStats.total}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
            <Package size={20} />
          </div>
        </Card>

        <Card className="p-4 border-gray-200/90 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Active Available Lots
            </p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-0.5">
              {produceStats.available}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <ShoppingBasket size={20} />
          </div>
        </Card>

        <Card className="p-4 border-gray-200/90 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Completed Deals / Sold
            </p>
            <h3 className="text-2xl font-bold text-blue-600 mt-0.5">
              {produceStats.sold}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <ReceiptText size={20} />
          </div>
        </Card>
      </div>

      {/* Grid container */}
      <div className="space-y-6">
        {/* Market Intelligence & Farmer Produce */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* Today's Market Price Card */}
          <Card className="dashboard-card border-gray-200/90 hover:border-emerald-300">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <CropImage
                  crop={topMarketPrice?.crop_name || "Tomato"}
                  size="card"
                  className="rounded-xl shadow-xs shrink-0 border border-gray-200"
                />
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t("dashboard.liveMandiBenchmark")}
                  </p>

                  <h3 className="text-lg font-bold text-gray-900 mt-0.5">
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
              <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                {topMarketPrice
                  ? `₹${Number(topMarketPrice.modal_price).toLocaleString()}`
                  : "₹2,750"}
              </span>

              <span className="text-sm font-medium text-gray-500">
                / {topMarketPrice?.arrival_unit || "quintal"}
              </span>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-gray-400 block">
                  {t("dashboard.minPrice")}
                </span>
                <span className="font-semibold text-gray-700">
                  {topMarketPrice?.min_price
                    ? `₹${Number(topMarketPrice.min_price).toLocaleString()}/q`
                    : "—"}
                </span>
              </div>

              <div>
                <span className="text-gray-400 block">
                  {t("dashboard.maxPrice")}
                </span>
                <span className="font-semibold text-gray-700">
                  {topMarketPrice?.max_price
                    ? `₹${Number(topMarketPrice.max_price).toLocaleString()}/q`
                    : "—"}
                </span>
              </div>

              <div>
                <span className="text-gray-400 block">
                  Arrival Volume
                </span>
                <span className="font-semibold text-gray-700">
                  {topMarketPrice?.arrival_quantity
                    ? `${Number(topMarketPrice.arrival_quantity)} ${topMarketPrice.arrival_unit || "q"}`
                    : "Active"}
                </span>
              </div>
            </div>
          </Card>

          {/* Your Produce Lot Card */}
          <Card className="dashboard-card border-gray-200/90 hover:border-emerald-300">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {activeLot?.crop_name && (
                  <CropImage
                    crop={activeLot.crop_name}
                    size="card"
                    className="rounded-xl shadow-xs shrink-0 border border-gray-200"
                  />
                )}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t("dashboard.activeFarmLot")}
                  </p>

                  <h3 className="text-lg font-bold text-gray-900 mt-0.5">
                    {activeLot ? `${activeLot.crop_name} Lot` : "My Farm Produce"}
                  </h3>
                </div>
              </div>

              {activeLot ? (
                <Badge variant="green" className="shrink-0">{activeLot.status}</Badge>
              ) : (
                <Badge variant="gray" className="shrink-0">No Active Lot</Badge>
              )}
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-emerald-700 tracking-tight">
                {activeLot
                  ? `${activeLot.quantity} ${activeLot.unit}`
                  : "0 kg"}
              </span>

              {activeLot && activeLot.unit === "kg" && (
                <span className="text-sm font-medium text-gray-500">
                  ({(Number(activeLot.quantity) / 100).toFixed(1)} Quintals)
                </span>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 font-medium text-gray-700">
                {activeLot?.crop_name ? (
                  <>
                    <CropImage crop={activeLot.crop_name} size="xs" className="rounded shrink-0" />
                    <span className="font-semibold text-gray-900">{activeLot.crop_name}</span>
                  </>
                ) : (
                  <span>List your harvest</span>
                )}
                {activeLot?.quality_grade && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                      {activeLot.quality_grade}
                    </span>
                  </>
                )}
              </div>

              <Link
                to="/sell?action=new"
                state={{ newCrop: true }}
                className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-0.5 hover:underline"
              >
                {activeLot ? t("dashboard.updateLot") : "+ List Harvest"}
                <ChevronRight size={14} />
              </Link>
            </div>
          </Card>
        </div>

        {/* Best Selling Opportunity */}
        {bestOpp && (
          <div className="dashboard-card">
            <Link
              to="/opportunities"
              className="block group bg-gradient-to-br from-emerald-50/70 via-white to-white border-2 border-emerald-500/70 hover:border-emerald-600 rounded-2xl p-5 sm:p-7 shadow-xs hover:shadow-md transition-all duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                <div className="flex items-start gap-4">
                  <CropImage
                    crop={bestOpp.crop}
                    size="lot"
                    className="rounded-2xl shadow-sm shrink-0 border border-emerald-200 hidden sm:block"
                  />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        <Sparkles size={12} className="text-emerald-600" />
                        {t("dashboard.bestOpportunity")}
                      </span>

                      <span className="text-xs text-gray-500 hidden sm:inline">
                        {t("dashboard.maximizedNetRealization")}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-baseline gap-3">
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {bestOpp.title}
                      </h2>

                      <span className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                        <MapPin size={14} className="text-gray-400" />
                        {bestOpp.location}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-extrabold text-emerald-700">
                        ₹{bestOpp.price.toLocaleString()}
                      </span>

                      <span className="text-sm font-medium text-gray-500">
                        / {bestOpp.unit || "quintal"}
                      </span>

                      {bestOpp.price && bestOpp.quantity && (
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded ml-1">
                          Est. Payout: ₹{(bestOpp.price * (bestOpp.unit === "quintal" ? bestOpp.quantity : bestOpp.quantity / 100)).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Opportunity Details */}
                <div className="flex items-center gap-4 sm:gap-6 bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs">
                  <div className="text-right">
                    <div className="flex items-baseline justify-end gap-1">
                      <span
                        ref={scoreRef}
                        className="text-3xl sm:text-4xl font-black text-emerald-600"
                      >
                        {bestOpp.score}
                      </span>

                      <span className="text-sm font-bold text-gray-400">
                        /100
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      {t("dashboard.opportunityScore")}
                    </p>
                  </div>

                  <div className="h-10 w-px bg-gray-200 hidden sm:block" />

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <div>
                      <span className="text-gray-400 block">Crop</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <CropImage crop={bestOpp.crop} size="xs" className="rounded shrink-0" />
                        <span className="font-bold text-gray-900">{bestOpp.crop}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-400 block">Grade</span>
                      <span className="font-bold text-emerald-700">{bestOpp.grade}</span>
                    </div>

                    <div>
                      <span className="text-gray-400 block">Volume</span>
                      <span className="font-bold text-gray-800">{bestOpp.quantity} {bestOpp.unit}</span>
                    </div>

                    <div>
                      <span className="text-gray-400 block">Delivery</span>
                      <span className="font-bold text-gray-800">
                        {bestOpp.deliveryDate ? String(bestOpp.deliveryDate).split("T")[0] : "Prompt"}
                      </span>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:translate-x-1 transition-transform">
                    <ArrowUpRight size={22} />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-gray-400 mt-3 pt-3 border-t border-emerald-100 flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-emerald-600" />
                {t("dashboard.opportunityDisclaimer")}
              </p>
            </Link>
          </div>
        )}

        {/* Multilingual Voice Assistant */}
        <Card className="dashboard-card border-gray-200/90 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  🎙 {t("dashboard.voiceAssistant")}
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
                  {t("dashboard.status")}: {voiceStatus}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-900">
                {t("dashboard.multilingualSpeech")}
              </h3>

              <p className="text-xs sm:text-sm text-gray-500">
                {t("dashboard.voiceDescription")}
              </p>
            </div>

            {/* Language Selector */}
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
                aria-label={
                  isListening
                    ? "Listening active"
                    : "Start voice assistant"
                }
                className={`relative p-3.5 rounded-full text-white transition-all shadow-sm active:scale-95 cursor-pointer ${
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

          {/* Voice Output */}
          {(voiceTranscript || voiceResponse || isListening) && (
            <div className="mt-4 pt-4 border-t border-gray-100 bg-gray-50/60 rounded-xl p-3.5 text-xs sm:text-sm space-y-2">
              {voiceTranscript && (
                <div className="flex items-start gap-2 text-gray-600">
                  <span className="font-semibold text-gray-800">
                    {t("dashboard.youAsked")}:
                  </span>

                  <span className="italic">
                    "{voiceTranscript}"
                  </span>
                </div>
              )}

              {voiceResponse && (
                <div className="flex items-start gap-2 text-emerald-800 bg-emerald-50/80 p-2.5 rounded-lg border border-emerald-200/60">
                  <Volume2
                    size={16}
                    className="text-emerald-600 flex-shrink-0 mt-0.5"
                  />

                  <span className="font-medium">
                    {voiceResponse}
                  </span>
                </div>
              )}

              {isListening && (
                <div className="flex items-center gap-2 text-red-600 font-medium">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
                  {t("dashboard.speakCropName")}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;