import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Modal } from "../components/ui/Modal";
import { EmptyState } from "../components/ui/EmptyState";
import { animateStagger } from "../utils/animations";

const initialBuyers = [
  {
    id: 1,
    name: "FreshMart Retail Chains",
    crop: "Tomato",
    location: "Indore Logistics Hub",
    state: "Madhya Pradesh",
    distance: 32,
    demand: "High",
    quantityRequired: "5,000 kg",
    offeredPrice: 2520,
    mspBenchmark: 2500,
    reliability: 94,
    paymentSpeed: "3 Days",
    score: 91,
    verified: true,
    topMatch: true,
  },
  {
    id: 2,
    name: "Malwa Organics & Exports",
    crop: "Tomato",
    location: "Ujjain Road Cluster",
    state: "Madhya Pradesh",
    distance: 48,
    demand: "High",
    quantityRequired: "10,000 kg",
    offeredPrice: 2480,
    mspBenchmark: 2500,
    reliability: 91,
    paymentSpeed: "2 Days (Direct UPI)",
    score: 88,
    verified: true,
    topMatch: false,
  },
  {
    id: 3,
    name: "Indore Wholesale APMC Commission Agent",
    crop: "Tomato",
    location: "Choithram Mandi, Indore",
    state: "Madhya Pradesh",
    distance: 18,
    demand: "Medium",
    quantityRequired: "3,000 kg",
    offeredPrice: 2440,
    mspBenchmark: 2500,
    reliability: 88,
    paymentSpeed: "Immediate Cash",
    score: 84,
    verified: true,
    topMatch: false,
  },
  {
    id: 4,
    name: "Reliance Retail Hub",
    crop: "Tomato",
    location: "Pithampur Industrial Corridor",
    state: "Madhya Pradesh",
    distance: 42,
    demand: "Medium",
    quantityRequired: "15,000 kg",
    offeredPrice: 2420,
    mspBenchmark: 2500,
    reliability: 89,
    paymentSpeed: "7 Days",
    score: 80,
    verified: true,
    topMatch: false,
  },
  {
    id: 5,
    name: "Local Mandi Trader (Bhopal)",
    crop: "Tomato",
    location: "Karond Mandi, Bhopal",
    state: "Madhya Pradesh",
    distance: 195,
    demand: "Low",
    quantityRequired: "2,000 kg",
    offeredPrice: 2280,
    mspBenchmark: 2500,
    reliability: 68,
    paymentSpeed: "7–10 Days",
    score: 64,
    verified: false,
    topMatch: false,
  },
];

