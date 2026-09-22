import { useState, useEffect, useMemo, useRef, useContext } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  MapPin,
  Calendar,
  Package,
  ArrowRight,
  Send,
  CheckCircle2,
  Search,
  Filter,
  Check,
  AlertTriangle,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Modal } from "../components/ui/Modal";
import { EmptyState } from "../components/ui/EmptyState";
import { LoadingState } from "../components/ui/LoadingState";
import { CropImage } from "../components/ui/CropImage";
import { Avatar } from "../components/ui/Avatar";
import { animateStagger } from "../utils/animations";
import { api } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { BuyerProfileModal, resolveBuyerProfile } from "../components/BuyerProfileModal";
import { BuyerOfferDetailsModal } from "../components/BuyerOfferDetailsModal";
import { normalizeCropName } from "../utils/cropImageMap";

/**
 * Normalizes commercial metrics:
 * Safeguard 1: When normalizing buyer rates to a common unit (₹/quintal),
 * normalize the required quantity to the same unit before calculating:
 * Estimated Lot Value = Normalized Buyer Rate × Normalized Required Quantity.
 * Never compare or multiply mixed units.
 */
function getCommercialMetrics(req, marketPrices = []) {
  const rawPrice = req.max_price ? Number(req.max_price) : null;
  const rawQty = req.quantity ? Number(req.quantity) : 0;
  const rawUnit = (req.unit || "quintal").toLowerCase().trim();

  // 1. Normalize Rate & Quantity strictly to Quintals
  let ratePerQuintal = null;
  let qtyInQuintals = 0;

  if (rawUnit === "kg" || rawUnit === "kilogram") {
    // 1 quintal = 100 kg
    ratePerQuintal = rawPrice !== null ? rawPrice * 100 : null;
    qtyInQuintals = rawQty / 100;
  } else if (rawUnit === "ton" || rawUnit === "tonne") {
    // 1 ton = 10 quintals
    ratePerQuintal = rawPrice !== null ? rawPrice / 10 : null;
    qtyInQuintals = rawQty * 10;
  } else {
    // Standard baseline unit is quintal
    ratePerQuintal = rawPrice;
    qtyInQuintals = rawQty;
  }

  // Estimated Lot Value = Normalized Buyer Rate × Normalized Required Quantity
  const estimatedLotValue =
    ratePerQuintal !== null && qtyInQuintals > 0
      ? Math.round(ratePerQuintal * qtyInQuintals)
      : null;

  // 2. APMC Mandi Benchmark Match from market_prices (NOT Government MSP)
  const normalizedCrop = normalizeCropName(req.crop_name);
  const matchingPrice = marketPrices.find(
    (p) => normalizeCropName(p.crop_name).toLowerCase() === normalizedCrop.toLowerCase()
  );

  const apmcMinPrice = matchingPrice?.min_price ? Number(matchingPrice.min_price) : null;
  const apmcModalPrice = matchingPrice?.modal_price ? Number(matchingPrice.modal_price) : null;
  const apmcMaxPrice = matchingPrice?.max_price ? Number(matchingPrice.max_price) : null;
  const apmcMarketName = matchingPrice?.market_name || null;
  const apmcLocation = matchingPrice?.district
    ? `${matchingPrice.district}, ${matchingPrice.state || ""}`
    : null;

  // 3. Comparison with APMC Modal Price (authentic comparison where real data exists)
  let diffVsModal = null;
  if (ratePerQuintal !== null && apmcModalPrice !== null) {
    diffVsModal = ratePerQuintal - apmcModalPrice;
  }

  // 4. Ranking Score: Highest estimated commercial return
  let rankingScore = 0;
  if (ratePerQuintal !== null) {
    rankingScore = ratePerQuintal;
    // Positive premium over modal benchmark provides slight secondary ranking boost
    if (diffVsModal && diffVsModal > 0) {
      rankingScore += diffVsModal * 0.05;
    }
  }

  return {
    ratePerQuintal,
    qtyInQuintals,
    estimatedLotValue,
    apmcMinPrice,
    apmcModalPrice,
    apmcMaxPrice,
    apmcMarketName,
    apmcLocation,
    diffVsModal,
    rankingScore,
  };
}

