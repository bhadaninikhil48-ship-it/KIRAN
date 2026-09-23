import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { CropImage } from "../../components/ui/CropImage";
import { LoadingState } from "../../components/ui/LoadingState";
import {
  Store,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Send,
  ShoppingBasket,
  ArrowRight,
  TrendingUp,
  Package,
  Search,
} from "lucide-react";

import { getEligibleLotsForRequirement } from "../../utils/lotUtils";

export { getEligibleLotsForRequirement };

export function FPOMarketplace() {
  const navigate = useNavigate();
  const [requirements, setRequirements] = useState([]);
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [buyerFilter, setBuyerFilter] = useState("all"); // 'all' | 'best' | 'for_lots'
  const [cropFilter, setCropFilter] = useState("all");

  // Bidding Modal State
  const [biddingReq, setBiddingReq] = useState(null);
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [offerSuccess, setOfferSuccess] = useState(null);
  const [bidForm, setBidForm] = useState({
    fpo_lot_id: "",
    offered_price: "",
    quantity: "",
    message: "",
  });

  const loadMarketplaceData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [reqRes, lotsRes] = await Promise.all([
        api.get("/api/fpo/marketplace/requirements"),
        api.get("/api/fpo/lots").catch(() => ({ lots: [] })),
      ]);

      setRequirements(reqRes.requirements || []);

      // Use /api/fpo/lots as primary source for lots (contains status, crop_name, total_quantity, unit)
      // Fallback to reqRes.eligible_lots if lotsRes returns empty
      const allLots = Array.isArray(lotsRes?.lots) && lotsRes.lots.length > 0
        ? lotsRes.lots
        : (Array.isArray(reqRes?.eligible_lots)
            ? reqRes.eligible_lots.map((l) => ({ ...l, status: l.status || "aggregated" }))
            : []);

      setLots(allLots);
    } catch (err) {
      console.error("Error loading marketplace data:", err);
      setError(err.message || "Failed to load buyer requirements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarketplaceData();
  }, []);

  // Open Bid Modal
  const handleOpenBid = (req) => {
    setBiddingReq(req);
    setError(null);
    setOfferSuccess(null);

    // Pick first eligible aggregated lot matching this requirement's crop
    const eligibleLots = getEligibleLotsForRequirement(req, lots);
    const firstEligible = eligibleLots.length > 0 ? eligibleLots[0] : null;

    setBidForm({
      fpo_lot_id: firstEligible ? String(firstEligible.id) : "",
      offered_price: req.max_price ? String(req.max_price) : (firstEligible?.expected_price ? String(firstEligible.expected_price) : ""),
      quantity: req.quantity ? String(req.quantity) : (firstEligible?.total_quantity ? String(firstEligible.total_quantity) : ""),
      message: `FPO Collective offer for ${req.crop_name} consignment.`,
    });
  };

  // Submit Offer
  const handleSubmitOffer = async (e) => {
    e.preventDefault();
    if (!biddingReq || !bidForm.fpo_lot_id) {
      setError("Please select an aggregated lot for this offer.");
      return;
    }

    const qty = parseFloat(bidForm.quantity);
    const price = parseFloat(bidForm.offered_price);

    if (isNaN(qty) || qty <= 0) {
      setError("Please enter a valid positive offer quantity.");
      return;
    }

    if (isNaN(price) || price <= 0) {
      setError("Please enter a valid positive offer price.");
      return;
    }

    try {
      setSubmittingOffer(true);
      setError(null);

      await api.post("/api/fpo/marketplace/offers", {
        requirement_id: biddingReq.id,
        fpo_lot_id: parseInt(bidForm.fpo_lot_id, 10),
        offered_price: price,
        quantity: qty,
        message: bidForm.message ? bidForm.message.trim() : null,
      });

      setOfferSuccess("Marketplace offer submitted successfully! The linked lot is now in 'offered' status.");
      await loadMarketplaceData();
      setTimeout(() => {
        setBiddingReq(null);
        navigate("/fpo/offers");
      }, 1500);
    } catch (err) {
      console.error("Error submitting offer:", err);
      setError(err.message || "Failed to submit offer.");
    } finally {
      setSubmittingOffer(false);
    }
  };

  // Dynamic list of unique crop names extracted from available open buyer requirements
  const dynamicCrops = useMemo(() => {
    const cropSet = new Set();
    requirements.forEach((req) => {
      const name = String(req.crop_name || "").trim();
      if (name) cropSet.add(name);
    });
    return Array.from(cropSet).sort((a, b) => a.localeCompare(b));
  }, [requirements]);

  // Set of normalized crop names that the FPO currently has active/listed on the marketplace
  // (lots in 'aggregated' status ready for offers, or 'offered' status actively on market)
  const listedLotCrops = useMemo(() => {
    const crops = new Set();
    lots.forEach((lot) => {
      const status = String(lot.status || "").trim().toLowerCase();
      if (status === "aggregated" || status === "offered") {
        const crop = String(lot.crop_name || lot.crop || "").trim().toLowerCase();
        if (crop) crops.add(crop);
      }
    });
    return crops;
  }, [lots]);

  // Multi-tier filtering & sorting pipeline
  const filteredRequirements = useMemo(() => {
    let list = [...requirements];

    // 1. Text Search Filter (Crop name, Buyer company name, Location)
    const q = searchTerm.toLowerCase().trim();
    if (q) {
      list = list.filter((req) => {
        return (
          (req.crop_name && req.crop_name.toLowerCase().includes(q)) ||
          (req.buyer_name && req.buyer_name.toLowerCase().includes(q)) ||
          (req.location && req.location.toLowerCase().includes(q))
        );
      });
    }

    // 2. Crop Dropdown Filter
    if (cropFilter !== "all") {
      const targetCrop = cropFilter.trim().toLowerCase();
      list = list.filter((req) => {
        const c = String(req.crop_name || "").trim().toLowerCase();
        return c === targetCrop;
      });
    }

    // 3. Buyer Filter
    if (buyerFilter === "for_lots") {
      // "For Your Listed Lots": Matches requirement crop against FPO's actual active/listed lots
      list = list.filter((req) => {
        const c = String(req.crop_name || "").trim().toLowerCase();
        return listedLotCrops.has(c);
      });
    } else if (buyerFilter === "best") {
      // "Best Buyers": Ordered by maximum budget ceiling price (max_price) descending
      // (Highest paying enterprise buyers first). If max_price is tied, larger quantity first.
      list.sort((a, b) => {
        const priceA = parseFloat(a.max_price) || 0;
        const priceB = parseFloat(b.max_price) || 0;
        if (priceB !== priceA) {
          return priceB - priceA;
        }
        const qtyA = parseFloat(a.quantity) || 0;
        const qtyB = parseFloat(b.quantity) || 0;
        return qtyB - qtyA;
      });
    }

    return list;
  }, [requirements, searchTerm, cropFilter, buyerFilter, listedLotCrops]);

  const activeEligibleLots = biddingReq ? getEligibleLotsForRequirement(biddingReq, lots) : [];
  const selectedLot = activeEligibleLots.find((l) => String(l.id) === String(bidForm.fpo_lot_id))
    || lots.find((l) => String(l.id) === String(bidForm.fpo_lot_id));

  const isSubmitDisabled =
    submittingOffer ||
    !bidForm.fpo_lot_id ||
    !bidForm.quantity ||
    parseFloat(bidForm.quantity) <= 0 ||
    !bidForm.offered_price ||
    parseFloat(bidForm.offered_price) <= 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Institutional Buyer Requirements
            </h1>
            <Badge variant="emerald" dot>
              Live Exchange
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Verified enterprise procurement demand. Connect your aggregated smallholder lots directly to commercial buyers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button size="sm" variant="outline" icon={RefreshCw} onClick={loadMarketplaceData}>
            Refresh
          </Button>
          <Link to="/fpo/offers">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              View Submitted Bids
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Search & Filter Controls: [ Search ] [ Buyer Filter ▼ ] [ Crop Filter ▼ ] */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search by crop, buyer company, or destination hub..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Buyer Filter Dropdown */}
          <div className="md:col-span-3">
            <div className="relative">
              <select
                id="fpo-buyer-filter"
                aria-label="Buyer Filter"
                className="w-full pl-3.5 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm bg-white font-medium text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer appearance-none shadow-xs"
                value={buyerFilter}
                onChange={(e) => setBuyerFilter(e.target.value)}
              >
                <option value="all">All Buyers</option>
                <option value="best">Best Buyers (Highest Price)</option>
                <option value="for_lots">For Your Listed Lots</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                <span className="text-xs">▼</span>
              </div>
            </div>
          </div>

          {/* Crop Filter Dropdown */}
          <div className="md:col-span-3">
            <div className="relative">
              <select
                id="fpo-crop-filter"
                aria-label="Crop Filter"
                className="w-full pl-3.5 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm bg-white font-medium text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer appearance-none shadow-xs"
                value={cropFilter}
                onChange={(e) => setCropFilter(e.target.value)}
              >
                <option value="all">All Crops ({dynamicCrops.length})</option>
                {dynamicCrops.map((crop) => (
                  <option key={crop} value={crop}>
                    {crop}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                <span className="text-xs">▼</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Filter Indicators */}
        {(searchTerm || buyerFilter !== "all" || cropFilter !== "all") && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 text-xs text-gray-600">
            <span className="font-semibold text-gray-700">Active Filters:</span>
            {buyerFilter === "best" && (
              <Badge variant="blue" className="text-[11px]">
                Best Buyers (Highest Price)
              </Badge>
            )}
            {buyerFilter === "for_lots" && (
              <Badge variant="emerald" className="text-[11px]">
                For Your Listed Lots ({listedLotCrops.size} active crops)
              </Badge>
            )}
            {cropFilter !== "all" && (
              <Badge variant="gray" className="text-[11px]">
                Crop: {cropFilter}
              </Badge>
            )}
            {searchTerm && (
              <Badge variant="gray" className="text-[11px]">
                Search: "{searchTerm}"
              </Badge>
            )}
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setBuyerFilter("all");
                setCropFilter("all");
              }}
              className="text-emerald-700 hover:text-emerald-800 underline text-xs ml-auto cursor-pointer font-medium"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Requirements List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <LoadingState message="Scanning marketplace requirements..." />
        </div>
      ) : filteredRequirements.length === 0 ? (
        <Card className="text-center py-16 px-6 border-dashed border-2 border-gray-200">
          <div className="max-w-md mx-auto space-y-4">
            <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <Store size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {buyerFilter === "for_lots" && listedLotCrops.size === 0
                ? "No Listed Lots to Match"
                : searchTerm || buyerFilter !== "all" || cropFilter !== "all"
                ? "No Matching Demands Found"
                : "No Open Buyer Demands Listed"}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              {buyerFilter === "for_lots" && listedLotCrops.size === 0
                ? "You currently do not have any aggregated or offered produce lots listed. Aggregate member produce in Produce Lots to unlock automatic demand matching."
                : buyerFilter === "for_lots"
                ? `No open buyer demands currently match your listed lots (${Array.from(listedLotCrops).join(", ")}). You can switch the Buyer Filter to "All Buyers" to explore other crops.`
                : "When institutional buyers publish crop procurement needs, they will appear here with target quantities, quality specs, and delivery destinations."}
            </p>
            {(searchTerm || buyerFilter !== "all" || cropFilter !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setBuyerFilter("all");
                  setCropFilter("all");
                }}
              >
                Clear All Filters
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRequirements.map((req) => {
            const eligibleLots = getEligibleLotsForRequirement(req, lots);
            const hasLots = eligibleLots.length > 0;

            return (
              <Card
                key={req.id}
                className="p-5 border-gray-200 hover:border-emerald-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-start gap-3">
                      <CropImage
                        crop={req.crop_name}
                        size="card"
                        className="rounded-xl shadow-xs shrink-0 border border-gray-200 mt-0.5"
                      />
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{req.crop_name}</h3>
                        <p className="text-xs text-gray-500">
                          Buyer: <strong className="text-gray-800">{req.buyer_name || "Enterprise Buyer"}</strong>
                        </p>
                      </div>
                    </div>
                    <Badge variant="blue">{req.quality_grade || "Grade A"}</Badge>
                  </div>

                  <div className="space-y-1.5 my-3 py-2 border-t border-b border-gray-100 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Target Demand:</span>
                      <span className="font-bold text-gray-800">
                        {Number(req.quantity).toLocaleString()} {req.unit}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-400">Buyer Budget Ceiling:</span>
                      <span className="font-bold text-emerald-700">
                        ₹{Number(req.max_price || 0).toLocaleString()} / {req.unit}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Delivery Destination:</span>
                      <span className="font-medium text-gray-700 flex items-center gap-1">
                        <MapPin size={11} className="text-gray-400" />
                        {req.location || "Regional Hub"}
                      </span>
                    </div>

                    {req.required_by && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Required By:</span>
                        <span className="text-gray-600 flex items-center gap-1">
                          <Calendar size={11} className="text-gray-400" />
                          {new Date(req.required_by).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Eligible FPO Lots Annotation */}
                  <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-xs mb-3">
                    <div className="flex items-center gap-1.5 text-gray-700 font-semibold mb-1">
                      <Package size={13} className="text-emerald-600" />
                      <span>Your Aggregated Lots:</span>
                    </div>
                    {hasLots ? (
                      <p className="text-[11px] text-emerald-800">
                        {eligibleLots.length} ready aggregated lot(s) for {req.crop_name}:{" "}
                        <strong>{eligibleLots.map((l) => l.lot_number).join(", ")}</strong>
                      </p>
                    ) : (
                      <p className="text-[11px] text-gray-400">
                        No aggregated lot matching {req.crop_name}. Create an aggregated lot in Produce Lots first.
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-400">Demand #{req.id}</span>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    icon={Send}
                    onClick={() => handleOpenBid(req)}
                  >
                    Submit Bidding Offer
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Submit Bidding Offer Modal */}
      {biddingReq && (
        <Modal
          isOpen={true}
          onClose={() => setBiddingReq(null)}
          title={`Submit FPO Offer: ${biddingReq.crop_name}`}
        >
          <form onSubmit={handleSubmitOffer} className="space-y-4">
            {offerSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>{offerSuccess}</span>
              </div>
            )}

            <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 text-xs space-y-1 text-gray-700">
              <p>
                <strong>Buyer:</strong> {biddingReq.buyer_name || "Enterprise Buyer"}
              </p>
              <p>
                <strong>Demand Volume:</strong> {biddingReq.quantity} {biddingReq.unit}
              </p>
              <p>
                <strong>Ceiling Price:</strong> ₹{biddingReq.max_price || "Market rate"} / {biddingReq.unit}
              </p>
              <p>
                <strong>Destination:</strong> {biddingReq.location || "Regional Hub"}
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Select Your Aggregated Lot *
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                value={bidForm.fpo_lot_id}
                onChange={(e) => {
                  const newLotId = e.target.value;
                  const pickedLot = activeEligibleLots.find((l) => String(l.id) === String(newLotId));
                  setBidForm({
                    ...bidForm,
                    fpo_lot_id: newLotId,
                    quantity: pickedLot && (!bidForm.quantity || Number(bidForm.quantity) <= 0)
                      ? String(Math.min(Number(biddingReq.quantity || pickedLot.total_quantity), Number(pickedLot.total_quantity || biddingReq.quantity)))
                      : bidForm.quantity,
                  });
                }}
                required
              >
                <option value="">-- Choose Aggregated Lot --</option>
                {activeEligibleLots.length > 0 ? (
                  activeEligibleLots.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.lot_number} ({l.total_quantity} {l.unit || "quintal"} available)
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No aggregated lots available for {biddingReq.crop_name}
                  </option>
                )}
              </select>
            </div>

            {selectedLot && (
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-emerald-800">Selected Lot:</span>{" "}
                  <strong className="font-mono">{selectedLot.lot_number}</strong>
                  {selectedLot.quality_grade && (
                    <span className="ml-2 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                      {selectedLot.quality_grade}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-emerald-700 text-[11px] block">Aggregated Volume:</span>
                  <strong className="text-emerald-900">
                    {selectedLot.total_quantity} {selectedLot.unit || "quintal"}
                  </strong>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Input
                label={`Offer Volume (${biddingReq.unit || "quintal"}) *`}
                type="number"
                step="0.01"
                placeholder="e.g. 40"
                value={bidForm.quantity}
                onChange={(e) => setBidForm({ ...bidForm, quantity: e.target.value })}
                required
                min="0.01"
              />

              <Input
                label={`Offer Rate (₹ / ${biddingReq.unit || "quintal"}) *`}
                type="number"
                step="0.01"
                placeholder="e.g. 4000"
                value={bidForm.offered_price}
                onChange={(e) => setBidForm({ ...bidForm, offered_price: e.target.value })}
                required
                min="0.01"
              />
            </div>

            <Input
              label="Consignment Message & Quality Specs"
              placeholder="e.g. Farm gate harvested, sorted Grade A plantation coffee."
              value={bidForm.message}
              onChange={(e) => setBidForm({ ...bidForm, message: e.target.value })}
            />

            <div className="flex justify-end gap-2 pt-3">
              <Button variant="outline" size="sm" type="button" onClick={() => setBiddingReq(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                type="submit"
                disabled={isSubmitDisabled}
              >
                {submittingOffer ? "Submitting Offer..." : "Submit Offer to Buyer"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default FPOMarketplace;
