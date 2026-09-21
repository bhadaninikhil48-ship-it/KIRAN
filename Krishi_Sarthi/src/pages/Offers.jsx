import { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  MessageSquare,
  Clock,
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Send,
  Search,
  RotateCcw,
  Calendar,
  Package,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";
import { CropImage } from "../components/ui/CropImage";
import { EmptyState } from "../components/ui/EmptyState";
import { LoadingState } from "../components/ui/LoadingState";
import { BuyerProfileModal, resolveBuyerProfile } from "../components/BuyerProfileModal";
import { animateStagger } from "../utils/animations";
import { api } from "../services/api";

/**
 * Calculates effective status:
 * - "accepted" | "rejected" | "negotiating" | "pending"
 */
export function getOfferEffectiveStatus(offer) {
  const rawStatus = (offer?.status || "pending").toLowerCase();
  if (rawStatus === "accepted") return "accepted";
  if (rawStatus === "rejected" || rawStatus === "cancelled") return "rejected";
  if (Number(offer?.negotiation_count || 0) > 0) return "negotiating";
  return "pending";
}

/**
 * Calculates direction:
 * - "received" (Received from Buyer: buyer counter-offer or buyer-initiated inquiry)
 * - "sent" (Sent by You: farmer's proposal awaiting response)
 */
export function getOfferDirection(offer) {
  if (
    offer?.initiator === "buyer" ||
    offer?.latest_sender_role === "buyer" ||
    offer?.direction === "received"
  ) {
    return "received";
  }
  return "sent";
}

/**
 * Validates date range against offer submission date
 */
function matchesDateFilter(dateStr, filterKey, customStart, customEnd) {
  if (!filterKey || filterKey === "all") return true;
  if (!dateStr) return false;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;
  const now = new Date();

  if (filterKey === "today") {
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  }

  if (filterKey === "7days") {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return date >= sevenDaysAgo && date <= now;
  }

  if (filterKey === "30days") {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return date >= thirtyDaysAgo && date <= now;
  }

  if (filterKey === "thisMonth") {
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
    );
  }

  if (filterKey === "lastMonth") {
    const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const yearOfLastMonth =
      now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    return (
      date.getFullYear() === yearOfLastMonth &&
      date.getMonth() === lastMonth
    );
  }

  if (filterKey === "custom") {
    if (!customStart && !customEnd) return true;
    const start = customStart ? new Date(customStart + "T00:00:00") : new Date(0);
    const end = customEnd
      ? new Date(customEnd + "T23:59:59")
      : new Date(8640000000000000);
    return date >= start && date <= end;
  }

  return true;
}

