import { useState, useEffect, useRef } from "react";
import {
  CheckCircle2,
  Sparkles,
  MapPin,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { Card, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Modal } from "../components/ui/Modal";
import { animateStagger } from "../utils/animations";

export function SellProduce() {
  const [crop, setCrop] = useState("Tomato");
  const [variety, setVariety] = useState("Abhinav (Hybrid)");
  const [quantity, setQuantity] = useState(800);
  const [grade, setGrade] = useState("Grade A");
  const [expectedPrice, setExpectedPrice] = useState(2520);
  const [location, setLocation] = useState("Indore, Madhya Pradesh");
  const [sellingPreference, setSellingPreference] = useState("Direct Procurement");
  const [deliveryDate, setDeliveryDate] = useState("2026-09-15");

  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [offerSuccessModal, setOfferSuccessModal] = useState(false);
  const [fpoModal, setFpoModal] = useState(false);
  const [fpoJoined, setFpoJoined] = useState(false);

  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      animateStagger(containerRef.current.querySelectorAll(".stagger-block"), {
        delay: 0.05,
      });
    }
  }, []);

  const buyers = [
    {
      id: 1,
      name: "FreshMart Direct",
      location: "Indore Logistics Hub",
      distance: "32 km",
      demand: "High",
      offeredPrice: 2520,
      reliability: 94,
      score: 91,
      paymentSpeed: "3 Days",
      recommended: true,
    },
    {
      id: 2,
      name: "Indore APMC Mandi",
      location: "Chhoithram Mandi, Indore",
      distance: "18 km",
      demand: "Medium",
      offeredPrice: 2440,
      reliability: 88,
      score: 84,
      paymentSpeed: "Immediate (Auction)",
      recommended: false,
    },
    {
      id: 3,
      name: "Bhopal Agro Traders",
      location: "Karond Mandi, Bhopal",
      distance: "190 km",
      demand: "Medium",
      offeredPrice: 2380,
      reliability: 82,
      score: 76,
      paymentSpeed: "7 Days",
      recommended: false,
    },
  ];

  const handleSendOfferSubmit = (e) => {
    if (e) e.preventDefault();
    setOfferSuccessModal(true);
  };

  const estimatedTotalValue = Math.round((quantity / 100) * expectedPrice);

  return (
    <div ref={containerRef} className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div className="stagger-block">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              List & Sell Your Produce
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              Enter your harvest details to discover algorithm-matched buyers with maximum net realization.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Mandi Price: ₹2,750/q
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Multi-section Form (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="stagger-block border-gray-200/90">
            <CardHeader
              title="Produce & Lot Specification"
              subtitle="Accurate quality grading ensures faster deals and zero mandi rejections."
            />

            <form onSubmit={handleSendOfferSubmit} className="space-y-5">
              {/* 1. Crop Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Crop"
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  required
                >
                  <option value="Tomato">🍅 Tomato (टमाटर)</option>
                  <option value="Onion">🧅 Onion (प्याज)</option>
                  <option value="Potato">🥔 Potato (आलू)</option>
                  <option value="Wheat">🌾 Wheat (गेहूं)</option>
                </Select>

                <Input
                  label="Variety / Hybrid"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  placeholder="e.g. Abhinav, Pusa"
                />
              </div>

              {/* 2. Quantity & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Quantity (Kilograms)"
                  type="number"
                  min="50"
                  step="10"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  suffix="kg"
                  helperText={`Equivalent to ${(quantity / 100).toFixed(1)} Quintals`}
                  required
                />

                <Select
                  label="Quality / Grade"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  helperText="Grade A fetch up to 15% higher realization"
                  required
                >
                  <option value="Grade A">Grade A (Firm, Uniform, Export/Retail)</option>
                  <option value="Grade B">Grade B (Standard Mandi Quality)</option>
                  <option value="Grade C">Grade C (Processing / Pulping)</option>
                </Select>
              </div>

              {/* 3. Expected Price & Benchmark */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Expected Price (₹ / quintal)"
                  type="number"
                  value={expectedPrice}
                  onChange={(e) => setExpectedPrice(Number(e.target.value))}
                  suffix="₹/q"
                  helperText="Benchmark mandi modal: ₹2,750/q"
                  required
                />

                <Input
                  label="Farm Location / Cluster"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Depalpur, Indore, MP"
                  icon={MapPin}
                  required
                />
              </div>

              {/* 4. Selling Preferences */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Selling Preference"
                  value={sellingPreference}
                  onChange={(e) => setSellingPreference(e.target.value)}
                >
                  <option value="Direct Procurement">Direct Buyer Procurement</option>
                  <option value="APMC Auction">APMC Mandi Competitive Bidding</option>
                  <option value="FPO Aggregation">FPO Shared Bulk Dispatch</option>
                </Select>

                <Input
                  label="Preferred Delivery Date"
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  icon={Calendar}
                  helperText="Mutually confirmed with buyer"
                />
              </div>
            </form>
          </Card>

          {/* FPO Aggregation Banner Card */}
          <Card className="stagger-block bg-gradient-to-br from-blue-50/70 to-emerald-50/40 border-blue-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                    FPO Aggregation Network
                  </span>
                  <Badge variant="blue">Save 30% Transit</Badge>
                </div>
                <h3 className="font-bold text-gray-900 text-base">
                  Combine produce with Malwa Farmer Producer Co.
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Pool small lots with 14 neighboring farmers to form a 10-tonne bulk truckload, unlocking institutional buyer contracts.
                </p>
              </div>

              <Button
                variant={fpoJoined ? "secondary" : "primary"}
                size="sm"
                className={fpoJoined ? "bg-blue-100 text-blue-800" : "bg-blue-600 hover:bg-blue-700"}
                onClick={() => {
                  setFpoJoined(true);
                  setFpoModal(true);
                }}
              >
                {fpoJoined ? "✓ Joined Batch #8" : "Join FPO Aggregation"}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column: Real-time Lot Preview & Recommended Buyers (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Real-time Lot Preview */}
          <Card className="stagger-block bg-gradient-to-br from-emerald-50/60 to-white border-emerald-200">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <span className="font-bold text-sm text-gray-900">
                  Live Lot Valuation
                </span>
              </div>
              <Badge variant="emerald">Auto Calculating</Badge>
            </div>

            <div className="py-4 space-y-3">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-500">Produce Lot:</span>
                <span className="font-bold text-gray-900">
                  {crop} • {quantity} kg ({grade})
                </span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-500">Variety & Origin:</span>
                <span className="font-medium text-gray-700">
                  {variety} • {location}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-500">Quoted Rate:</span>
                <span className="font-semibold text-gray-800">
                  ₹{expectedPrice.toLocaleString()} / quintal
                </span>
              </div>

              <div className="pt-3 border-t border-emerald-100 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-gray-500 block">
                    Estimated Gross Lot Value
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
                    ₹{estimatedTotalValue.toLocaleString()}
                  </span>
                </div>
                <span className="text-[11px] text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded font-medium">
                  {((quantity / 100) * expectedPrice > 0 ? "Ready to Offer" : "")}
                </span>
              </div>
            </div>
          </Card>

          {/* Recommended Buyers */}
          <Card className="stagger-block border-gray-200/90">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Recommended Buyers
                </h3>
                <p className="text-xs text-gray-500">
                  Sorted by net realization & reliability
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-700">
                3 Direct Matches
              </span>
            </div>

            <div className="space-y-3">
              {buyers.map((b) => (
                <div
                  key={b.id}
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                    selectedBuyer === b.name
                      ? "border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500/20"
                      : b.recommended
                      ? "border-emerald-200 bg-emerald-50/20 hover:border-emerald-300"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                          {b.name}
                        </h4>
                        {b.recommended && (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                            Top Match
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={12} className="text-gray-400" />
                        {b.location} • {b.distance}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-base sm:text-lg font-bold text-emerald-700">
                        ₹{b.offeredPrice}/q
                      </span>
                      <p className="text-[11px] text-gray-500">
                        Score: <strong className="text-emerald-700">{b.score}/100</strong>
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-gray-100 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px]">Demand</span>
                      <span className="font-semibold text-gray-700">{b.demand}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Reliability</span>
                      <span className="font-semibold text-emerald-700">{b.reliability}%</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Settlement</span>
                      <span className="font-semibold text-gray-700">{b.paymentSpeed}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <Button
                      size="sm"
                      variant={selectedBuyer === b.name ? "secondary" : "primary"}
                      onClick={() => setSelectedBuyer(b.name)}
                      className="w-full sm:w-auto"
                    >
                      {selectedBuyer === b.name ? "✓ Selected for Offer" : "Select & Send Offer"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Offer Form when buyer selected */}
            {selectedBuyer && (
              <div className="mt-5 p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-900">
                    Submit Formal Offer to {selectedBuyer}
                  </h4>
                  <Badge variant="emerald">Instant Verification</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <Input
                    label="Offer Quantity (kg)"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  />
                  <Input
                    label="Offer Price (₹/q)"
                    type="number"
                    value={expectedPrice}
                    onChange={(e) => setExpectedPrice(Number(e.target.value))}
                  />
                </div>

                <Button
                  onClick={handleSendOfferSubmit}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  icon={ArrowRight}
                >
                  Confirm & Submit Offer
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Offer Submitted Success Modal */}
      <Modal
        isOpen={offerSuccessModal}
        onClose={() => setOfferSuccessModal(false)}
        title="Offer Submitted Successfully!"
        subtitle="Your commercial offer has been recorded and transmitted to the buyer."
      >
        <div className="space-y-4 text-center sm:text-left">
          <div className="mx-auto sm:mx-0 h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={28} />
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-xs sm:text-sm text-gray-700">
            <div className="flex justify-between">
              <span className="text-gray-500">Consignment ID:</span>
              <span className="font-bold text-gray-900">KS-LOT-2026-88</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Buyer:</span>
              <span className="font-semibold text-gray-900">{selectedBuyer || "FreshMart Direct"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Produce:</span>
              <span className="font-semibold">{crop} ({quantity} kg • {grade})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Quoted Rate:</span>
              <span className="font-bold text-emerald-700">₹{expectedPrice}/quintal</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-gray-500">Total Lot Value:</span>
              <span className="font-extrabold text-emerald-700">₹{estimatedTotalValue.toLocaleString()}</span>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            The buyer typically responds within 2 hours. Track counter-offers and delivery schedules on your Offers page.
          </p>

          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1"
              onClick={() => setOfferSuccessModal(false)}
            >
              Done
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setOfferSuccessModal(false);
                window.location.href = "/offers";
              }}
            >
              View in My Offers
            </Button>
          </div>
        </div>
      </Modal>

      {/* FPO Aggregation Modal */}
      <Modal
        isOpen={fpoModal}
        onClose={() => setFpoModal(false)}
        title="Joined FPO Shared Lot Pool"
        subtitle="Batch #8 • Malwa Kisan Producer Co."
      >
        <div className="space-y-4 text-xs sm:text-sm text-gray-600">
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900">
            <p className="font-semibold">Your 800 kg Tomato lot has been pooled into Batch #8.</p>
            <p className="mt-1 text-xs text-blue-700">
              Current pooled volume: <strong>8,400 kg / 10,000 kg target</strong>. Pickup truck scheduled for tomorrow morning.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span>Estimated Logistics Savings:</span>
              <strong className="text-emerald-700">₹40 / quintal</strong>
            </div>
            <div className="flex justify-between">
              <span>Collection Point:</span>
              <strong>Depalpur Primary Ag Center</strong>
            </div>
            <div className="flex justify-between">
              <span>FPO Coordinator:</span>
              <strong>Rajesh Verma (98260-XXXXX)</strong>
            </div>
          </div>

          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2"
            onClick={() => setFpoModal(false)}
          >
            Acknowledge & Return
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default SellProduce;