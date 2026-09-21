import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBasket,
  FileText,
  ClipboardCheck,
  TrendingUp,
  PlusCircle,
  Clock,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  MapPin,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Avatar } from "../../components/ui/Avatar";
import { EmptyState } from "../../components/ui/EmptyState";
import { CropImage } from "../../components/ui/CropImage";

export function BuyerDashboard() {
  const { user } = useContext(AuthContext);
  const [requirements, setRequirements] = useState([]);
  const [offers, setOffers] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [reqRes, offRes, conRes] = await Promise.all([
        api.get("/api/buyer/requirements/my"),
        api.get("/api/offers/buyer"),
        api.get("/api/contracts/buyer"),
      ]);

      setRequirements(reqRes.requirements || []);
      setOffers(offRes.offers || []);
      setContracts(conRes.contracts || []);
    } catch (err) {
      console.error("Error loading buyer dashboard data:", err);
      setError("Failed to load dashboard data. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openReqs = requirements.filter((r) => r.status === "open");
  const pendingOffers = offers.filter((o) => o.status === "pending");
  const activeContracts = contracts.filter((c) => c.status === "active");
  const totalSourcedValue = contracts.reduce((acc, c) => acc + (Number(c.total_amount) || 0), 0);

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* 1. Dashboard Header / Buyer Command Center */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-1.5 min-w-0">
            {/* Title & Badges */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Buyer Command Center
              </h1>
              <Badge variant="blue" dot size="sm">
                Procurement Hub
              </Badge>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50/90 border border-emerald-200/70 px-2.5 py-0.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Mandi Feeds Active
              </span>
            </div>
            {/* Supporting Subtitle */}
            <p className="text-xs sm:text-sm text-gray-500 max-w-2xl leading-relaxed">
              Welcome back, <strong className="text-gray-900 font-semibold">{user?.name || "Buyer"}</strong>. Manage your procurement pipeline, incoming farmer offers, and legal fulfillment contracts.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <Button
              size="sm"
              variant="outline"
              icon={RefreshCw}
              loading={loading}
              onClick={loadData}
              className="text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 font-medium shadow-xs"
            >
              Refresh
            </Button>
            <Link to="/buyer/requirements">
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow font-medium active:scale-[0.98] transition-all"
                icon={PlusCircle}
              >
                Post Requirement
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {loading ? (
        /* SaaS Skeleton Loading State */
        <div className="space-y-6 animate-pulse">
          {/* Skeletons: 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-2xl border border-gray-200/70 p-5">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>

          {/* Skeletons: 3 Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-2xl border border-gray-200/70 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-200"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Skeletons: Offers Section */}
          <div className="h-64 bg-gray-100 rounded-2xl border border-gray-200/70 p-6"></div>
        </div>
      ) : error ? (
        /* Error Alert Banner */
        <div className="bg-red-50 border border-red-200/90 text-red-800 p-5 rounded-2xl flex items-start justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm text-red-900">Unable to Load Procurement Data</h3>
              <p className="text-xs text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
          <Button size="xs" variant="outline" onClick={loadData} className="border-red-300 text-red-800 hover:bg-red-100/60 shrink-0">
            Retry
          </Button>
        </div>
      ) : (
        <>
          {/* 2. Key Metrics Grid (4-Column Layout) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Metric A: Open Demands (Blue Accent) */}
            <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">
                  Open Demands
                </span>
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/80 group-hover:scale-105 group-hover:bg-blue-100/70 transition-all duration-200 shrink-0">
                  <ShoppingBasket size={20} />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight block">
                  {openReqs.length}
                </span>
                <p className="text-xs text-gray-500 mt-1.5 font-medium">
                  Active procurement lots
                </p>
              </div>
            </div>

            {/* Metric B: Pending Offers (Amber Accent) */}
            <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-amber-200 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">
                  Pending Offers
                </span>
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100/80 group-hover:scale-105 group-hover:bg-amber-100/70 transition-all duration-200 shrink-0">
                  <Clock size={20} />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight block">
                  {pendingOffers.length}
                </span>
                <p className="text-xs text-gray-500 mt-1.5 font-medium">
                  Awaiting your acceptance
                </p>
              </div>
            </div>

            {/* Metric C: Active Contracts (Emerald Accent) */}
            <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-emerald-200 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">
                  Active Contracts
                </span>
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/80 group-hover:scale-105 group-hover:bg-emerald-100/70 transition-all duration-200 shrink-0">
                  <ClipboardCheck size={20} />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight block">
                  {activeContracts.length}
                </span>
                <p className="text-xs text-gray-500 mt-1.5 font-medium">
                  In fulfillment / transit
                </p>
              </div>
            </div>

            {/* Metric D: Total Contract Value (Purple Accent) */}
            <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-purple-200 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">
                  Total Contract Value
                </span>
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100/80 group-hover:scale-105 group-hover:bg-purple-100/70 transition-all duration-200 shrink-0">
                  <TrendingUp size={20} />
                </div>
              </div>
              <div className="mt-4 min-w-0">
                <span
                  className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight block truncate"
                  title={`₹${totalSourcedValue.toLocaleString("en-IN")}`}
                >
                  ₹{totalSourcedValue.toLocaleString("en-IN")}
                </span>
                <p className="text-xs text-gray-500 mt-1.5 font-medium">
                  Committed legal value
                </p>
              </div>
            </div>
          </div>

          {/* 3. Quick Action Cards (3-Column Layout) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {/* Card 1: Manage Requirements */}
            <Link to="/buyer/requirements" className="block group cursor-pointer focus:outline-none">
              <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-emerald-300 hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl group-hover:scale-105 group-hover:bg-emerald-100/80 transition-all duration-200 border border-emerald-100/80 shrink-0">
                      <ShoppingBasket size={22} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base group-hover:text-emerald-700 transition-colors tracking-tight truncate">
                        Manage Requirements
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                        Post new crop specs or view current listings
                      </p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-all duration-200 shrink-0">
                    <ArrowUpRight size={18} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Card 2: Review Farmer Offers (Key Buyer Workflow) */}
            <Link to="/buyer/offers" className="block group cursor-pointer focus:outline-none">
              <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-3 bg-blue-50 text-blue-700 rounded-xl group-hover:scale-105 group-hover:bg-blue-100/80 transition-all duration-200 border border-blue-100/80 shrink-0">
                      <FileText size={22} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-900 text-sm sm:text-base group-hover:text-blue-700 transition-colors tracking-tight">
                          Review Farmer Offers
                        </h3>
                        {pendingOffers.length > 0 && (
                          <span className="inline-flex items-center text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded-full shrink-0">
                            {pendingOffers.length} pending
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                        Accept, reject, or negotiate counter-proposals
                      </p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all duration-200 shrink-0">
                    <ArrowUpRight size={18} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Card 3: Enforce Contracts */}
            <Link to="/buyer/contracts" className="block group cursor-pointer focus:outline-none">
              <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-purple-300 hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-3 bg-purple-50 text-purple-700 rounded-xl group-hover:scale-105 group-hover:bg-purple-100/80 transition-all duration-200 border border-purple-100/80 shrink-0">
                      <ShieldCheck size={22} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base group-hover:text-purple-700 transition-colors tracking-tight truncate">
                        Enforce Contracts
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                        View binding digital contracts and dispatches
                      </p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 group-hover:text-purple-600 group-hover:bg-purple-50 transition-all duration-200 shrink-0">
                    <ArrowUpRight size={18} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Section: Recent Offers Received */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/60">
                  <Clock size={18} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">
                    Latest Offers from Farmers
                  </h2>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    Direct proposals submitted against your open procurement requirements
                  </p>
                </div>
              </div>
              <Link
                to="/buyer/offers"
                className="text-xs sm:text-sm font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 transition-colors"
              >
                View All Offers <ArrowRight size={14} />
              </Link>
            </div>

            {offers.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No offers submitted by farmers yet"
                description="Make sure your requirements are published to receive competitive bids from verified farmers and FPOs."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {offers.slice(0, 4).map((offer) => {
                  const estValue = (Number(offer.offer_price) || 0) * (Number(offer.quantity) || 0);

                  return (
                    <Card
                      key={offer.id}
                      className="p-5 sm:p-6 border-gray-200/90 hover:border-emerald-300 hover:shadow-xs transition-all duration-200 bg-white flex flex-col justify-between group"
                    >
                      <div>
                        {/* Top Row: Crop Image + Spec & Status */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <CropImage cropName={offer.crop_name} size="sm" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-gray-900 text-base sm:text-lg tracking-tight truncate">
                                  {offer.crop_name}
                                </h3>
                                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full shrink-0">
                                  {offer.quality_grade || "Grade A"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <StatusBadge
                            status={
                              offer.status === "pending"
                                ? "Pending"
                                : offer.status === "accepted"
                                ? "Accepted"
                                : "Rejected"
                            }
                          />
                        </div>

                        {/* Farmer Identity Row (Visually Polished & Respecting Data Availability) */}
                        <div className="mt-3.5 py-2.5 px-3 bg-gray-50/80 rounded-xl border border-gray-100 flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Avatar
                              name={offer.farmer_name || "Farmer"}
                              role="farmer"
                              size="sm"
                              className="ring-1 ring-emerald-200"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
                                  {offer.farmer_name || "Independent Farmer"}
                                </span>
                                <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60 shrink-0">
                                  Producer
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-500 truncate mt-0.5">
                                Linked to Requirement #{offer.requirement_id}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Optional Farmer Note / Message */}
                        {offer.message && (
                          <p className="mt-3 text-xs text-gray-600 bg-amber-50/40 p-2.5 rounded-lg border border-amber-100/60 italic line-clamp-2">
                            "{offer.message}"
                          </p>
                        )}
                      </div>

                      {/* Financial & Volume Metrics + Action */}
                      <div className="mt-4 pt-3.5 border-t border-gray-100">
                        <div className="grid grid-cols-3 gap-2 bg-gray-50/70 p-3 rounded-xl border border-gray-100 text-xs">
                          <div>
                            <span className="text-gray-400 block text-[11px] font-medium uppercase">Offered Rate</span>
                            <span className="font-bold text-gray-900 text-sm mt-0.5 block">
                              ₹{Number(offer.offer_price).toLocaleString("en-IN")}{" "}
                              <span className="text-gray-400 font-normal text-xs">/ {offer.unit}</span>
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[11px] font-medium uppercase">Volume</span>
                            <span className="font-bold text-gray-900 text-sm mt-0.5 block">
                              {Number(offer.quantity).toLocaleString("en-IN")}{" "}
                              <span className="text-gray-400 font-normal text-xs">{offer.unit}</span>
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[11px] font-medium uppercase">Total Value</span>
                            <span className="font-bold text-emerald-700 text-sm mt-0.5 block">
                              ₹{estValue.toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3.5 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <MapPin size={12} className="shrink-0 text-gray-400" />
                            <span className="truncate">{offer.location || "Direct Delivery"}</span>
                          </div>
                          <Link to="/buyer/offers">
                            <Button size="xs" variant="outline" className="font-medium text-emerald-700 border-emerald-300 hover:bg-emerald-50 hover:border-emerald-400">
                              Action
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: Your Posted Requirements */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/60">
                  <ShoppingBasket size={18} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">
                    Active Requirements
                  </h2>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    Your current procurement listings visible to local farmers
                  </p>
                </div>
              </div>
              <Link
                to="/buyer/requirements"
                className="text-xs sm:text-sm font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 transition-colors"
              >
                Manage All <ArrowRight size={14} />
              </Link>
            </div>

            {requirements.length === 0 ? (
              <EmptyState
                icon={ShoppingBasket}
                title="You have not published any crop demand listings yet"
                description="Publish your procurement specifications to attract competitive lot bids directly from regional farmers."
                actionLabel="Publish First Requirement"
                onAction={() => window.location.assign("/buyer/requirements")}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                {requirements.slice(0, 3).map((req) => (
                  <Card
                    key={req.id}
                    className="p-5 border-gray-200/90 hover:border-gray-300 transition-all bg-white hover:shadow-xs flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <CropImage cropName={req.crop_name} size="xs" />
                          <h3 className="font-bold text-gray-900 text-base truncate" title={req.crop_name}>
                            {req.crop_name}
                          </h3>
                        </div>
                        <Badge variant={req.status === "open" ? "emerald" : "gray"} size="sm">
                          {req.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-xs space-y-2 text-gray-600 bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Demand Volume</span>
                          <span className="font-semibold text-gray-800">
                            {Number(req.quantity).toLocaleString("en-IN")} {req.unit}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Max Budget</span>
                          <span className="font-semibold text-emerald-700">
                            ₹{Number(req.max_price).toLocaleString("en-IN")} / {req.unit}
                          </span>
                        </div>
                        {req.quality_grade && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Quality Spec</span>
                            <span className="font-semibold text-gray-800">{req.quality_grade}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-gray-400 truncate">
                        <MapPin size={12} className="shrink-0" />
                        <span className="truncate">{req.location || "Direct Delivery"}</span>
                      </div>
                      <Link to="/buyer/requirements" className="text-emerald-600 hover:text-emerald-800 font-semibold text-xs shrink-0 ml-2">
                        View Details →
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default BuyerDashboard;