export function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Unified Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cropFilter, setCropFilter] = useState("all");
  const [offerTypeFilter, setOfferTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Decoupled Modals State
  const [selectedBuyerForProfile, setSelectedBuyerForProfile] = useState(null);
  const [selectedOfferForDetail, setSelectedOfferForDetail] = useState(null);

  // Negotiation Modal State
  const [activeOffer, setActiveOffer] = useState(null);
  const [negotiations, setNegotiations] = useState([]);
  const [loadingNegotiations, setLoadingNegotiations] = useState(false);
  const [counterPrice, setCounterPrice] = useState("");
  const [counterQuantity, setCounterQuantity] = useState("");
  const [counterMessage, setCounterMessage] = useState("");
  const [submittingCounter, setSubmittingCounter] = useState(false);
  const [counterError, setCounterError] = useState("");

  const containerRef = useRef(null);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const data = await api.get("/api/offers/my");
      setOffers(data?.offers || []);
    } catch (err) {
      console.error("Failed to load offers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    if (containerRef.current && !loading) {
      animateStagger(containerRef.current.querySelectorAll(".offer-card-anim"), {
        delay: 0.04,
      });
    }
  }, [loading, statusFilter, cropFilter, offerTypeFilter, dateFilter, sortBy, searchQuery]);

  // Dynamic list of unique crops from real offer data
  const dynamicCropOptions = useMemo(() => {
    const set = new Set();
    offers.forEach((o) => {
      if (o.crop_name) set.add(o.crop_name.trim());
    });
    return Array.from(set).sort();
  }, [offers]);

  // Dynamic real counts
  const counts = useMemo(() => {
    const c = {
      all: offers.length,
      pending: 0,
      negotiating: 0,
      accepted: 0,
      rejected: 0,
      received: 0,
      sent: 0,
    };
    offers.forEach((o) => {
      const effStatus = getOfferEffectiveStatus(o);
      if (c[effStatus] !== undefined) c[effStatus] += 1;
      const dir = getOfferDirection(o);
      if (dir === "received") c.received += 1;
      else c.sent += 1;
    });
    return c;
  }, [offers]);

  // Filtering & Sorting
  const filteredAndSortedOffers = useMemo(() => {
    return offers
      .filter((o) => {
        // Search Query (Buyer Name, Crop Name, Offer ID)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const buyerMatch = (o.buyer_name || "").toLowerCase().includes(q);
          const cropMatch = (o.crop_name || "").toLowerCase().includes(q);
          const idMatch =
            String(o.id).includes(q) || `#ks-offer-${o.id}`.toLowerCase().includes(q);
          if (!buyerMatch && !cropMatch && !idMatch) return false;
        }

        // Status Filter
        if (statusFilter !== "all") {
          const effStatus = getOfferEffectiveStatus(o);
          if (effStatus !== statusFilter) return false;
        }

        // Crop Filter
        if (cropFilter !== "all") {
          if ((o.crop_name || "").toLowerCase() !== cropFilter.toLowerCase()) {
            return false;
          }
        }

        // Offer Type Filter (Received vs Sent)
        if (offerTypeFilter !== "all") {
          const dir = getOfferDirection(o);
          if (dir !== offerTypeFilter) return false;
        }

        // Date Filter
        if (
          !matchesDateFilter(
            o.created_at,
            dateFilter,
            customStartDate,
            customEndDate
          )
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        }
        if (sortBy === "oldest") {
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        }
        if (sortBy === "rate_high") {
          const rateA = Number(a.latest_counter_price || a.offer_price || 0);
          const rateB = Number(b.latest_counter_price || b.offer_price || 0);
          return rateB - rateA;
        }
        if (sortBy === "rate_low") {
          const rateA = Number(a.latest_counter_price || a.offer_price || 0);
          const rateB = Number(b.latest_counter_price || b.offer_price || 0);
          return rateA - rateB;
        }
        if (sortBy === "qty_high") {
          const qtyA = Number(a.latest_counter_quantity || a.quantity || 0);
          const qtyB = Number(b.latest_counter_quantity || b.quantity || 0);
          return qtyB - qtyA;
        }
        return 0;
      });
  }, [
    offers,
    searchQuery,
    statusFilter,
    cropFilter,
    offerTypeFilter,
    dateFilter,
    customStartDate,
    customEndDate,
    sortBy,
  ]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    statusFilter !== "all" ||
    cropFilter !== "all" ||
    offerTypeFilter !== "all" ||
    dateFilter !== "all" ||
    sortBy !== "newest";

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setCropFilter("all");
    setOfferTypeFilter("all");
    setDateFilter("all");
    setCustomStartDate("");
    setCustomEndDate("");
    setSortBy("newest");
  };

  // Open Negotiation Modal
  const handleOpenNegotiate = async (offer) => {
    setActiveOffer(offer);
    setCounterPrice(offer.latest_counter_price || offer.offer_price || "");
    setCounterQuantity(offer.latest_counter_quantity || offer.quantity || "");
    setCounterMessage("");
    setCounterError("");

    try {
      setLoadingNegotiations(true);
      const res = await api.get(`/api/negotiations/${offer.id}`);
      setNegotiations(res?.negotiations || []);
    } catch (err) {
      console.error("Failed to load negotiations:", err);
      setNegotiations([]);
    } finally {
      setLoadingNegotiations(false);
    }
  };

  const handleCounterSubmit = async (e) => {
    e.preventDefault();
    if (!activeOffer) return;

    setSubmittingCounter(true);
    setCounterError("");

    try {
      await api.post("/api/negotiations", {
        offerId: activeOffer.id,
        price: Number(counterPrice),
        quantity: Number(counterQuantity),
        message: counterMessage,
      });

      // Refresh negotiation history & offers
      const res = await api.get(`/api/negotiations/${activeOffer.id}`);
      setNegotiations(res?.negotiations || []);
      setCounterMessage("");
      fetchOffers();
    } catch (err) {
      setCounterError(err.message || "Failed to submit counter offer");
    } finally {
      setSubmittingCounter(false);
    }
  };

  return (
    <div ref={containerRef} className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              My Offers & Negotiations
            </h1>
            <Badge variant="emerald" dot>
              Commercial Hub
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Review incoming buyer proposals, manage counter-negotiations, and track your submitted farmgate offers.
          </p>
        </div>

        <Link to="/buyers">
          <Button size="sm" variant="primary" icon={ArrowRight}>
            Find & Match Buyers
          </Button>
        </Link>
      </div>

      {/* Prominent Quick-Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-gray-200/90 shadow-2xs space-y-0.5">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
            Total Offers
          </span>
          <p className="text-2xl font-black text-gray-900">{counts.all}</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-blue-200/80 shadow-2xs space-y-0.5">
          <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block">
            From Buyers
          </span>
          <p className="text-2xl font-black text-blue-700">{counts.received}</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-amber-200/80 shadow-2xs space-y-0.5">
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">
            Negotiating / Active
          </span>
          <p className="text-2xl font-black text-amber-700">
            {counts.negotiating + counts.pending}
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-emerald-200/80 shadow-2xs space-y-0.5">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
            Accepted Deals
          </span>
          <p className="text-2xl font-black text-emerald-700">{counts.accepted}</p>
        </div>
      </div>

      {/* Unified Search + Filter System (Replaces old static tabs) */}
      <Card className="p-4 sm:p-5 border-gray-200/90 shadow-2xs space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Buyer name, Crop commodity, or Offer ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-semibold px-1.5 py-0.5 rounded cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* 5 Dropdown Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">
              Status
            </label>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "all", label: `All Statuses (${counts.all})` },
                { value: "pending", label: `Pending (${counts.pending})` },
                { value: "negotiating", label: `Negotiating (${counts.negotiating})` },
                { value: "accepted", label: `Accepted (${counts.accepted})` },
                { value: "rejected", label: `Rejected (${counts.rejected})` },
              ]}
              className="text-xs"
            />
          </div>

          {/* Crop Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">
              Crop
            </label>
            <Select
              value={cropFilter}
              onChange={(e) => setCropFilter(e.target.value)}
              options={[
                { value: "all", label: "All Crops" },
                ...dynamicCropOptions.map((c) => ({ value: c, label: c })),
              ]}
              className="text-xs"
            />
          </div>

          {/* Offer Type Filter (Direction) */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">
              Offer Type
            </label>
            <Select
              value={offerTypeFilter}
              onChange={(e) => setOfferTypeFilter(e.target.value)}
              options={[
                { value: "all", label: `All Offers (${counts.all})` },
                { value: "received", label: `Received from Buyers (${counts.received})` },
                { value: "sent", label: `Sent by Me (${counts.sent})` },
              ]}
              className="text-xs"
            />
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">
              Date Filter
            </label>
            <Select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              options={[
                { value: "all", label: "All Time" },
                { value: "today", label: "Today" },
                { value: "7days", label: "Last 7 Days" },
                { value: "30days", label: "Last 30 Days" },
                { value: "thisMonth", label: "This Month" },
                { value: "lastMonth", label: "Last Month" },
                { value: "custom", label: "Custom Range..." },
              ]}
              className="text-xs"
            />
          </div>

          {/* Sort Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">
              Sort By
            </label>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={[
                { value: "newest", label: "Newest First" },
                { value: "oldest", label: "Oldest First" },
                { value: "rate_high", label: "Highest Offer Rate" },
                { value: "rate_low", label: "Lowest Offer Rate" },
                { value: "qty_high", label: "Highest Quantity" },
              ]}
              className="text-xs"
            />
          </div>
        </div>

        {/* Custom Date Pickers (Conditional) */}
        {dateFilter === "custom" && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 flex-wrap">
            <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
              <Calendar size={13} className="text-emerald-600" /> Date Range:
            </span>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="text-xs p-1.5 bg-white border border-gray-300 rounded-lg text-gray-800"
              />
              <span className="text-xs text-gray-400">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="text-xs p-1.5 bg-white border border-gray-300 rounded-lg text-gray-800"
              />
            </div>
          </div>
        )}

        {/* Active Filter State Summary & Reset */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100 flex-wrap gap-2">
          <span>
            Showing <strong>{filteredAndSortedOffers.length}</strong> of{" "}
            <strong>{offers.length}</strong> total offers
          </span>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer hover:underline"
            >
              <RotateCcw size={13} />
              Reset All Filters
            </button>
          )}
        </div>
      </Card>

      {/* Offers Grid: EXACTLY 2 per row on Desktop (lg:grid-cols-2) and 1 on Mobile */}
      {loading ? (
        <div className="min-h-[35vh] flex items-center justify-center">
          <LoadingState message="Fetching your real-time offers and negotiations..." />
        </div>
      ) : filteredAndSortedOffers.length === 0 ? (
        <EmptyState
          title="No Matching Offers Found"
          description={
            hasActiveFilters
              ? "No offers match your selected filter criteria. Try broadening your filters or clearing search terms."
              : "You have not submitted or received any commercial crop offers yet. Browse open buyer demands to initiate proposals."
          }
          icon={FileText}
          action={
            hasActiveFilters ? (
              <Button size="sm" variant="outline" onClick={handleResetFilters}>
                Clear All Filters
              </Button>
            ) : (
              <Link to="/buyers">
                <Button size="sm" variant="primary">
                  Browse Buyer Demands
                </Button>
              </Link>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          {filteredAndSortedOffers.map((o) => {
            const effStatus = getOfferEffectiveStatus(o);
            const direction = getOfferDirection(o);
            const isReceived = direction === "received";
            const isAccepted = effStatus === "accepted";
            const isNegotiating = effStatus === "negotiating";

            // Resolve buyer profile using real KIRAN buyer metadata & avatar resolver
            const buyerProfile = resolveBuyerProfile({
              buyer_id: o.buyer_id,
              id: o.buyer_id || o.id,
              buyer_name: o.buyer_name,
              location: o.location,
            });

            // Effective rate and volume (factoring latest negotiation counter if active)
            const activeRate = Number(
              o.latest_counter_price || o.offer_price || 0
            );
            const activeQty = Number(
              o.latest_counter_quantity || o.quantity || 0
            );
            const totalValue = Math.round(
              activeRate * (o.unit === "quintal" ? activeQty : activeQty / 100)
            );

            return (
              <Card
                key={o.id}
                className="offer-card-anim border-gray-200/90 hover:border-emerald-300 p-5 space-y-4 transition-all shadow-2xs flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Card Top Header: Direction Badge + Offer ID + Status Badge */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isReceived ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 shadow-2xs">
                          <ArrowDownLeft size={13} className="text-blue-600" />
                          Received from Buyer
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                          <ArrowUpRight size={13} className="text-emerald-600" />
                          Sent by You
                        </span>
                      )}

                      <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        #KS-OFFER-{o.id}
                      </span>
                    </div>

                    <StatusBadge
                      status={
                        isNegotiating
                          ? "Negotiating"
                          : o.status
                          ? o.status.toUpperCase()
                          : "PENDING"
                      }
                    />
                  </div>

                  {/* BUYER IDENTITY ROW (Decoupled: Clicking Buyer Avatar or Name opens ONLY BuyerProfileModal) */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/90 border border-gray-200/80">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Buyer Profile Avatar (Clickable) */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBuyerForProfile(o);
                        }}
                        className="cursor-pointer shrink-0"
                        title={`View ${buyerProfile.name}'s verified profile`}
                      >
                        <Avatar
                          name={buyerProfile.name}
                          src={buyerProfile.avatar}
                          role="buyer"
                          size="lg"
                          ring
                          className="ring-blue-500/20 shadow-2xs hover:scale-105 transition-transform"
                        />
                      </div>

                      {/* Buyer Name & Location (Clickable) */}
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBuyerForProfile(o);
                          }}
                          className="text-left font-bold text-gray-900 hover:text-emerald-700 text-base sm:text-lg truncate block hover:underline cursor-pointer leading-snug"
                        >
                          {buyerProfile.name}
                        </button>

                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                          <MapPin size={12} className="text-emerald-600 shrink-0" />
                          <span className="truncate">
                            {buyerProfile.location || "Delivery Point on Record"}
                          </span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBuyerForProfile(o);
                      }}
                      className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-2xs hover:bg-emerald-50 shrink-0 cursor-pointer hidden sm:inline-block"
                    >
                      Buyer Profile →
                    </button>
                  </div>

                  {/* CROP & COMMERCIAL TERMS BOX (Decoupled: Clicking opens ONLY OfferDetailModal) */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOfferForDetail(o);
                    }}
                    className="bg-white hover:bg-emerald-50/20 border border-gray-200 hover:border-emerald-300 rounded-xl p-3.5 sm:p-4 transition-all cursor-pointer space-y-3 shadow-2xs"
                    title="Click to inspect complete crop & offer details"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      {/* Real Natural Crop Photograph + Commodity Info */}
                      <div className="flex items-center gap-3">
                        <CropImage
                          crop={o.crop_name}
                          size="card"
                          className="rounded-xl shadow-xs shrink-0 border border-gray-200"
                        />
                        <div>
                          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                            Commodity & Grade
                          </span>
                          <h4 className="font-extrabold text-gray-900 text-base sm:text-lg leading-snug">
                            {o.crop_name}
                          </h4>
                          <span className="inline-block text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded mt-0.5">
                            {o.quality_grade || "Grade A"}
                          </span>
                        </div>
                      </div>

                      {/* Offered Rate Banner */}
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                          {isNegotiating ? "Current Negotiated Rate" : "Offered Rate"}
                        </span>
                        <div className="flex items-baseline justify-end gap-1 mt-0.5">
                          <span className="text-2xl sm:text-3xl font-black text-emerald-700">
                            ₹{activeRate.toLocaleString()}
                          </span>
                          <span className="text-xs font-semibold text-gray-500">
                            / {o.unit || "unit"}
                          </span>
                        </div>
                        {o.max_price && (
                          <span className="text-[11px] text-gray-400 block mt-0.5">
                            Buyer ceiling: ₹{Number(o.max_price).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 3-Box Supply Volume & Total Value Grid */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-xs">
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                          Supply Volume
                        </span>
                        <span className="font-bold text-gray-900 text-sm mt-0.5 block">
                          {activeQty} {o.unit}
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                          Est. Total Value
                        </span>
                        <span className="font-bold text-emerald-700 text-sm mt-0.5 block">
                          ₹{totalValue.toLocaleString()}
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                          Submitted Date
                        </span>
                        <span className="font-semibold text-gray-700 flex items-center gap-1 mt-1">
                          <Clock size={12} className="text-gray-400 shrink-0" />
                          <span className="truncate">
                            {o.created_at
                              ? new Date(o.created_at).toLocaleDateString()
                              : "Recent"}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Note / Latest Negotiation Callout */}
                    {o.latest_counter_message ? (
                      <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-xs space-y-0.5">
                        <span className="font-bold text-amber-900 flex items-center gap-1">
                          <MessageSquare size={12} className="text-amber-700" />
                          Latest Counter Message:
                        </span>
                        <p className="text-amber-800 italic">
                          "{o.latest_counter_message}"
                        </p>
                      </div>
                    ) : o.message ? (
                      <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-xs space-y-0.5">
                        <span className="font-semibold text-gray-700">Proposal note:</span>
                        <p className="text-gray-600 truncate">{o.message}</p>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* CARD FOOTER ACTIONS */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
                  {/* Left: View Details button (Opens OfferDetailModal) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOfferForDetail(o);
                    }}
                    className="text-xs font-semibold text-gray-600 hover:text-emerald-700 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    View Offer Details →
                  </button>

                  {/* Right Action Controls */}
                  <div className="flex items-center gap-2">
                    {isAccepted ? (
                      <Link to="/transactions">
                        <Button size="sm" variant="primary" icon={ArrowRight}>
                          View in Transactions
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        size="sm"
                        variant={isNegotiating ? "primary" : "secondary"}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenNegotiate(o);
                        }}
                        icon={MessageSquare}
                      >
                        {isNegotiating
                          ? "Negotiation History / Counter"
                          : "Counter / Negotiate"}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* MODAL 1: BUYER PROFILE MODAL (Opened strictly by clicking buyer avatar/name) */}
      {selectedBuyerForProfile && (
        <BuyerProfileModal
          isOpen={Boolean(selectedBuyerForProfile)}
          onClose={() => setSelectedBuyerForProfile(null)}
          requirement={{
            buyer_id: selectedBuyerForProfile.buyer_id,
            id: selectedBuyerForProfile.buyer_id || selectedBuyerForProfile.id,
            buyer_name: selectedBuyerForProfile.buyer_name,
            location: selectedBuyerForProfile.location,
            crop_name: selectedBuyerForProfile.crop_name,
          }}
        />
      )}

      {/* MODAL 2: OFFER / CROP / TRANSACTION DETAILS MODAL (Opened strictly by clicking crop/offer section) */}
      {selectedOfferForDetail && (
        <Modal
          isOpen={Boolean(selectedOfferForDetail)}
          onClose={() => setSelectedOfferForDetail(null)}
          title={`${selectedOfferForDetail.crop_name} — Offer & Consignment Details`}
          subtitle={`Offer ID #KS-OFFER-${selectedOfferForDetail.id} • ${
            getOfferDirection(selectedOfferForDetail) === "received"
              ? "Received from Buyer"
              : "Sent by You"
          }`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-5">
            {/* Top Crop & Status Banner */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 via-white to-blue-50 rounded-2xl border border-gray-200">
              <div className="flex items-center gap-3.5 min-w-0">
                <CropImage
                  crop={selectedOfferForDetail.crop_name}
                  size="lot"
                  className="rounded-xl shadow-xs shrink-0 border border-emerald-200"
                />
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                    Commodity Specification
                  </span>
                  <h3 className="font-extrabold text-gray-900 text-lg sm:text-xl truncate">
                    {selectedOfferForDetail.crop_name}
                  </h3>
                  <span className="inline-block text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded mt-0.5">
                    {selectedOfferForDetail.quality_grade || "Grade A"}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <StatusBadge
                  status={
                    getOfferEffectiveStatus(selectedOfferForDetail) ===
                    "negotiating"
                      ? "Negotiating"
                      : selectedOfferForDetail.status
                      ? selectedOfferForDetail.status.toUpperCase()
                      : "PENDING"
                  }
                />
              </div>
            </div>

            {/* Commercial Terms Breakdown */}
            <div className="bg-gray-50/90 rounded-xl p-4 border border-gray-200 space-y-3 text-xs sm:text-sm">
              <h4 className="font-bold text-gray-800 uppercase tracking-wider text-xs">
                Agreed Commercial Terms
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-gray-400 block text-xs">Offered Unit Rate:</span>
                  <span className="font-black text-emerald-700 text-lg block mt-0.5">
                    ₹{Number(selectedOfferForDetail.offer_price).toLocaleString()} /{" "}
                    {selectedOfferForDetail.unit}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block text-xs">Total Supply Volume:</span>
                  <span className="font-bold text-gray-900 text-lg block mt-0.5">
                    {Number(selectedOfferForDetail.quantity).toLocaleString()}{" "}
                    {selectedOfferForDetail.unit}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block text-xs">Total Commercial Payout:</span>
                  <span className="font-extrabold text-emerald-700 text-base block mt-0.5">
                    ₹{(
                      Number(selectedOfferForDetail.offer_price) *
                      (selectedOfferForDetail.unit === "quintal"
                        ? Number(selectedOfferForDetail.quantity)
                        : Number(selectedOfferForDetail.quantity) / 100)
                    ).toLocaleString()}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block text-xs">Buyer Price Ceiling:</span>
                  <span className="font-semibold text-gray-800 text-base block mt-0.5">
                    {selectedOfferForDetail.max_price
                      ? `₹${Number(selectedOfferForDetail.max_price).toLocaleString()} / ${selectedOfferForDetail.unit}`
                      : "Open"}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200/80 space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span className="text-gray-400">Target Delivery Hub:</span>
                  <span className="font-semibold text-gray-800">
                    {selectedOfferForDetail.location || "Delivery Point on Record"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Submission Date:</span>
                  <span className="font-semibold text-gray-800">
                    {selectedOfferForDetail.created_at
                      ? new Date(selectedOfferForDetail.created_at).toLocaleString()
                      : "Recent"}
                  </span>
                </div>
              </div>
            </div>

            {/* Proposal Note */}
            {selectedOfferForDetail.message && (
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs">
                <span className="font-bold text-emerald-900 block mb-0.5">
                  Proposal Message / Quality Specification:
                </span>
                <p className="text-gray-700">{selectedOfferForDetail.message}</p>
              </div>
            )}

            {/* Completed Deal Notice */}
            {selectedOfferForDetail.status === "accepted" && (
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Deal Accepted & Confirmed</span>
                </div>
                <p className="text-emerald-700">
                  This offer was successfully accepted. Consignment fulfillment, dispatch schedules, and escrow payment milestones are actively tracked in your Transactions pipeline.
                </p>
                <Link to="/transactions" className="inline-block pt-1">
                  <Button size="xs" variant="primary" icon={ExternalLink}>
                    Open Transactions Pipeline
                  </Button>
                </Link>
              </div>
            )}

            {/* Modal Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedOfferForDetail(null)}
              >
                Close
              </Button>

              <Button
                variant="secondary"
                size="sm"
                icon={MessageSquare}
                onClick={() => {
                  const target = selectedOfferForDetail;
                  setSelectedOfferForDetail(null);
                  handleOpenNegotiate(target);
                }}
              >
                Open Negotiation History
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 3: NEGOTIATION THREAD & COUNTER-OFFER MODAL */}
      {activeOffer && (
        <Modal
          isOpen={!!activeOffer}
          onClose={() => setActiveOffer(null)}
          title={`Negotiation Thread: #KS-OFFER-${activeOffer.id}`}
          subtitle={`Counterparty: ${activeOffer.buyer_name || "Buyer"} • ${activeOffer.crop_name}`}
        >
          <div className="space-y-4">
            {/* Commodity Summary Card */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
              <CropImage
                crop={activeOffer.crop_name}
                size="card"
                className="rounded-xl shadow-xs shrink-0 border border-gray-200"
              />
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                  Procurement Commodity
                </span>
                <p className="font-bold text-gray-900 text-sm truncate">
                  {activeOffer.crop_name}
                </p>
                <span className="text-xs text-emerald-700 font-semibold">
                  Active Rate: ₹{activeOffer.latest_counter_price || activeOffer.offer_price}/{activeOffer.unit} • Qty: {activeOffer.latest_counter_quantity || activeOffer.quantity} {activeOffer.unit}
                </span>
              </div>
            </div>

            {/* Negotiation History Stream */}
            <div className="max-h-60 overflow-y-auto space-y-3 p-1">
              {loadingNegotiations ? (
                <div className="py-4">
                  <LoadingState message="Fetching negotiation messages..." />
                </div>
              ) : negotiations.length === 0 ? (
                <div className="p-4 bg-gray-50 rounded-xl text-center text-xs text-gray-500">
                  No counter-offers exchanged yet. Initial proposal of ₹{activeOffer.offer_price} ({activeOffer.quantity} {activeOffer.unit}) is currently pending review.
                </div>
              ) : (
                negotiations.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl border text-xs sm:text-sm ${
                      n.sender_role === "farmer"
                        ? "bg-emerald-50/70 border-emerald-200 ml-4"
                        : "bg-blue-50/70 border-blue-200 mr-4"
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold mb-1">
                      <span
                        className={
                          n.sender_role === "farmer"
                            ? "text-emerald-800"
                            : "text-blue-800"
                        }
                      >
                        {n.sender_role === "farmer"
                          ? "🌾 You (Farmer)"
                          : `🏢 ${activeOffer.buyer_name || "Buyer"}`}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {n.created_at
                          ? new Date(n.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span>
                    </div>

                    <div className="font-bold text-gray-900 mb-1">
                      Proposed: ₹{n.price} / {activeOffer.unit || "unit"} • Volume: {n.quantity} {activeOffer.unit}
                    </div>

                    {n.message && <p className="text-gray-700">{n.message}</p>}
                  </div>
                ))
              )}
            </div>

            {/* Counter-Offer Form (Available when pending/negotiating) */}
            {activeOffer.status === "pending" && (
              <form
                onSubmit={handleCounterSubmit}
                className="pt-3 border-t border-gray-200 space-y-3"
              >
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Send Counter Proposal
                </h4>

                {counterError && (
                  <div className="p-2.5 rounded-lg bg-red-50 text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle size={15} />
                    <span>{counterError}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label={`Counter Price (₹)`}
                    type="number"
                    required
                    value={counterPrice}
                    onChange={(e) => setCounterPrice(e.target.value)}
                  />

                  <Input
                    label={`Quantity (${activeOffer.unit})`}
                    type="number"
                    required
                    value={counterQuantity}
                    onChange={(e) => setCounterQuantity(e.target.value)}
                  />
                </div>

                <div>
                  <Input
                    label="Message to Buyer"
                    placeholder="e.g. Can adjust to ₹28/kg for immediate lifting..."
                    value={counterMessage}
                    onChange={(e) => setCounterMessage(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setActiveOffer(null)}
                  >
                    Close
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={submittingCounter}
                    icon={Send}
                  >
                    Send Counter-Offer
                  </Button>
                </div>
              </form>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Offers;