import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Modal } from "../../components/ui/Modal";
import { CropImage } from "../../components/ui/CropImage";
import { LoadingState } from "../../components/ui/LoadingState";
import {
  FileText,
  MessageSquare,
  RefreshCw,
  Send,
  Calendar,
  AlertCircle,
  ReceiptText,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  User,
  Building,
} from "lucide-react";

export function FPOOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Negotiation Modal state
  const [activeNegotiationOffer, setActiveNegotiationOffer] = useState(null);
  const [negotiationHistory, setNegotiationHistory] = useState([]);
  const [loadingNegotiations, setLoadingNegotiations] = useState(false);
  const [counterPrice, setCounterPrice] = useState("");
  const [counterQuantity, setCounterQuantity] = useState("");
  const [counterNote, setCounterNote] = useState("");
  const [submittingCounter, setSubmittingCounter] = useState(false);
  const [negotiationError, setNegotiationError] = useState(null);

  const loadOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/api/fpo/marketplace/offers");
      setOffers(res.offers || []);
    } catch (err) {
      console.error("Error loading FPO offers:", err);
      setError(err.message || "Failed to load submitted offers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  // Open Negotiation History & Counter Dialog
  const handleOpenNegotiation = async (offer) => {
    setActiveNegotiationOffer(offer);
    setNegotiationError(null);
    setCounterNote("");

    try {
      setLoadingNegotiations(true);
      const res = await api.get(`/api/negotiations/${offer.id}`);
      const history = res.negotiations || [];
      setNegotiationHistory(history);

      if (history.length > 0) {
        const latest = history[history.length - 1];
        setCounterPrice(latest.price);
        setCounterQuantity(latest.quantity);
      } else {
        setCounterPrice(offer.offer_price);
        setCounterQuantity(offer.quantity);
      }
    } catch (err) {
      console.error("Error loading negotiation history:", err);
      setNegotiationError(err.message || "Failed to load negotiation thread.");
    } finally {
      setLoadingNegotiations(false);
    }
  };

  // Submit Counter Offer
  const handleSendCounter = async (e) => {
    e.preventDefault();
    if (!activeNegotiationOffer) return;
    if (!counterPrice || parseFloat(counterPrice) <= 0 || !counterQuantity || parseFloat(counterQuantity) <= 0) {
      setNegotiationError("Positive counter price and quantity are required.");
      return;
    }

    try {
      setSubmittingCounter(true);
      setNegotiationError(null);

      await api.post("/api/negotiations", {
        offerId: activeNegotiationOffer.id,
        price: parseFloat(counterPrice),
        quantity: parseFloat(counterQuantity),
        message: counterNote ? counterNote.trim() : null,
      });

      // Reload thread
      const res = await api.get(`/api/negotiations/${activeNegotiationOffer.id}`);
      setNegotiationHistory(res.negotiations || []);
      setCounterNote("");
    } catch (err) {
      console.error("Error sending negotiation counter:", err);
      setNegotiationError(err.message || "Failed to submit counter offer.");
    } finally {
      setSubmittingCounter(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Submitted FPO Marketplace Bids
            </h1>
            <Badge variant="emerald" dot>
              Direct Trade Offers
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Track submitted bids, negotiate unit rates and volumes in real-time with institutional buyers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button size="sm" variant="outline" icon={RefreshCw} onClick={loadOffers}>
            Refresh
          </Button>
          <Link to="/fpo/marketplace">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              Browse More Demands
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

      {/* Offers Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <LoadingState message="Loading your submitted offers..." />
        </div>
      ) : offers.length === 0 ? (
        <Card className="text-center py-16 px-6 border-dashed border-2 border-gray-200">
          <div className="max-w-md mx-auto space-y-4">
            <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <FileText size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">No Offers Submitted Yet</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Browse open buyer requirements and submit bids linking your aggregated smallholder harvest lots.
            </p>
            <Link to="/fpo/marketplace">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Find Buyer Demands
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {offers.map((offer) => {
            const isPending = offer.status === "pending";
            const isAccepted = offer.status === "accepted";
            const isRejected = offer.status === "rejected";
            const totalEstimated = Number(offer.quantity) * Number(offer.offer_price);

            return (
              <Card
                key={offer.id}
                className={`p-5 border transition-all ${
                  isAccepted
                    ? "border-emerald-300 bg-emerald-50/15"
                    : isRejected
                    ? "border-red-200 bg-gray-50/40 opacity-75"
                    : "border-gray-200 hover:border-emerald-300"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <CropImage
                      crop={offer.crop_name}
                      size="card"
                      className="rounded-xl shadow-xs shrink-0 border border-gray-200 mt-0.5"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-900 text-lg">{offer.crop_name}</h3>
                        <Badge variant="blue">{offer.quality_grade || "Grade A"}</Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Buyer: <strong className="text-gray-800">{offer.buyer_name}</strong> • Demand #{offer.requirement_id}
                      </p>
                      {offer.lot_number && (
                        <p className="text-[11px] text-purple-700 font-medium mt-0.5">
                          Aggregated Lot: {offer.lot_number}
                        </p>
                      )}
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

                <div className="grid grid-cols-3 gap-3 my-4 py-3 border-t border-b border-gray-100 text-xs">
                  <div>
                    <span className="text-gray-400 block">Offered Rate</span>
                    <span className="text-base font-bold text-gray-900">
                      ₹{Number(offer.offer_price).toLocaleString()} / {offer.unit}
                    </span>
                    {offer.max_price && (
                      <span className="text-[10px] text-gray-500 block">
                        Buyer Max: ₹{offer.max_price}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-gray-400 block">Consignment Volume</span>
                    <span className="text-base font-bold text-gray-900">
                      {Number(offer.quantity).toLocaleString()} {offer.unit}
                    </span>
                    <span className="text-[10px] text-gray-500 block">
                      Target Lot: {offer.lot_number || "FPO Pool"}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 block">Total Est. Value</span>
                    <span className="text-base font-bold text-emerald-700">
                      ₹{totalEstimated.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-gray-400 block">
                      {new Date(offer.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {offer.message && (
                  <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100 mb-3">
                    &ldquo;{offer.message}&rdquo;
                  </p>
                )}

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-400">Offer #{offer.id}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="xs"
                      variant="outline"
                      icon={MessageSquare}
                      onClick={() => handleOpenNegotiation(offer)}
                    >
                      {isPending ? "Negotiate Terms" : "View Negotiations"}
                    </Button>

                    {isAccepted && (
                      <Link to="/fpo/contracts">
                        <Button size="xs" className="bg-emerald-600 hover:bg-emerald-700 text-white" icon={ReceiptText}>
                          View Legal Contract
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

      {/* Negotiation History & Counter Modal */}
      {activeNegotiationOffer && (
        <Modal
          isOpen={true}
          onClose={() => setActiveNegotiationOffer(null)}
          title={`Negotiation Thread: Offer #${activeNegotiationOffer.id} (${activeNegotiationOffer.crop_name})`}
        >
          <div className="space-y-4">
            {negotiationError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-red-600" />
                <span>{negotiationError}</span>
              </div>
            )}

            {/* Original Submission Card */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
              <span className="font-semibold text-gray-500 uppercase tracking-wider text-[10px] block mb-1">
                Original FPO Submission
              </span>
              <div className="flex justify-between items-center text-gray-800">
                <span>
                  Rate: <strong>₹{activeNegotiationOffer.offer_price} / {activeNegotiationOffer.unit}</strong>
                </span>
                <span>
                  Volume: <strong>{activeNegotiationOffer.quantity} {activeNegotiationOffer.unit}</strong>
                </span>
                <span>
                  Buyer: <strong>{activeNegotiationOffer.buyer_name}</strong>
                </span>
              </div>
            </div>

            {/* Thread Messages */}
            <div className="space-y-3">
              <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-gray-500">
                Negotiation Exchange History
              </h4>

              {loadingNegotiations ? (
                <div className="py-6 text-center text-xs text-gray-500">Loading message thread...</div>
              ) : negotiationHistory.length === 0 ? (
                <div className="py-4 text-center text-xs text-gray-400 border border-dashed rounded-lg">
                  No counter-offers exchanged yet. Original offer terms stand as the active proposal.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {negotiationHistory.map((neg, idx) => {
                    const isFpoSender = neg.sender_role === "fpo";
                    const isBuyerSender = neg.sender_role === "buyer";

                    return (
                      <div
                        key={neg.id || idx}
                        className={`p-3 rounded-xl border text-xs ${
                          isFpoSender
                            ? "bg-emerald-50/70 border-emerald-200 ml-4"
                            : "bg-blue-50/70 border-blue-200 mr-4"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-bold flex items-center gap-1 ${isFpoSender ? "text-emerald-800" : "text-blue-800"}`}>
                            {isFpoSender ? <Building size={12} /> : <User size={12} />}
                            {isFpoSender ? "FPO Collective Counter" : "Buyer Enterprise Counter"}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(neg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>

                        <div className="flex justify-between items-center my-1 font-semibold text-gray-900">
                          <span>Proposed Rate: ₹{neg.price} / {activeNegotiationOffer.unit}</span>
                          <span>Proposed Volume: {neg.quantity} {activeNegotiationOffer.unit}</span>
                        </div>

                        {neg.message && (
                          <p className="text-gray-600 mt-1 italic">&ldquo;{neg.message}&rdquo;</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Counter-Offer Form (only if offer is pending) */}
            {activeNegotiationOffer.status === "pending" ? (
              <form onSubmit={handleSendCounter} className="space-y-3 pt-3 border-t border-gray-100">
                <h4 className="font-bold text-gray-900 text-xs">Send FPO Counter Proposal</h4>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label={`Counter Rate (₹ / ${activeNegotiationOffer.unit}) *`}
                    type="number"
                    step="0.01"
                    value={counterPrice}
                    onChange={(e) => setCounterPrice(e.target.value)}
                    required
                  />

                  <Input
                    label={`Counter Volume (${activeNegotiationOffer.unit}) *`}
                    type="number"
                    step="0.01"
                    value={counterQuantity}
                    onChange={(e) => setCounterQuantity(e.target.value)}
                    required
                  />
                </div>

                <Input
                  label="Negotiation Message / Delivery Note"
                  placeholder="e.g. Can do ₹118 if delivery date extended to 28th."
                  value={counterNote}
                  onChange={(e) => setCounterNote(e.target.value)}
                />

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" type="button" onClick={() => setActiveNegotiationOffer(null)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    type="submit"
                    disabled={submittingCounter}
                    icon={Send}
                  >
                    {submittingCounter ? "Sending..." : "Submit Counter Proposal"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500 text-center">
                This offer has already been <strong>{activeNegotiationOffer.status}</strong>. Negotiations are closed.
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default FPOOffers;