export function Buyers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [demandFilter, setDemandFilter] = useState("All");
  const [reliabilityFilter, setReliabilityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("scoreDesc");

  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerQuantity, setOfferQuantity] = useState(800);
  const [offerPrice, setOfferPrice] = useState(2520);
  const [deliveryDate, setDeliveryDate] = useState("2026-09-16");
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      animateStagger(containerRef.current.querySelectorAll(".buyer-card-anim"), {
        delay: 0.05,
      });
    }
  }, []);

  const filteredBuyers = useMemo(() => {
    return initialBuyers
      .filter((b) => {
        const matchesSearch =
          b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.crop.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDemand =
          demandFilter === "All" || b.demand.toLowerCase() === demandFilter.toLowerCase();

        const matchesRel =
          reliabilityFilter === "All" ||
          (reliabilityFilter === "90" && b.reliability >= 90) ||
          (reliabilityFilter === "80" && b.reliability >= 80);

        return matchesSearch && matchesDemand && matchesRel;
      })
      .sort((a, b) => {
        if (sortBy === "scoreDesc") return b.score - a.score;
        if (sortBy === "priceDesc") return b.offeredPrice - a.offeredPrice;
        if (sortBy === "distanceAsc") return a.distance - b.distance;
        if (sortBy === "relDesc") return b.reliability - a.reliability;
        return 0;
      });
  }, [searchQuery, demandFilter, reliabilityFilter, sortBy]);

  const handleOpenOffer = (buyer) => {
    setSelectedBuyer(buyer);
    setOfferPrice(buyer.offeredPrice);
    setOfferModalOpen(true);
  };

  const handleSendOfferSubmit = (e) => {
    e.preventDefault();
    setOfferModalOpen(false);
    setSuccessModalOpen(true);
  };

  const mspDifference = offerPrice - (selectedBuyer?.mspBenchmark || 2500);

  return (
    <div ref={containerRef} className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Buyer Discovery & Matching
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Verified institutional buyers, retail hubs, and exporters ranked by KrishiSarthi Opportunity Score.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            5 Active Direct Procurement Calls
          </span>
        </div>
      </div>

      {/* Search & Filter Ribbon */}
      <Card className="p-3 sm:p-4 border-gray-200/90">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            placeholder="Search buyers, clusters, crops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
          />

          <Select
            value={demandFilter}
            onChange={(e) => setDemandFilter(e.target.value)}
          >
            <option value="All">All Demand Levels</option>
            <option value="High">High Demand Only</option>
            <option value="Medium">Medium Demand</option>
            <option value="Low">Low Demand</option>
          </Select>

          <Select
            value={reliabilityFilter}
            onChange={(e) => setReliabilityFilter(e.target.value)}
          >
            <option value="All">All Reliability Ratings</option>
            <option value="90">90%+ Verified Rating</option>
            <option value="80">80%+ Verified Rating</option>
          </Select>

          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="scoreDesc">Sort: Opportunity Score</option>
            <option value="priceDesc">Sort: Highest Offered Price</option>
            <option value="distanceAsc">Sort: Nearest Distance</option>
            <option value="relDesc">Sort: Highest Reliability</option>
          </Select>
        </div>
      </Card>

      {/* Buyer Cards List */}
      {filteredBuyers.length === 0 ? (
        <EmptyState
          title="No Buyers Found"
          description="No buyers match your current criteria. Try resetting the filters or broaden your search."
          actionLabel="Reset Filters"
          onAction={() => {
            setSearchQuery("");
            setDemandFilter("All");
            setReliabilityFilter("All");
            setSortBy("scoreDesc");
          }}
        />
      ) : (
        <div className="space-y-4">
          {filteredBuyers.map((b) => (
            <div
              key={b.id}
              className={`buyer-card-anim rounded-2xl border transition-all duration-200 p-4 sm:p-6 ${
                b.topMatch
                  ? "bg-gradient-to-br from-emerald-50/70 via-white to-white border-2 border-emerald-500 shadow-xs hover:shadow-md"
                  : "bg-white border-gray-200/90 hover:border-emerald-300 shadow-2xs hover:shadow-xs"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {b.topMatch && (
                      <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles size={12} className="text-emerald-600" />
                        #1 Top Algorithm Match
                      </span>
                    )}
                    {b.verified && (
                      <span className="text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ShieldCheck size={12} /> Verified Trader
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      Looking for <strong>{b.crop}</strong>
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                      {b.name}
                    </h3>
                    <span className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                      <MapPin size={13} className="text-gray-400" />
                      {b.location} • {b.distance} km
                    </span>
                  </div>

                  {/* Badges & tags */}
                  <div className="flex items-center gap-3 text-xs text-gray-600 flex-wrap">
                    <span>
                      Order Volume: <strong className="text-gray-800">{b.quantityRequired}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Payment Speed: <strong className="text-emerald-700">{b.paymentSpeed}</strong>
                    </span>
                  </div>
                </div>

                {/* Right: Metrics & Score */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 bg-white sm:bg-gray-50/80 p-3.5 sm:p-4 rounded-xl border border-gray-100 sm:border-gray-200 flex-shrink-0">
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-gray-400 block">Offered Rate</span>
                    <span className="text-xl sm:text-2xl font-black text-emerald-700">
                      ₹{b.offeredPrice}
                    </span>
                    <span className="text-xs text-gray-500"> / quintal</span>
                  </div>

                  <div className="h-8 w-px bg-gray-200 hidden sm:block" />

                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px]">Demand</span>
                      <span className={`font-bold ${b.demand === "High" ? "text-emerald-700" : "text-gray-700"}`}>
                        {b.demand}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Reliability</span>
                      <span className="font-bold text-emerald-700">{b.reliability}%</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Distance</span>
                      <span className="font-semibold text-gray-700">{b.distance} km</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Opp. Score</span>
                      <span className="font-extrabold text-emerald-600">{b.score}/100</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={b.topMatch ? "primary" : "outline"}
                    onClick={() => handleOpenOffer(b)}
                    className="w-full sm:w-auto"
                  >
                    Contact Buyer
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contact Buyer & Send Offer Modal */}
      <Modal
        isOpen={offerModalOpen}
        onClose={() => setOfferModalOpen(false)}
        title={`Send Direct Offer to ${selectedBuyer?.name}`}
        subtitle={`Negotiate consignment terms for ${selectedBuyer?.crop} • ${selectedBuyer?.location}`}
      >
        {selectedBuyer && (
          <form onSubmit={handleSendOfferSubmit} className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Offer Quantity (kg)"
                type="number"
                value={offerQuantity}
                onChange={(e) => setOfferQuantity(Number(e.target.value))}
                helperText={`~${(offerQuantity / 100).toFixed(1)} Quintals`}
                required
              />

              <Input
                label="Your Price (₹ / quintal)"
                type="number"
                value={offerPrice}
                onChange={(e) => setOfferPrice(Number(e.target.value))}
                suffix="₹/q"
                required
              />
            </div>

            {/* MSP Gap Alert Box */}
            <div className={`p-3.5 rounded-xl border ${
              mspDifference >= 0
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-amber-50 border-amber-200 text-amber-900"
            }`}>
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                {mspDifference >= 0 ? (
                  <CheckCircle2 size={16} className="text-emerald-600" />
                ) : (
                  <AlertTriangle size={16} className="text-amber-600" />
                )}
                <span>MSP Benchmark Comparative Analysis</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed">
                Applicable MSP benchmark for this commodity is <strong>₹{selectedBuyer.mspBenchmark}/q</strong>.
              </p>
              <div className="mt-2 pt-2 border-t border-current/20 flex items-center justify-between text-xs font-semibold">
                <span>Offered Rate: ₹{offerPrice}/q</span>
                <span className={mspDifference >= 0 ? "text-emerald-700" : "text-amber-800"}>
                  {mspDifference >= 0
                    ? `+₹${mspDifference}/q above MSP`
                    : `-₹${Math.abs(mspDifference)}/q below MSP`}
                </span>
              </div>
            </div>

            {/* Delivery Date */}
            <div>
              <Input
                label="Preferred Consignment Pickup Date"
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                helperText="Buyer and farmer can mutually agree on final vehicle arrival."
                required
              />
            </div>

            <div className="pt-2 flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setOfferModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Send Offer
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Offer Sent Success Modal */}
      <Modal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        title="Commercial Offer Dispatched!"
        subtitle="Your terms have been pushed to the buyer's procurement desk."
      >
        <div className="space-y-4 text-center sm:text-left">
          <div className="mx-auto sm:mx-0 h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={28} />
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Target Buyer:</span>
              <span className="font-bold text-gray-900">{selectedBuyer?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Offered Volume:</span>
              <span className="font-semibold">{offerQuantity} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Quoted Price:</span>
              <span className="font-bold text-emerald-700">₹{offerPrice}/q</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery Target:</span>
              <span className="font-semibold">{deliveryDate}</span>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={() => {
              setSuccessModalOpen(false);
              window.location.href = "/offers";
            }}
          >
            Track in My Offers
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default Buyers;