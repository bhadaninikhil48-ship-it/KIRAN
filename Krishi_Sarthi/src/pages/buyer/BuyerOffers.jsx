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
} from "lucide-react";

import api from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Modal } from "../../components/ui/Modal";
import { CropImage } from "../../components/ui/CropImage";

export function BuyerOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

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
      setError("Failed to load received offers.");
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

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Offers Received
            </h1>

            <Badge variant="blue" dot>
              Farmer Bids
            </Badge>
          </div>

          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Review competitive crop supply offers from local farmers, negotiate
            terms, or accept directly to create legal contracts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            icon={RefreshCw}
            onClick={loadOffers}
          >
            Refresh
          </Button>

          <Link to="/buyer/contracts">
            <Button size="sm" variant="outline" icon={ReceiptText}>
              View Contracts
            </Button>
          </Link>
        </div>
      </div>

      {/* Success Message */}
      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>

          <Link
            to="/buyer/contracts"
            className="text-xs font-bold text-emerald-800 underline"
          >
            Go to Contracts →
          </Link>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-2 text-sm">
          <AlertCircle size={18} className="text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
        </div>
      ) : offers.length === 0 ? (
        /* Empty State */
        <Card className="text-center py-16 px-6 border-dashed border-2 border-gray-300">
          <div className="max-w-md mx-auto space-y-4">
            <div className="h-16 w-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <FileText size={32} />
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              No Offers Received Yet
            </h2>

            <p className="text-sm text-gray-500 leading-relaxed">
              When farmers discover your open crop requirements, their offers
              with volume, rate, and delivery date will appear here for review.
            </p>

            <Link to="/buyer/requirements">
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Check Your Requirements
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        /* Offers */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {offers.map((offer) => {
            const isPending = offer.status === "pending";
            const isAccepted = offer.status === "accepted";
            const isRejected = offer.status === "rejected";

            const totalEstimated =
              Number(offer.quantity) * Number(offer.offer_price);

            return (
              <Card
                key={offer.id}
                className={`p-5 border transition-all ${
                  isAccepted
                    ? "border-emerald-300 bg-emerald-50/20"
                    : isRejected
                    ? "border-red-200 bg-gray-50/40 opacity-75"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                {/* Offer Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <CropImage
                      crop={offer.crop_name}
                      size="card"
                      className="rounded-xl shadow-xs shrink-0 border border-gray-200 mt-0.5"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-900 text-lg">
                          {offer.crop_name}
                        </h3>

                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                          {offer.quality_grade || "Grade A"}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 mt-0.5">
                        Farmer:{" "}
                        <strong className="text-gray-800">
                          {offer.farmer_name}
                        </strong>{" "}
                        • Linked to Requirement #{offer.requirement_id}
                      </p>
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

                {/* Offer Details */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4 py-3 border-t border-b border-gray-100 text-xs">
                  <div>
                    <span className="text-gray-400 block">
                      Offered Rate
                    </span>

                    <span className="text-base font-bold text-gray-900">
                      ₹{Number(offer.offer_price).toLocaleString()} /{" "}
                      {offer.unit}
                    </span>

                    {offer.max_price && (
                      <span className="text-[10px] text-gray-500 block">
                        Your ceiling: ₹{offer.max_price}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-gray-400 block">Volume</span>

                    <span className="text-base font-bold text-gray-900">
                      {Number(offer.quantity).toLocaleString()} {offer.unit}
                    </span>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-gray-400 block">Total Value</span>

                    <span className="text-base font-bold text-emerald-700">
                      ₹{totalEstimated.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Farmer Message */}
                {offer.message && (
                  <div className="p-2.5 bg-gray-50 rounded-lg text-xs text-gray-600 mb-4 border border-gray-100">
                    <strong className="text-gray-700">Farmer Note:</strong>{" "}
                    {offer.message}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Calendar size={13} />

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
                      onClick={() => openNegotiationModal(offer)}
                    >
                      Negotiate
                    </Button>

                    {isPending && (
                      <>
                        <Button
                          size="xs"
                          variant="danger"
                          loading={updatingId === offer.id}
                          onClick={() =>
                            handleStatusUpdate(offer.id, "rejected")
                          }
                          icon={XCircle}
                        >
                          Reject
                        </Button>

                        <Button
                          size="xs"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          loading={updatingId === offer.id}
                          onClick={() =>
                            handleStatusUpdate(offer.id, "accepted")
                          }
                          icon={CheckCircle2}
                        >
                          Accept & Contract
                        </Button>
                      </>
                    )}

                    {isAccepted && (
                      <Link to="/buyer/contracts">
                        <Button
                          size="xs"
                          variant="outline"
                          icon={ReceiptText}
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
          {activeNegotiationOffer && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
              <CropImage
                crop={activeNegotiationOffer.crop_name}
                size="card"
                className="rounded-xl shadow-xs shrink-0 border border-gray-200"
              />
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                  Active Commodity
                </span>
                <p className="font-bold text-gray-900 text-sm">
                  {activeNegotiationOffer.crop_name} • {activeNegotiationOffer.quality_grade || "Grade A"}
                </p>
                <p className="text-xs text-emerald-700 font-semibold">
                  Original Offer: ₹{Number(activeNegotiationOffer.offer_price).toLocaleString()} / {activeNegotiationOffer.unit} • {Number(activeNegotiationOffer.quantity).toLocaleString()} {activeNegotiationOffer.unit}
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
                      ₹{Number(item.price).toLocaleString()} / unit
                    </span>
                  </div>

                  <div className="text-[11px] text-gray-500">
                    Quantity:{" "}
                    {Number(item.quantity).toLocaleString()}{" "}
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
                className="bg-blue-600 hover:bg-blue-700 text-white"
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