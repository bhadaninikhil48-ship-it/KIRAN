import { useState, useMemo, useRef, useEffect } from "react";
import {
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { EmptyState } from "../components/ui/EmptyState";
import { animateStagger } from "../utils/animations";

const initialOffers = [
  {
    id: "KS-OFFER-101",
    buyer: "FreshMart Direct Logistics",
    crop: "Tomato (Grade A)",
    quantity: 800,
    price: 2520,
    paymentTerms: "3 Days post delivery",
    deliveryTerms: "Farmgate Pickup Included",
    reliability: 94,
    status: "Pending",
    sentTime: "Today, 08:30 AM",
    expiryTime: "Expires in 18 hrs",
  },
  {
    id: "KS-OFFER-102",
    buyer: "Malwa Organics & Exports",
    crop: "Tomato (Grade A)",
    quantity: 1200,
    price: 2480,
    paymentTerms: "Direct Bank Transfer (48 hrs)",
    deliveryTerms: "FPO Collection Center",
    reliability: 91,
    status: "Negotiation",
    sentTime: "Yesterday",
    expiryTime: "Counter-offer active",
  },
  {
    id: "KS-OFFER-103",
    buyer: "Indore APMC Commission House",
    crop: "Tomato (Grade B)",
    quantity: 500,
    price: 2440,
    paymentTerms: "Immediate Cash / Mandi Mandate",
    deliveryTerms: "Farmer drop at Chhoithram",
    reliability: 88,
    status: "Accepted",
    sentTime: "2 days ago",
    expiryTime: "Contract Confirmed",
  },
  {
    id: "KS-OFFER-104",
    buyer: "Local Agro Trader Bhopal",
    crop: "Tomato (Grade A)",
    quantity: 800,
    price: 2280,
    paymentTerms: "10 Days Credit",
    deliveryTerms: "Farmer delivery to Karond",
    reliability: 68,
    status: "Rejected",
    sentTime: "3 days ago",
    expiryTime: "Offer Closed",
  },
];

export function Offers() {
  const [offers, setOffers] = useState(initialOffers);
  const [activeTab, setActiveTab] = useState("All");
  const [counterModalOpen, setCounterModalOpen] = useState(false);
  const [activeOffer, setActiveOffer] = useState(null);
  const [counterPrice, setCounterPrice] = useState(2600);

  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      animateStagger(containerRef.current.querySelectorAll(".offer-card-anim"), {
        delay: 0.05,
      });
    }
  }, [activeTab]);

  const updateOfferStatus = (id, newStatus) => {
    setOffers((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
  };

  const handleOpenCounter = (offer) => {
    setActiveOffer(offer);
    setCounterPrice(offer.price + 80);
    setCounterModalOpen(true);
  };

  const handleCounterSubmit = (e) => {
    e.preventDefault();
    if (activeOffer) {
      setOffers((prev) =>
        prev.map((o) =>
          o.id === activeOffer.id
            ? { ...o, status: "Negotiation", price: counterPrice }
            : o
        )
      );
    }
    setCounterModalOpen(false);
  };

  const filteredOffers = useMemo(() => {
    if (activeTab === "All") return offers;
    return offers.filter(
      (o) => o.status.toLowerCase() === activeTab.toLowerCase()
    );
  }, [offers, activeTab]);

  return (
    <div ref={containerRef} className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Produce Offers & Negotiations
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Compare incoming buyer procurement offers, evaluate payment terms, and finalize transactions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            {offers.filter((o) => o.status === "Pending").length} Pending Action
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-gray-200/70 rounded-xl overflow-x-auto text-xs sm:text-sm max-w-full">
        {["All", "Pending", "Negotiation", "Accepted", "Rejected"].map((tab) => {
          const count =
            tab === "All"
              ? offers.length
              : offers.filter((o) => o.status.toLowerCase() === tab.toLowerCase())
                  .length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === tab
                  ? "bg-white text-emerald-800 shadow-2xs font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span>{tab}</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Offers Cards / Comparison Matrix */}
      {filteredOffers.length === 0 ? (
        <EmptyState
          title={`No ${activeTab !== "All" ? activeTab : ""} Offers Found`}
          description="There are currently no offers under this status category."
          actionLabel="View All Offers"
          onAction={() => setActiveTab("All")}
        />
      ) : (
        <div className="space-y-4">
          {filteredOffers.map((offer) => {
            const totalValue = Math.round((offer.quantity / 100) * offer.price);

            return (
              <Card
                key={offer.id}
                className="offer-card-anim border-gray-200/90 hover:border-emerald-300 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-medium text-gray-400">
                        {offer.id}
                      </span>
                      <StatusBadge status={offer.status} />
                      <span className="text-xs text-gray-400">• {offer.sentTime}</span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                      {offer.buyer}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Produce: <strong className="text-gray-800">{offer.crop}</strong> • {offer.quantity} kg
                    </p>
                  </div>

                  <div className="flex items-baseline lg:items-end flex-col">
                    <span className="text-xs text-gray-400 uppercase">Gross Deal Worth</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
                        ₹{totalValue.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">
                        (@ ₹{offer.price}/q)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Comparison Specifications Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3.5 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[11px]">Payment Terms</span>
                    <span className="font-semibold text-gray-800">{offer.paymentTerms}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Logistics / Delivery</span>
                    <span className="font-semibold text-gray-800">{offer.deliveryTerms}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Buyer Trust Rating</span>
                    <span className="font-bold text-emerald-700">{offer.reliability}% Verified</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Contract Status</span>
                    <span className="font-medium text-gray-600">{offer.expiryTime}</span>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    Backed by KrishiSarthi Escrow & FPO dispute guarantee
                  </span>

                  <div className="flex items-center gap-2 flex-wrap">
                    {offer.status === "Pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateOfferStatus(offer.id, "Rejected")}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenCounter(offer)}
                        >
                          Counter Offer
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => updateOfferStatus(offer.id, "Accepted")}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          Accept Offer
                        </Button>
                      </>
                    )}

                    {offer.status === "Negotiation" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenCounter(offer)}
                        >
                          Revise Counter
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => updateOfferStatus(offer.id, "Accepted")}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          Accept Current Counter
                        </Button>
                      </>
                    )}

                    {offer.status === "Accepted" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => (window.location.href = "/transactions")}
                        icon={ArrowRight}
                      >
                        Track Transaction & Dispatch
                      </Button>
                    )}

                    {offer.status === "Rejected" && (
                      <span className="text-xs text-gray-400 italic">
                        Offer archived and declined
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Counter Offer Modal */}
      <Modal
        isOpen={counterModalOpen}
        onClose={() => setCounterModalOpen(false)}
        title="Propose Counter Offer"
        subtitle={`Negotiate price terms with ${activeOffer?.buyer}`}
      >
        <form onSubmit={handleCounterSubmit} className="space-y-4 text-xs sm:text-sm">
          <div className="p-3 bg-gray-50 rounded-xl space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Current Buyer Offer:</span>
              <span className="font-bold text-gray-900">₹{activeOffer?.price}/q</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Produce Lot:</span>
              <span className="font-medium">{activeOffer?.crop} ({activeOffer?.quantity} kg)</span>
            </div>
          </div>

          <div>
            <Input
              label="Your Counter Price (₹ / quintal)"
              type="number"
              value={counterPrice}
              onChange={(e) => setCounterPrice(Number(e.target.value))}
              suffix="₹/q"
              helperText="Fair competitive benchmark: ₹2,550 - ₹2,700/q"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setCounterModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Send Counter Offer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Offers;