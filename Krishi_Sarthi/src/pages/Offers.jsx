import { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  MessageSquare,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Send,
  User,
  Building,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { LoadingState } from "../components/ui/LoadingState";
import { animateStagger } from "../utils/animations";
import { api } from "../services/api";

export function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");

  // Negotiation modal
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
        delay: 0.05,
      });
    }
  }, [loading, activeTab]);

  const handleOpenNegotiate = async (offer) => {
    setActiveOffer(offer);
    setCounterPrice(offer.offer_price);
    setCounterQuantity(offer.quantity);
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

      // Refresh negotiation history
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

  const filteredOffers = useMemo(() => {
    if (activeTab === "All") return offers;
    return offers.filter(
      (o) => o.status.toLowerCase() === activeTab.toLowerCase()
    );
  }, [offers, activeTab]);

  return (
    <div ref={containerRef} className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            My Produce Offers & Negotiations
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Track commercial proposal status, review buyer counter-offers, and view finalized contracts.
          </p>
        </div>

        <Link to="/buyers">
          <Button size="sm" variant="primary" icon={ArrowRight}>
            Find More Buyers
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3 overflow-x-auto">
        {["All", "Pending", "Accepted", "Rejected"].map((tab) => {
          const count =
            tab === "All"
              ? offers.length
              : offers.filter((o) => o.status.toLowerCase() === tab.toLowerCase()).length;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {/* Offers List */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <LoadingState message="Loading your commercial offers..." />
        </div>
      ) : filteredOffers.length === 0 ? (
        <EmptyState
          title={`No ${activeTab !== "All" ? activeTab : ""} Offers Found`}
          description="You have not submitted any offers under this status. Browse open buyer requirements to initiate proposals."
          icon={FileText}
        />
      ) : (
        <div className="space-y-4">
          {filteredOffers.map((o) => (
            <Card
              key={o.id}
              className="offer-card-anim border-gray-200/90 hover:border-emerald-300 p-5 space-y-4 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      #KS-OFFER-{o.id}
                    </span>
                    <StatusBadge status={o.status} />
                    <span className="text-xs text-gray-400">
                      • Requirement #{o.requirement_id}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    {o.buyer_name || "Institutional Buyer"}
                  </h3>

                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin size={12} className="text-gray-400" />
                    {o.location || "Delivery Point on Record"}
                  </p>
                </div>

                <div className="sm:text-right">
                  <span className="text-xs text-gray-400 block">Offered Rate</span>
                  <span className="text-2xl font-black text-emerald-700">
                    ₹{Number(o.offer_price).toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500"> / {o.unit || "unit"}</span>
                </div>
              </div>

              {/* Offer Details Grid */}
              <div className="bg-gray-50 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-gray-400 block">Commodity</span>
                  <span className="font-bold text-gray-800 mt-0.5 block">
                    🌾 {o.crop_name}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block">Supply Volume</span>
                  <span className="font-bold text-gray-800 mt-0.5 block">
                    {o.quantity} {o.unit}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block">Total Est. Value</span>
                  <span className="font-bold text-emerald-700 mt-0.5 block">
                    ₹{(Number(o.offer_price) * (o.unit === "quintal" ? Number(o.quantity) : Number(o.quantity) / 100)).toLocaleString()}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block">Submitted At</span>
                  <span className="font-semibold text-gray-700 flex items-center gap-1 mt-0.5">
                    <Clock size={12} className="text-gray-400" />
                    {o.created_at ? new Date(o.created_at).toLocaleDateString() : "Recent"}
                  </span>
                </div>
              </div>

              {o.message && (
                <p className="text-xs text-gray-600 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                  <strong className="text-emerald-800">Your proposal note:</strong> {o.message}
                </p>
              )}

              {/* Actions */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs text-gray-500">
                  Buyer's Max Ceiling: <strong>₹{o.max_price || "Open"}</strong>
                </span>

                <div className="flex items-center gap-2">
                  {o.status === "accepted" ? (
                    <Link to="/transactions">
                      <Button size="sm" variant="primary" icon={ArrowRight}>
                        View Generated Contract
                      </Button>
                    </Link>
                  ) : o.status === "pending" ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleOpenNegotiate(o)}
                      icon={MessageSquare}
                    >
                      Negotiation History / Counter
                    </Button>
                  ) : null}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Negotiation History & Counter-Offer Modal */}
      {activeOffer && (
        <Modal
          isOpen={!!activeOffer}
          onClose={() => setActiveOffer(null)}
          title={`Negotiation Thread: #KS-OFFER-${activeOffer.id}`}
          subtitle={`Counterparty: ${activeOffer.buyer_name || "Buyer"} • ${activeOffer.crop_name}`}
        >
          <div className="space-y-4">
            {/* Negotiation History Stream */}
            <div className="max-h-60 overflow-y-auto space-y-3 p-1">
              {loadingNegotiations ? (
                <div className="py-4">
                  <LoadingState message="Fetching negotiation messages..." />
                </div>
              ) : negotiations.length === 0 ? (
                <div className="p-4 bg-gray-50 rounded-xl text-center text-xs text-gray-500">
                  No counter-offers exchanged yet. Initial proposal of ₹{activeOffer.offer_price} ({activeOffer.quantity} {activeOffer.unit}) is currently pending buyer review.
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
                      <span className={n.sender_role === "farmer" ? "text-emerald-800" : "text-blue-800"}>
                        {n.sender_role === "farmer" ? "🌾 You (Farmer)" : "🏢 Buyer"}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
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

            {/* Counter-Offer Form */}
            {activeOffer.status === "pending" && (
              <form onSubmit={handleCounterSubmit} className="pt-3 border-t border-gray-200 space-y-3">
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