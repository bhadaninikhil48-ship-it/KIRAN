import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Sparkles,
  MapPin,
  Calendar,
  ArrowRight,
  Trash2,
  AlertCircle,
  Plus,
  Package,
} from "lucide-react";
import { Card, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Modal } from "../components/ui/Modal";
import { StatusBadge } from "../components/ui/StatusBadge";
import { EmptyState } from "../components/ui/EmptyState";
import { LoadingState } from "../components/ui/LoadingState";
import { animateStagger } from "../utils/animations";
import { api } from "../services/api";

export function SellProduce() {
  const [crop, setCrop] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [grade, setGrade] = useState("Grade A");
  const [expectedPrice, setExpectedPrice] = useState("");
  const [location, setLocation] = useState("");
const [deliveryDate, setDeliveryDate] = useState("");
  // Data states
  const [myProduce, setMyProduce] = useState([]);
  const [loadingProduce, setLoadingProduce] = useState(true);
  const [listingProduce, setListingProduce] = useState(false);
  const [openRequirements, setOpenRequirements] = useState([]);
  const [loadingReqs, setLoadingReqs] = useState(false);
  const [liveBenchmarkPrice, setLiveBenchmarkPrice] = useState(null);

  // Status messages
  const [listingSuccess, setListingSuccess] = useState("");
  const [listingError, setListingError] = useState("");

  // Offer submission modal state
  const [selectedReq, setSelectedReq] = useState(null);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerQty, setOfferQty] = useState("");
  const [offerMsg, setOfferMsg] = useState("");
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [offerSuccessModal, setOfferSuccessModal] = useState(false);
  const [offerSuccessData, setOfferSuccessData] = useState(null);
  const [offerError, setOfferError] = useState("");

  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      animateStagger(containerRef.current.querySelectorAll(".stagger-block"), {
        delay: 0.05,
      });
    }
  }, []);

  // Fetch farmer's produce list
  const fetchMyProduce = async () => {
    try {
      setLoadingProduce(true);
      const data = await api.get("/api/produce/my");
      setMyProduce(data?.produce || []);
    } catch (err) {
      console.error("Failed to load my produce:", err);
    } finally {
      setLoadingProduce(false);
    }
  };

  // Fetch open buyer requirements & live market benchmark
  const fetchMarketContext = async () => {
    try {
      setLoadingReqs(true);
      // Fetch open buyer requirements
      const reqData = await api.get(`/api/buyer/requirements/open${crop ? `?crop=${encodeURIComponent(crop)}` : ""}`);
      setOpenRequirements(reqData?.requirements || []);

      // Fetch benchmark market price for this crop
      const priceData = await api.get("/api/market/prices");
      if (priceData?.prices?.length > 0) {
        const matchingPrices = priceData.prices.filter(
          (p) => p.crop_name.toLowerCase() === crop.toLowerCase()
        );
        if (matchingPrices.length > 0) {
          setLiveBenchmarkPrice(Number(matchingPrices[0].modal_price));
        } else {
          setLiveBenchmarkPrice(null);
        }
      }
    } catch (err) {
      console.error("Failed to fetch market context:", err);
    } finally {
      setLoadingReqs(false);
    }
  };

  useEffect(() => {
    fetchMyProduce();
  }, []);

  useEffect(() => {
    fetchMarketContext();
  }, [crop]);

  // Handle Produce Creation
  const handleListProduce = async (e) => {
    e.preventDefault();
    setListingSuccess("");
    setListingError("");
    setListingProduce(true);

    try {
      const payload = {
        crop_name: crop,
        quantity: Number(quantity),
        unit: unit,
        quality_grade: grade,
        expected_harvest_date: deliveryDate,
        available_from: deliveryDate,
        location: location || "Indore, Madhya Pradesh",
      };

      const res = await api.post("/api/produce", payload);
      setListingSuccess(res.message || "Produce successfully listed on KIRAN marketplace!");
      fetchMyProduce();
    } catch (err) {
      setListingError(err.message || "Failed to list produce");
    } finally {
      setListingProduce(false);
    }
  };

  // Handle Delete Produce
  const handleDeleteProduce = async (produceId) => {
    if (!window.confirm("Are you sure you want to remove this produce listing?")) return;
    try {
      await api.delete(`/api/produce/${produceId}`);
      fetchMyProduce();
    } catch (err) {
      alert("Failed to delete produce: " + err.message);
    }
  };

  // Open Offer Modal for a requirement
  const handleOpenOfferModal = (req) => {
    setSelectedReq(req);
    setOfferPrice(req.max_price || liveBenchmarkPrice || expectedPrice);
    setOfferQty(req.quantity);
    setOfferMsg(`I can supply ${grade} fresh ${req.crop_name} from ${location || "my farm"}.`);
    setOfferError("");
  };

  // Submit Offer to Buyer Requirement
  const handleSendOfferSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReq) return;

    setSubmittingOffer(true);
    setOfferError("");

    try {
      const payload = {
        requirement_id: selectedReq.id,
        offer_price: Number(offerPrice),
        quantity: Number(offerQty),
        message: offerMsg,
      };

      const res = await api.post("/api/offers", payload);
      setOfferSuccessData({
        offerId: res.offerId,
        buyer: selectedReq.buyer_name || "Institutional Buyer",
        crop: selectedReq.crop_name,
        quantity: offerQty,
        unit: selectedReq.unit,
        price: offerPrice,
        total: Number(offerPrice) * (selectedReq.unit === "quintal" ? Number(offerQty) : Number(offerQty) / 100),
      });
      setSelectedReq(null);
      setOfferSuccessModal(true);
    } catch (err) {
      setOfferError(err.message || "Failed to submit offer to buyer");
    } finally {
      setSubmittingOffer(false);
    }
  };

  const estimatedTotalValue = Math.round((quantity / (unit === "quintal" ? 1 : 100)) * expectedPrice);

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
              List your harvest to match with open institutional buyer procurement requirements.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {liveBenchmarkPrice ? (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Live {crop} Benchmark: ₹{liveBenchmarkPrice.toLocaleString()}/q
              </span>
            ) : (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                Mandi Benchmark Available
              </span>
            )}
          </div>
        </div>
      </div>

      {listingSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-sm text-emerald-800 animate-fadeIn">
          <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
          <span>{listingSuccess}</span>
        </div>
      )}

      {listingError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-sm text-red-700 animate-fadeIn">
          <AlertCircle size={18} className="shrink-0 text-red-600" />
          <span>{listingError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form & Inventory (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="stagger-block border-gray-200/90">
            <CardHeader
              title="Produce & Lot Specification"
              subtitle="Specify harvest specifications to publish your lot on the KIRAN exchange."
            />

            <form onSubmit={handleListProduce} className="space-y-5">
              {/* 1. Crop Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Crop Name <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    list="crop-options"
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    placeholder="Type or select crop name"
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />

                  <datalist id="crop-options">
                    <option value="Tomato" />
                    <option value="Potato" />
                    <option value="Onion" />
                    <option value="Wheat" />
                    <option value="Garlic" />
                    <option value="Mango" />
                    <option value="Grapes" />

                    {/* More common crops */}
                    <option value="Rice" />
                    <option value="Maize" />
                    <option value="Chilli" />
                    <option value="Apple" />
                    <option value="Banana" />
                    <option value="Pomegranate" />
                    <option value="Guava" />
                    <option value="Papaya" />
                    <option value="Carrot" />
                    <option value="Cabbage" />
                    <option value="Cauliflower" />
                    <option value="Peas" />
                    <option value="Soybean" />
                    <option value="Groundnut" />
                    <option value="Mustard" />
                  </datalist>
                </div>

                <Select
                  label="Quality / Grade"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  required
                >
                  <option value="Grade A">Grade A </option>
                  <option value="Grade B">Grade B </option>
                  <option value="Grade C">Grade C </option>
                </Select>
              </div>

              {/* 2. Quantity & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Quantity"
                  placeholder="2700"
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  suffix={unit}
                  required
                />

                <Select
                  label="Quantity Unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  required
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="quintal">Quintals (q)</option>
                </Select>
              </div>

              {/* 3. Expected Price & Farm Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Target Quoted Rate (₹ / quintal)"
                  placeholder="5000"
                  type="number"
                  min="100"
                  value={expectedPrice}
                  onChange={(e) => setExpectedPrice(Number(e.target.value))}
                  suffix="₹/q"
                  required
                />

                <Input
                  label="Farmgate Location / Cluster"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Mumbai, Maharashtra"
                  icon={MapPin}
                  required
                />
              </div>

              {/* 4. Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Available / Ready Harvest Date"
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  icon={Calendar}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={listingProduce}
                className="w-full font-semibold shadow-xs"
                icon={Plus}
              >
                List Produce on KIRAN
              </Button>
            </form>
          </Card>

          {/* My Listed Produce Section */}
          <Card className="stagger-block border-gray-200/90">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  My Active Produce Listings
                </h3>
                <p className="text-xs text-gray-500">
                  Real-time database records of your agricultural lots
                </p>
              </div>
              <Badge variant="emerald">{myProduce.length} Lots Listed</Badge>
            </div>

            {loadingProduce ? (
              <LoadingState message="Loading your produce listings..." />
            ) : myProduce.length === 0 ? (
              <EmptyState
                title="No Produce Listed Yet"
                description="List your current harvest using the form above to connect with institutional buyers."
                icon={Package}
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {myProduce.map((item) => (
                  <div key={item.id} className="py-3.5 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">{item.crop_name}</span>
                        <StatusBadge status={item.status} />
                        {item.quality_grade && (
                          <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                            {item.quality_grade}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {item.quantity} {item.unit} • {item.location || "Farmgate"}
                        {item.available_from && ` • Ready: ${item.available_from.split("T")[0]}`}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteProduce(item.id)}
                      title="Delete Listing"
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Real-time Lot Valuation & Open Buyer Requirements (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Real-time Lot Valuation Card */}
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
                  {crop} • {quantity} {unit} ({grade})
                </span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-500">Origin / Location:</span>
                <span className="font-medium text-gray-700">
                  {location || "Indore, Madhya Pradesh"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-500">Target Rate:</span>
                <span className="font-semibold text-gray-800">
                  ₹{expectedPrice.toLocaleString()} / quintal
                </span>
              </div>

              <div className="pt-3 border-t border-emerald-100 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-gray-500 block">
                    Estimated Gross Realization
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
                    ₹{estimatedTotalValue.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Open Buyer Requirements for Selected Crop */}
          <Card className="stagger-block border-gray-200/90">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Active Buyer Requirements ({crop})
                </h3>
                <p className="text-xs text-gray-500">
                  Direct commercial procurement orders in MySQL
                </p>
              </div>
              <Badge variant="emerald">{openRequirements.length} Active</Badge>
            </div>

            {loadingReqs ? (
              <LoadingState message="Scanning open buyer orders..." />
            ) : openRequirements.length === 0 ? (
              <EmptyState
                title={`No Open Requirements for ${crop}`}
                description="Your produce listing is active and discoverable. When institutional buyers post matching requirements, they will appear here."
              />
            ) : (
              <div className="space-y-3">
                {openRequirements.map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 sm:p-4 rounded-xl border border-gray-200 bg-white hover:border-emerald-300 transition-all space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">
                          {req.buyer_name || "Verified Buyer"}
                        </h4>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={12} className="text-gray-400" />
                          {req.location || "Location on file"}
                          {req.required_by && ` • Need by ${req.required_by.split("T")[0]}`}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        {req.max_price && (
                          <span className="text-base font-bold text-emerald-700 block">
                            Up to ₹{req.max_price}
                          </span>
                        )}
                        <span className="text-[11px] text-gray-500">
                          Qty: <strong>{req.quantity} {req.unit}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-medium">
                        Grade: {req.quality_grade || "Any Standard"}
                      </span>
                      <Button
                        size="xs"
                        variant="primary"
                        onClick={() => handleOpenOfferModal(req)}
                        icon={ArrowRight}
                      >
                        Send Offer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Offer Submission Modal */}
      {selectedReq && (
        <Modal
          isOpen={!!selectedReq}
          onClose={() => setSelectedReq(null)}
          title={`Submit Offer to ${selectedReq.buyer_name || "Buyer"}`}
          subtitle={`Requirement: ${selectedReq.quantity} ${selectedReq.unit} of ${selectedReq.crop_name}`}
        >
          <form onSubmit={handleSendOfferSubmit} className="space-y-4">
            {offerError && (
              <div className="p-3 rounded-lg bg-red-50 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{offerError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Offer Price (₹)"
                type="number"
                required
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                helperText={`Buyer's ceiling: ₹${selectedReq.max_price || "Open"}`}
              />

              <Input
                label={`Quantity (${selectedReq.unit})`}
                type="number"
                required
                value={offerQty}
                onChange={(e) => setOfferQty(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                Message to Buyer (Optional)
              </label>
              <textarea
                rows={3}
                value={offerMsg}
                onChange={(e) => setOfferMsg(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Include quality specifics or dispatch availability..."
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => setSelectedReq(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={submittingOffer}
                icon={ArrowRight}
              >
                Confirm & Submit Offer
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Offer Submitted Success Modal */}
      <Modal
        isOpen={offerSuccessModal}
        onClose={() => setOfferSuccessModal(false)}
        title="Offer Submitted to Buyer"
        subtitle="Your commercial proposal has been recorded in the KIRAN database."
      >
        <div className="space-y-4">
          <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={28} />
          </div>

          {offerSuccessData && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-xs sm:text-sm text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-500">Offer ID:</span>
                <span className="font-bold text-gray-900">#KS-OFFER-{offerSuccessData.offerId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Target Buyer:</span>
                <span className="font-semibold text-gray-900">{offerSuccessData.buyer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Proposed Crop:</span>
                <span className="font-semibold">{offerSuccessData.crop} ({offerSuccessData.quantity} {offerSuccessData.unit})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Offered Rate:</span>
                <span className="font-bold text-emerald-700">₹{offerSuccessData.price}</span>
              </div>
            </div>
          )}

          <p className="text-xs text-gray-500">
            The buyer can accept, counter-offer, or reject this proposal. You can monitor and respond to counter-proposals in My Offers.
          </p>

          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1"
              onClick={() => setOfferSuccessModal(false)}
            >
              Done
            </Button>
            <Link to="/offers" className="flex-1">
              <Button variant="outline" className="w-full">
                View in My Offers
              </Button>
            </Link>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default SellProduce;