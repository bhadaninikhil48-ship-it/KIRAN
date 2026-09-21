import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  CheckCircle2,
  XCircle,
  MessageSquare,
  RefreshCw,
  Send,
  Calendar,
  AlertCircle,
  ReceiptText,
  Filter,
  MapPin,
  X,
} from "lucide-react";

import api from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Modal } from "../../components/ui/Modal";
import { Avatar } from "../../components/ui/Avatar";
import { EmptyState } from "../../components/ui/EmptyState";
import { CropImage } from "../../components/ui/CropImage";

export function BuyerOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState("all");

  // Negotiation Modal state
  const [activeNegotiationOffer, setActiveNegotiationOffer] = useState(null);
  const [negotiationHistory, setNegotiationHistory] = useState([]);
  const [loadingNegotiations, setLoadingNegotiations] = useState(false);
  const [counterPrice, setCounterPrice] = useState("");
  const [counterNote, setCounterNote] = useState("");
  const [submittingCounter, setSubmittingCounter] = useState(false);

  const loadOffers = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/api/offers/buyer");

      setOffers(res.offers || []);
    } catch (err) {
      console.error("Error fetching buyer offers:", err);
      setError("Failed to load received offers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const handleStatusUpdate = async (offerId, status) => {
    try {
      setUpdatingId(offerId);
      setError(null);
      setActionSuccess(null);

      const res = await api.patch(`/api/offers/${offerId}/status`, {
        status,
      });

      if (res.contractCreated) {
        setActionSuccess(
          "Offer accepted! Digital legal contract generated and added to fulfillment."
        );
      } else {
        setActionSuccess(`Offer ${status} successfully.`);
      }

      setOffers((prev) =>
        prev.map((offer) =>
          offer.id === offerId ? { ...offer, status } : offer
        )
      );
    } catch (err) {
      console.error("Error updating offer status:", err);
      setError(err.message || `Failed to ${status} offer.`);
    } finally {
      setUpdatingId(null);
    }
  };

  const openNegotiationModal = async (offer) => {
    setActiveNegotiationOffer(offer);
    setCounterPrice(offer.offer_price || "");
    setCounterNote("");
    setNegotiationHistory([]);

    try {
      setLoadingNegotiations(true);

      const res = await api.get(`/api/negotiations/${offer.id}`);

      setNegotiationHistory(res.negotiations || []);
    } catch (err) {
      console.error("Error loading negotiations:", err);
    } finally {
      setLoadingNegotiations(false);
    }
  };

  const handleSendCounter = async (e) => {
    e.preventDefault();

    if (!counterPrice || !activeNegotiationOffer) {
      return;
    }

    try {
      setSubmittingCounter(true);

      await api.post("/api/negotiations", {
        offerId: activeNegotiationOffer.id,
        price: Number(counterPrice),
        quantity: Number(activeNegotiationOffer.quantity),
        message: counterNote.trim(),
      });

      // Reload negotiation history
      const res = await api.get(
        `/api/negotiations/${activeNegotiationOffer.id}`
      );

      setNegotiationHistory(res.negotiations || []);
      setCounterNote("");
    } catch (err) {
      console.error("Error sending counter:", err);
      alert(err.message || "Failed to submit counter offer.");
    } finally {
      setSubmittingCounter(false);
    }
  };

  // Extract unique crop names for dynamic filter options
  const availableCrops = Array.from(
    new Set(offers.map((o) => o.crop_name).filter(Boolean))
  ).sort();

  // Safely filter offers on the client side using real crop names
  const filteredOffers =
    selectedCrop === "all"
      ? offers
      : offers.filter(
          (o) =>
            (o.crop_name || "").toLowerCase() === selectedCrop.toLowerCase()
        );

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* 1. Page Header */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-1.5 min-w-0">
            {/* Title & Badges */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Offers Received
              </h1>

              <Badge variant="blue" dot size="sm">
                Farmer Bids
              </Badge>

              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50/90 border border-emerald-200/70 px-2.5 py-0.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active Procurement Channel
              </span>
            </div>

            <p className="text-xs sm:text-sm text-gray-500 max-w-2xl leading-relaxed">
              Review competitive crop supply offers from local farmers, negotiate
              terms, or accept directly to create legal contracts.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <Button
              size="sm"
              variant="outline"
              icon={RefreshCw}
              loading={loading}
              onClick={loadOffers}
              className="text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 font-medium shadow-xs"
            >
              Refresh
            </Button>

            <Link to="/buyer/contracts">
              <Button
                size="sm"
                variant="outline"
                icon={ReceiptText}
                className="text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 font-medium shadow-xs"
              >
                View Contracts
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Success Alert Banner */}
      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center justify-between text-sm shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span className="font-medium">{actionSuccess}</span>
          </div>

          <Link
            to="/buyer/contracts"
            className="text-xs font-bold text-emerald-800 underline hover:text-emerald-950 shrink-0 ml-2"
          >
            Go to Contracts →
          </Link>
        </div>
      )}

      {/* Error Alert Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center justify-between gap-3 text-sm shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={18} className="text-red-600 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>

          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 p-1"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* 2. Crop Filter Toolbar (when offers exist) */}
      {!loading && offers.length > 0 && (
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100/80 shrink-0">
              <Filter size={15} />
            </div>
            <span className="text-xs font-semibold text-gray-700">
              Filter by Crop:
            </span>

            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              aria-label="Filter offers by crop"
              className="text-xs font-medium border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50/80 text-gray-800 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors cursor-pointer"
            >
              <option value="all">All Crops ({offers.length})</option>
              {availableCrops.map((crop) => {
                const count = offers.filter(
                  (o) =>
                    (o.crop_name || "").toLowerCase() === crop.toLowerCase()
                ).length;
                return (
                  <option key={crop} value={crop}>
                    {crop} ({count})
                  </option>
                );
              })}
            </select>

            {selectedCrop !== "all" && (
              <button
                type="button"
                onClick={() => setSelectedCrop("all")}
                className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold underline ml-1 cursor-pointer"
              >
                Clear filter
              </button>
            )}
          </div>

          <div className="text-xs font-medium text-gray-500 sm:text-right">
            Showing <strong className="text-gray-900 font-semibold">{filteredOffers.length}</strong> of{" "}
            <strong className="text-gray-900 font-semibold">{offers.length}</strong> offers
          </div>
        </div>
      )}

      {/* Offers Display Area */}
      {loading ? (
        /* SaaS Skeleton Loading State */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-72 bg-gray-100 rounded-2xl border border-gray-200/70 p-5 sm:p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gray-200"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-28 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                </div>
                <div className="mt-4 p-3.5 bg-gray-200/60 rounded-xl space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mt-4"></div>
            </div>
          ))}
        </div>
      ) : offers.length === 0 ? (
        /* Empty State (No offers at all) */
        <EmptyState
          icon={FileText}
          title="No Offers Received Yet"
          description="When farmers discover your open crop requirements, their offers with volume, rate, and delivery date will appear here for review."
          actionLabel="Check Your Requirements"
          onAction={() => window.location.assign("/buyer/requirements")}
        />
      ) : filteredOffers.length === 0 ? (
        /* Filter Empty State (No offers matching selected crop) */
        <EmptyState
          icon={Filter}
          title={`No Offers Found for "${selectedCrop}"`}
          description="None of your received farmer offers match this crop filter. Choose another crop or clear the filter."
          actionLabel="Show All Crops"
          onAction={() => setSelectedCrop("all")}
        />
      ) : (
        /* 4. Offer Cards (2-Column Responsive Grid) */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredOffers.map((offer) => {
            const isPending = offer.status === "pending";
            const isAccepted = offer.status === "accepted";
            const isRejected = offer.status === "rejected";

            const totalEstimated =
              (Number(offer.quantity) || 0) * (Number(offer.offer_price) || 0);

            return (
              <Card
                key={offer.id}
                className={`p-5 sm:p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between group shadow-xs hover:shadow-md hover:-translate-y-0.5 ${
                  isAccepted
                    ? "border-emerald-300 bg-white hover:border-emerald-400"
                    : isRejected
                    ? "border-red-200/80 bg-gray-50/50 hover:border-red-300 opacity-80"
                    : "border-gray-200/90 bg-white hover:border-blue-300"
                }`}
              >
                <div>
                  {/* Card Header: Crop Image + Crop Spec + Status Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Visual Crop Presentation */}
                      <CropImage cropName={offer.crop_name} size="md" />

                      <div className="min-w-0">
                        <h3
                          className="font-extrabold text-gray-900 text-base sm:text-lg tracking-tight truncate"
                          title={offer.crop_name}
                        >
                          {offer.crop_name}
                        </h3>

                        <span className="inline-block text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 mt-0.5">
                          {offer.quality_grade || "Grade A"}
                        </span>
                      </div>
                    </div>

                    <StatusBadge
                      status={
                        isAccepted
                          ? "Accepted"
                          : isRejected
                          ? "Rejected"
                          : "Pending"
                      }
                    />
                  </div>

                  {/* 5. Farmer Identity Area (Polished & Click-Isolated) */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="mt-3.5 py-2.5 px-3 bg-gray-50/80 rounded-xl border border-gray-100 flex items-center justify-between select-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar
                        name={offer.farmer_name || "Farmer"}
                        role="farmer"
                        size="sm"
                        className="ring-1 ring-emerald-200 shrink-0"
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

                  {/* 8. Offer Metrics (Structured 3-Column Panel) */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4 py-3.5 px-3.5 bg-gray-50/70 rounded-xl border border-gray-100 text-xs">
                    <div>
                      <span className="text-gray-400 block text-[11px] font-medium uppercase">
                        Offered Rate
                      </span>

                      <span className="text-base font-extrabold text-gray-900 block mt-0.5">
                        ₹{Number(offer.offer_price).toLocaleString("en-IN")}{" "}
                        <span className="text-xs font-normal text-gray-500">
                          / {offer.unit}
                        </span>
                      </span>

                      {offer.max_price && (
                        <span className="text-[10px] text-gray-500 block mt-0.5">
                          Your ceiling: ₹{Number(offer.max_price).toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-gray-400 block text-[11px] font-medium uppercase">
                        Volume
                      </span>

                      <span className="text-base font-extrabold text-gray-900 block mt-0.5">
                        {Number(offer.quantity).toLocaleString("en-IN")}{" "}
                        <span className="text-xs font-normal text-gray-500">
                          {offer.unit}
                        </span>
                      </span>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-gray-400 block text-[11px] font-medium uppercase">
                        Total Value
                      </span>

                      <span className="text-base font-extrabold text-emerald-700 block mt-0.5">
                        ₹{totalEstimated.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* 9. Farmer Note */}
                  {offer.message && (
                    <div className="p-3 bg-amber-50/40 rounded-xl text-xs text-gray-700 mb-4 border border-amber-100/70 italic flex items-start gap-2">
                      <span className="font-semibold text-amber-900 not-italic shrink-0">
                        Farmer Note:
                      </span>
                      <span className="line-clamp-3">"{offer.message}"</span>
                    </div>
                  )}
                </div>

                {/* 10. Card Footer: Date & Click-Isolated Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                    <Calendar size={13} className="shrink-0" />
                    <span>
                      Submitted{" "}
                      {new Date(offer.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="xs"
                      variant="outline"
                      icon={MessageSquare}
                      onClick={(e) => {
                        e.stopPropagation();
                        openNegotiationModal(offer);
                      }}
                      className="font-medium text-blue-700 border-blue-200 hover:bg-blue-50"
                    >
                      Negotiate
                    </Button>

                    {isPending && (
                      <>
                        <Button
                          size="xs"
                          variant="danger"
                          loading={updatingId === offer.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(offer.id, "rejected");
                          }}
                          icon={XCircle}
                          className="font-medium"
                        >
                          Reject
                        </Button>

                        <Button
                          size="xs"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs"
                          loading={updatingId === offer.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(offer.id, "accepted");
                          }}
                          icon={CheckCircle2}
                        >
                          Accept & Contract
                        </Button>
                      </>
                    )}

                    {isAccepted && (
                      <Link
                        to="/buyer/contracts"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          size="xs"
                          variant="outline"
                          icon={ReceiptText}
                          className="font-medium text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                        >
                          View Contract
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Negotiation Modal */}
      <Modal
        isOpen={Boolean(activeNegotiationOffer)}
        onClose={() => setActiveNegotiationOffer(null)}
        title="Price Negotiation & Terms"
        subtitle={`Negotiating ${activeNegotiationOffer?.crop_name} offer with ${activeNegotiationOffer?.farmer_name}`}
      >
        <div className="space-y-4 text-xs sm:text-sm">
          {/* Produce & Negotiation Context Banner */}
          {activeNegotiationOffer && (
            <div className="flex items-center gap-3 p-3 bg-gray-50/90 rounded-xl border border-gray-100">
              <CropImage cropName={activeNegotiationOffer.crop_name} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-gray-900 text-sm truncate">
                    {activeNegotiationOffer.crop_name}
                  </h4>
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 shrink-0">
                    {activeNegotiationOffer.quality_grade || "Grade A"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  Farmer: {activeNegotiationOffer.farmer_name || "Enrolled Producer"} • Offer #{activeNegotiationOffer.id}
                </p>
              </div>
            </div>
          )}

          {/* Negotiation History */}
          <div className="border border-gray-200 rounded-xl p-3 bg-gray-50/50 max-h-56 overflow-y-auto space-y-2.5">
            {loadingNegotiations ? (
              <p className="text-gray-400 text-center py-4">
                Loading negotiation trail...
              </p>
            ) : negotiationHistory.length === 0 ? (
              <p className="text-gray-400 text-center py-4 italic">
                No negotiation rounds recorded yet. Propose your counter-rate
                below.
              </p>
            ) : (
              negotiationHistory.map((item) => (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-lg text-xs ${
                    item.sender_role === "buyer"
                      ? "bg-blue-50 border border-blue-100 text-blue-900 ml-6"
                      : "bg-emerald-50 border border-emerald-100 text-emerald-900 mr-6"
                  }`}
                >
                  <div className="flex justify-between font-semibold mb-1">
                    <span>
                      {item.sender_role === "buyer"
                        ? "You (Buyer)"
                        : item.sender_name || "Farmer"}
                    </span>

                    <span className="font-bold text-sm">
                      ₹{Number(item.price).toLocaleString("en-IN")} / unit
                    </span>
                  </div>

                  <div className="text-[11px] text-gray-500">
                    Quantity:{" "}
                    {Number(item.quantity).toLocaleString("en-IN")}{" "}
                    {activeNegotiationOffer?.unit}
                  </div>

                  {item.message && (
                    <p className="text-gray-600 mt-0.5">
                      {item.message}
                    </p>
                  )}

                  <span className="text-[10px] text-gray-400 block mt-1">
                    {new Date(item.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Counter Form */}
          <form
            onSubmit={handleSendCounter}
            className="space-y-3 pt-2 border-t border-gray-100"
          >
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Your Counter Offer Rate (₹ /{" "}
                {activeNegotiationOffer?.unit})
              </label>

              <Input
                type="number"
                value={counterPrice}
                onChange={(e) => setCounterPrice(e.target.value)}
                placeholder="Enter counter price"
                required
                min="1"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Negotiation Note
              </label>

              <Input
                type="text"
                value={counterNote}
                onChange={(e) => setCounterNote(e.target.value)}
                placeholder="Add your negotiation note"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveNegotiationOffer(null)}
              >
                Close
              </Button>

              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                loading={submittingCounter}
                icon={Send}
              >
                Submit Counter
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}

export default BuyerOffers;