export function Opportunities() {
  const { user } = useContext(AuthContext);

  const farmerOrigin =
    (user?.district && user?.state ? `${user.district}, ${user.state}` : null) ||
    (user?.village && user?.state ? `${user.village}, ${user.state}` : null) ||
    user?.location?.replace(" • ", ", ") ||
    (user?.id && localStorage.getItem(`kiran_location_${user.id}`)?.replace(" • ", ", ")) ||
    "Indore, Madhya Pradesh";

  // Data states
  const [requirements, setRequirements] = useState([]);
  const [marketPrices, setMarketPrices] = useState([]);
  const [myProduce, setMyProduce] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & View states
  const [viewMode, setViewMode] = useState("all"); // 'all' | 'listed'
  const [selectedCommodity, setSelectedCommodity] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Buyer Profile Modal
  const [selectedBuyerForProfile, setSelectedBuyerForProfile] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Opportunity Details Modal
  const [selectedOfferForDetails, setSelectedOfferForDetails] = useState(null);
  const [offerDetailsModalOpen, setOfferDetailsModalOpen] = useState(false);

  // Offer Submission Modal
  const [selectedBuyerForOffer, setSelectedBuyerForOffer] = useState(null);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerQuantity, setOfferQuantity] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [offerError, setOfferError] = useState("");
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [createdOfferData, setCreatedOfferData] = useState(null);

  const containerRef = useRef(null);

  // Fetch opportunities, mandi benchmarks, and farmer's listed produce
  const loadOpportunitiesData = async () => {
    try {
      setLoading(true);
      const [buyerRes, marketRes, prodRes] = await Promise.all([
        api.get("/api/buyer/requirements/open"),
        api.get("/api/market/prices"),
        api.get("/api/produce/my").catch(() => ({ produce: [] })),
      ]);

      setRequirements(buyerRes?.requirements || []);
      setMarketPrices(marketRes?.prices || []);
      setMyProduce(prodRes?.produce || []);
    } catch (err) {
      console.error("Failed to load opportunities data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpportunitiesData();
  }, []);

  // Inspect actual farmer produce status: only 'available' represents currently active/listed produce
  const activeListedCropNames = useMemo(() => {
    const activeLots = (myProduce || []).filter((p) => p.status === "available");
    return Array.from(
      new Set(activeLots.map((p) => normalizeCropName(p.crop_name)).filter(Boolean))
    );
  }, [myProduce]);

  // Process and enrich requirements with commercial valuation and profile resolution
  const processedOpportunities = useMemo(() => {
    return requirements.map((req) => {
      const metrics = getCommercialMetrics(req, marketPrices);
      const profile = resolveBuyerProfile(req);
      const isListedMatch = activeListedCropNames.some(
        (c) => c.toLowerCase() === normalizeCropName(req.crop_name).toLowerCase()
      );
      return {
        ...req,
        ...metrics,
        profile,
        isListedMatch,
      };
    });
  }, [requirements, marketPrices, activeListedCropNames]);

  // Unique commodities for the dropdown (alphabetically sorted from active opportunities)
  const availableCommodities = useMemo(() => {
    const crops = new Set(processedOpportunities.map((o) => normalizeCropName(o.crop_name)));
    return Array.from(crops).sort((a, b) => a.localeCompare(b));
  }, [processedOpportunities]);

  // Counts for the view mode switcher tabs
  const allOpportunitiesCount = processedOpportunities.length;
  const listedOpportunitiesCount = useMemo(() => {
    return processedOpportunities.filter((o) => o.isListedMatch).length;
  }, [processedOpportunities]);

  // Filter & Rank according to the explicit multi-layer rules
  const filteredAndRankedOpportunities = useMemo(() => {
    let list = [...processedOpportunities];

    // 1. View Mode Filter ("For Your Listed Crops")
    if (viewMode === "listed") {
      list = list.filter((opp) => opp.isListedMatch);
    }

    // 2. Commodity Dropdown Filter
    if (selectedCommodity !== "All") {
      list = list.filter(
        (opp) => normalizeCropName(opp.crop_name).toLowerCase() === selectedCommodity.toLowerCase()
      );
    }

    // 3. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((opp) => {
        const cropMatch = opp.crop_name?.toLowerCase().includes(q);
        const buyerMatch = opp.profile?.name?.toLowerCase().includes(q);
        const locMatch =
          opp.location?.toLowerCase().includes(q) ||
          opp.profile?.location?.toLowerCase().includes(q);
        return cropMatch || buyerMatch || locMatch;
      });
    }

    // 4. Rank by Best Estimated Commercial Return (Safeguard 1: strictly normalized)
    list.sort((a, b) => {
      // Priced opportunities rank above unpriced
      if (a.rankingScore > 0 && b.rankingScore === 0) return -1;
      if (b.rankingScore > 0 && a.rankingScore === 0) return 1;
      if (b.rankingScore !== a.rankingScore) {
        return b.rankingScore - a.rankingScore;
      }
      // Secondary tie-breaker: Estimated total lot value
      const valA = a.estimatedLotValue || 0;
      const valB = b.estimatedLotValue || 0;
      return valB - valA;
    });

    return list;
  }, [processedOpportunities, viewMode, selectedCommodity, searchQuery]);

  // Stagger animation on cards
  useEffect(() => {
    if (containerRef.current && !loading) {
      animateStagger(containerRef.current.querySelectorAll(".opp-card-anim"), {
        delay: 0.04,
      });
    }
  }, [loading, viewMode, selectedCommodity, searchQuery]);

  // Offer Submission Handler
  const handleSendOfferSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBuyerForOffer) return;

    setSubmittingOffer(true);
    setOfferError("");

    try {
      const payload = {
        requirement_id: selectedBuyerForOffer.id,
        offer_price: Number(offerPrice),
        quantity: Number(offerQuantity),
        message: offerMessage,
      };

      const res = await api.post("/api/offers", payload);
      setCreatedOfferData({
        offerId: res.offerId,
        buyerName: selectedBuyerForOffer.profile?.name || "Institutional Buyer",
        crop: selectedBuyerForOffer.crop_name,
        price: offerPrice,
        quantity: offerQuantity,
        unit: selectedBuyerForOffer.unit || "quintal",
      });

      setOfferModalOpen(false);
      setSuccessModalOpen(true);
    } catch (err) {
      setOfferError(err.message || "Failed to submit offer to buyer");
    } finally {
      setSubmittingOffer(false);
    }
  };

  return (
    <div ref={containerRef} className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Best Selling Opportunities Matrix
            </h1>
            <Badge variant="emerald" className="hidden sm:inline-flex">
              Live Mandi & Buyer Match
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Discover verified open procurement requirements ranked by the best estimated commercial return for your harvest.
          </p>
        </div>

        <Link to="/sell?action=new" state={{ newCrop: true }}>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 font-semibold shadow-xs shrink-0">
            List Fresh Produce Lot
          </Button>
        </Link>
      </div>

      {/* TOP CONTROL BAR: Commodity Dropdown + View Mode Switcher + Search */}
      <Card className="p-3.5 sm:p-4 border-gray-200/90 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          {/* Left Controls: Commodity Dropdown & View Mode Segmented Switcher */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Commodity Dropdown */}
            <div className="w-full sm:w-56">
              <Select
                value={selectedCommodity}
                onChange={(e) => setSelectedCommodity(e.target.value)}
                className="text-xs font-semibold py-2"
              >
                <option value="All">All Commodities ({allOpportunitiesCount})</option>
                {availableCommodities.map((crop) => (
                  <option key={crop} value={crop}>
                    {crop}
                  </option>
                ))}
              </Select>
            </div>

            {/* View Mode Segmented Controls */}
            <div className="inline-flex rounded-xl p-1 bg-gray-100/90 border border-gray-200 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "all"
                    ? "bg-white text-emerald-800 shadow-xs border border-gray-200/70"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                All Opportunities ({allOpportunitiesCount})
              </button>

              <button
                type="button"
                onClick={() => setViewMode("listed")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === "listed"
                    ? "bg-white text-emerald-800 shadow-xs border border-gray-200/70"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span>For Your Listed Crops</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    viewMode === "listed"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {listedOpportunitiesCount}
                </span>
              </button>
            </div>
          </div>

          {/* Right Controls: Quick Search Input */}
          <div className="w-full md:w-72">
            <Input
              placeholder="Search crop, buyer, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={Search}
              className="text-xs py-2"
            />
          </div>
        </div>

        {/* Active Farmer Produce Lots Banner when available */}
        {activeListedCropNames.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2 text-xs text-gray-600">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-emerald-800 flex items-center gap-1">
                <Sparkles size={13} className="text-emerald-600" />
                Active Listed Crops ({activeListedCropNames.length}):
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {activeListedCropNames.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setSelectedCommodity(c);
                      setViewMode("listed");
                    }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 transition-colors cursor-pointer"
                  >
                    <span>{c}</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedCommodity !== "All" && (
              <button
                type="button"
                onClick={() => setSelectedCommodity("All")}
                className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                Clear Commodity Filter
              </button>
            )}
          </div>
        )}
      </Card>

      {/* Main Content Area */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <LoadingState message="Calculating highest commercial return opportunities across mandis and verified buyers..." />
        </div>
      ) : filteredAndRankedOpportunities.length === 0 ? (
        viewMode === "listed" && activeListedCropNames.length === 0 ? (
          <EmptyState
            title="No Active Produce Lots Listed Yet"
            description="You currently have no available produce lots listed for sale. Publish your harvest lot in Sell Produce to unlock instant buyer matching."
            icon={ShoppingBag}
            actionLabel="List Produce Lot"
            onAction={() => window.location.assign("/sell?action=new")}
          />
        ) : (
          <EmptyState
            title="No Matching Opportunities Found"
            description="There are currently no open procurement requirements matching your selected commodity and filter criteria."
            icon={TrendingUp}
            actionLabel="Reset Filter"
            onAction={() => {
              setSelectedCommodity("All");
              setViewMode("all");
              setSearchQuery("");
            }}
          />
        )
      ) : (
        /* Opportunity Cards: EXACTLY 2 per row on desktop (grid-cols-1 lg:grid-cols-2) */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {filteredAndRankedOpportunities.map((opp, idx) => (
            <Card
              key={opp.id}
              className={`opp-card-anim border p-5 sm:p-6 transition-all duration-200 hover:shadow-md bg-white rounded-2xl flex flex-col justify-between space-y-4 ${
                idx === 0 && viewMode === "all"
                  ? "border-emerald-500/80 ring-1 ring-emerald-500/20"
                  : "border-gray-200/90 hover:border-emerald-400"
              }`}
            >
              {/* 1. TOP: Buyer Identity Row (Left) + Demand / Rank Badge (Right) */}
              <div className="flex items-start justify-between gap-3">
                {/* DECOUPLED BUYER IDENTITY: Clicking Buyer Avatar or Name opens ONLY BuyerProfileModal */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedBuyerForProfile(opp);
                    setProfileModalOpen(true);
                  }}
                  className="group flex items-start gap-3 cursor-pointer select-none min-w-0"
                  title="Click to view verified buyer profile"
                >
                  <Avatar
                    name={opp.profile.name}
                    src={opp.profile.avatar}
                    role="buyer"
                    size="md"
                    ring
                    className="ring-emerald-500/20 shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors text-sm sm:text-base truncate">
                        {opp.profile.name}
                      </h3>
                      <span className="text-emerald-600 shrink-0" title="Verified Buyer">
                        <CheckCircle2 size={14} />
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                      <MapPin size={12} className="text-gray-400 shrink-0" />
                      <span className="truncate">{opp.location || opp.profile.location}</span>
                    </p>
                  </div>
                </div>

                {/* Rank & Match Badges */}
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                  {opp.isListedMatch && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <Check size={12} /> Matches Listed Lot
                    </span>
                  )}
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      idx === 0 && viewMode === "all"
                        ? "bg-emerald-600 text-white shadow-2xs"
                        : "bg-gray-100 text-gray-700 border border-gray-200/80"
                    }`}
                  >
                    {idx === 0 && viewMode === "all" ? "★ #1 Top Return" : `Rank #${idx + 1}`}
                  </span>
                </div>
              </div>

              {/* 2. MAIN: Crop Photograph + Commodity Name + Quality Grade (Left) & Quoted Rate Box (Right) */}
              {/* DECOUPLED: Clicking this area opens ONLY BuyerOfferDetailsModal */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOfferForDetails(opp);
                  setOfferDetailsModalOpen(true);
                }}
                className="group/crop flex items-center justify-between gap-4 p-3.5 rounded-xl bg-gray-50/70 hover:bg-emerald-50/40 border border-gray-100 hover:border-emerald-200 transition-all cursor-pointer"
                title="Click to view complete opportunity & commercial specs"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <CropImage
                    crop={opp.crop_name}
                    size="lot"
                    className="rounded-xl shadow-xs shrink-0 border border-gray-200 group-hover/crop:scale-105 transition-transform"
                  />
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-lg sm:text-xl font-black text-gray-900 group-hover/crop:text-emerald-700 transition-colors">
                        {opp.crop_name}
                      </h4>
                      {opp.quality_grade && (
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                          {opp.quality_grade}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Req #{opp.id} • Direct Procurement Contract
                    </p>
                  </div>
                </div>

                {/* Quoted Rate / Ceiling Block */}
                <div className="text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                    Buyer Ceiling Rate
                  </span>
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-xl sm:text-2xl font-black text-emerald-700">
                      {opp.max_price ? `₹${Number(opp.max_price).toLocaleString()}` : "Open Rate"}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">
                      / {opp.unit || "quintal"}
                    </span>
                  </div>
                  {opp.estimatedLotValue && (
                    <span className="text-[11px] font-semibold text-gray-600 block mt-0.5">
                      Est. Value: ₹{opp.estimatedLotValue.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* 3. SECONDARY 4-METRICS GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-2 text-xs border-y border-gray-100">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                    Session / Need By
                  </span>
                  <span className="font-semibold text-gray-800 flex items-center gap-1 mt-0.5">
                    <Calendar size={12} className="text-emerald-600 shrink-0" />
                    {opp.required_by ? opp.required_by.split("T")[0] : "Prompt Dispatch"}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                    Available Volume
                  </span>
                  <span className="font-semibold text-gray-800 flex items-center gap-1 mt-0.5">
                    <Package size={12} className="text-emerald-600 shrink-0" />
                    {opp.quantity ? `${opp.quantity} ${opp.unit || "q"}` : "Any Quantity"}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold" title="Official Government MSP">
                    MSP Status
                  </span>
                  <span className="font-semibold text-gray-500 mt-0.5 block">
                    MSP Unavailable
                  </span>
                  {opp.apmcMinPrice && (
                    <span className="text-[10px] text-gray-500 block mt-0.5 font-medium">
                      APMC Min: ₹{opp.apmcMinPrice.toLocaleString()}/q
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                    Estimated Return
                  </span>
                  <span className="font-bold text-emerald-800 mt-0.5 block">
                    {opp.ratePerQuintal ? `₹${opp.ratePerQuintal.toLocaleString()}/q` : "Open"}
                  </span>
                  {opp.diffVsModal !== null ? (
                    <span
                      className={`text-[10px] font-bold block mt-0.5 ${
                        opp.diffVsModal >= 0 ? "text-emerald-700" : "text-amber-700"
                      }`}
                    >
                      {opp.diffVsModal > 0
                        ? `+₹${opp.diffVsModal.toLocaleString()}/q vs Mandi`
                        : opp.diffVsModal < 0
                        ? `-₹${Math.abs(opp.diffVsModal).toLocaleString()}/q vs Mandi`
                        : "Matches Mandi benchmark"}
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      Benchmark pending
                    </span>
                  )}
                </div>
              </div>

              {/* 4. BOTTOM ACTIONS: Submit Offer (Primary) & View Details (Secondary) */}
              <div className="flex items-center justify-between gap-2.5 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs font-semibold text-gray-700 hover:text-emerald-700 hover:border-emerald-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedOfferForDetails(opp);
                    setOfferDetailsModalOpen(true);
                  }}
                >
                  View Details
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  icon={Send}
                  className="text-xs font-bold shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedBuyerForOffer(opp);
                    setOfferPrice(opp.max_price || (opp.ratePerQuintal ? String(opp.ratePerQuintal) : ""));
                    setOfferQuantity(opp.quantity || "");
                    setOfferMessage("");
                    setOfferError("");
                    setOfferModalOpen(true);
                  }}
                >
                  Submit Offer to Buyer
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* MODAL 1: Buyer Profile Modal */}
      <BuyerProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        requirement={selectedBuyerForProfile}
        onSendOffer={(req) => {
          setProfileModalOpen(false);
          setSelectedBuyerForOffer(req);
          setOfferPrice(req.max_price || "");
          setOfferQuantity(req.quantity || "");
          setOfferMessage("");
          setOfferError("");
          setOfferModalOpen(true);
        }}
      />

      {/* MODAL 2: Buyer Offer / Opportunity Details Modal */}
      <BuyerOfferDetailsModal
        isOpen={offerDetailsModalOpen}
        onClose={() => setOfferDetailsModalOpen(false)}
        requirement={selectedOfferForDetails}
        farmerOrigin={farmerOrigin}
        onSendProposal={(req) => {
          setOfferDetailsModalOpen(false);
          setSelectedBuyerForOffer(req);
          setOfferPrice(req.max_price || "");
          setOfferQuantity(req.quantity || "");
          setOfferMessage("");
          setOfferError("");
          setOfferModalOpen(true);
        }}
        sendActionLabel="Submit Offer to Buyer"
      />

      {/* MODAL 3: Submit Offer Proposal Modal */}
      {offerModalOpen && selectedBuyerForOffer && (
        <Modal
          isOpen={offerModalOpen}
          onClose={() => setOfferModalOpen(false)}
          title={`Submit Offer to ${selectedBuyerForOffer.profile?.name || "Buyer"}`}
          subtitle={`Opportunity Req #${selectedBuyerForOffer.id} • ${selectedBuyerForOffer.crop_name}`}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleSendOfferSubmit} className="space-y-4">
            {offerError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle size={14} className="shrink-0" />
                <span>{offerError}</span>
              </div>
            )}

            {/* Target Crop Reference Card */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
              <div className="flex items-center gap-3">
                <CropImage
                  crop={selectedBuyerForOffer.crop_name}
                  size="sm"
                  className="rounded-lg shadow-2xs border border-gray-200"
                />
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">
                    {selectedBuyerForOffer.crop_name}
                  </h4>
                  <p className="text-xs text-gray-500">
                    Grade: {selectedBuyerForOffer.quality_grade || "Grade A"} • Target:{" "}
                    {selectedBuyerForOffer.quantity} {selectedBuyerForOffer.unit || "quintal"}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-gray-400 block uppercase font-bold">
                  Ceiling Rate
                </span>
                <span className="font-bold text-emerald-700 text-sm">
                  {selectedBuyerForOffer.max_price
                    ? `₹${Number(selectedBuyerForOffer.max_price).toLocaleString()} / ${selectedBuyerForOffer.unit || "q"}`
                    : "Open Rate"}
                </span>
              </div>
            </div>

            {/* Input: Offer Price */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Proposed Price (₹ per {selectedBuyerForOffer.unit || "quintal"}) *
              </label>
              <Input
                type="number"
                step="any"
                required
                placeholder="Enter your proposed rate per unit"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
              />
            </div>

            {/* Input: Offer Quantity */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Quantity Available ({selectedBuyerForOffer.unit || "quintal"}) *
              </label>
              <Input
                type="number"
                step="any"
                required
                placeholder="Enter quantity you can supply"
                value={offerQuantity}
                onChange={(e) => setOfferQuantity(e.target.value)}
              />
            </div>

            {/* Calculated Total Payout Preview */}
            {offerPrice && offerQuantity && (
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                <span className="font-semibold">Calculated Total Deal Value:</span>
                <span className="font-black text-sm text-emerald-800">
                  ₹{(Number(offerPrice) * Number(offerQuantity)).toLocaleString()}
                </span>
              </div>
            )}

            {/* Input: Custom Message */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Message / Dispatch Notes (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="E.g., Freshly harvested lot ready for prompt dispatch at farm gate..."
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                className="w-full text-xs rounded-xl border border-gray-300 p-2.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>

            {/* Modal Controls */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOfferModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon={Send}
                loading={submittingOffer}
              >
                Confirm & Submit Offer
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 4: Offer Submission Success Confirmation */}
      {successModalOpen && createdOfferData && (
        <Modal
          isOpen={successModalOpen}
          onClose={() => setSuccessModalOpen(false)}
          title="Commercial Offer Successfully Sent!"
          subtitle={`Offer ID #${createdOfferData.offerId || "101"} has been transmitted to ${createdOfferData.buyerName}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-center py-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 size={28} />
            </div>

            <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 text-xs space-y-1.5 text-left">
              <div className="flex justify-between">
                <span className="text-gray-500">Recipient:</span>
                <span className="font-bold text-gray-900">{createdOfferData.buyerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Crop:</span>
                <span className="font-bold text-gray-900">{createdOfferData.crop}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Proposed Rate:</span>
                <span className="font-bold text-emerald-700">
                  ₹{Number(createdOfferData.price).toLocaleString()} / {createdOfferData.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Supplied Volume:</span>
                <span className="font-bold text-gray-900">
                  {createdOfferData.quantity} {createdOfferData.unit}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              The buyer will be notified of your proposal. You can track buyer responses, counter-offers, and legal contracts directly from your Offers dashboard.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSuccessModalOpen(false)}
              >
                Close
              </Button>
              <Link to="/offers">
                <Button variant="primary" size="sm" icon={ArrowRight}>
                  View in My Offers
                </Button>
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Opportunities;