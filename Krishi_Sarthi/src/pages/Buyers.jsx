import { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Calendar,
  Package,
  ArrowRight,
  Send,
  Users,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Modal } from "../components/ui/Modal";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { LoadingState } from "../components/ui/LoadingState";
import { animateStagger } from "../utils/animations";
import { api } from "../services/api";

export function Buyers() {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cropFilter, setCropFilter] = useState("All");
  const [sortBy, setSortBy] = useState("priceDesc");

  // Offer modal states
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerQuantity, setOfferQuantity] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [offerError, setOfferError] = useState("");
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [createdOfferData, setCreatedOfferData] = useState(null);

  const containerRef = useRef(null);

  // Fetch real open buyer requirements
  const fetchBuyerRequirements = async () => {
    try {
      setLoading(true);
      const data = await api.get("/api/buyer/requirements/open");
      setBuyers(data?.requirements || []);
    } catch (err) {
      console.error("Failed to load buyer requirements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyerRequirements();
  }, []);

  useEffect(() => {
    if (containerRef.current && !loading) {
      animateStagger(containerRef.current.querySelectorAll(".buyer-card-anim"), {
        delay: 0.05,
      });
    }
  }, [loading, searchQuery, cropFilter, sortBy]);

  const uniqueCrops = [
    "All",
    ...new Set(buyers.map((b) => b.crop_name).filter(Boolean)),
  ];

  const filteredBuyers = useMemo(() => {
    return buyers
      .filter((b) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          b.buyer_name?.toLowerCase().includes(query) ||
          b.crop_name?.toLowerCase().includes(query) ||
          b.location?.toLowerCase().includes(query);

        const matchesCrop =
          cropFilter === "All" ||
          b.crop_name?.toLowerCase() === cropFilter.toLowerCase();

        return matchesSearch && matchesCrop;
      })
      .sort((a, b) => {
        if (sortBy === "priceDesc") {
          return Number(b.max_price || 0) - Number(a.max_price || 0);
        }
        if (sortBy === "priceAsc") {
          return Number(a.max_price || 0) - Number(b.max_price || 0);
        }
        if (sortBy === "qtyDesc") {
          return Number(b.quantity || 0) - Number(a.quantity || 0);
        }
        return 0;
      });
  }, [buyers, searchQuery, cropFilter, sortBy]);

  const handleOpenOffer = (buyerReq) => {
    setSelectedBuyer(buyerReq);
    setOfferPrice(buyerReq.max_price || "");
    setOfferQuantity(buyerReq.quantity || "");
    setOfferMessage(`I have Grade A ${buyerReq.crop_name} ready for prompt dispatch.`);
    setOfferError("");
    setOfferModalOpen(true);
  };

  const handleSendOfferSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBuyer) return;

    setSubmittingOffer(true);
    setOfferError("");

    try {
      const payload = {
        requirement_id: selectedBuyer.id,
        offer_price: Number(offerPrice),
        quantity: Number(offerQuantity),
        message: offerMessage,
      };

      const res = await api.post("/api/offers", payload);
      setCreatedOfferData({
        offerId: res.offerId,
        buyerName: selectedBuyer.buyer_name || "Institutional Buyer",
        crop: selectedBuyer.crop_name,
        price: offerPrice,
        quantity: offerQuantity,
        unit: selectedBuyer.unit,
      });

      setOfferModalOpen(false);
      setSuccessModalOpen(true);
    } catch (err) {
      setOfferError(err.message || "Failed to submit commercial offer to buyer");
    } finally {
      setSubmittingOffer(false);
    }
  };

  return (
    <div ref={containerRef} className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Find & Match Buyers
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Discover verified open procurement requirements posted by institutional buyers and wholesale traders.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="emerald">
            {buyers.length} Active Direct Requirements
          </Badge>
        </div>
      </div>

      {/* Search & Filter Ribbon */}
      <Card className="p-3 sm:p-4 border-gray-200/90">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Input
            placeholder="Search buyer name, crop, or district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
          />

          <Select
            label=""
            value={cropFilter}
            onChange={(e) => setCropFilter(e.target.value)}
          >
            {uniqueCrops.map((c) => (
              <option key={c} value={c}>
                {c === "All" ? "Filter by All Crops" : `Crop: ${c}`}
              </option>
            ))}
          </Select>

          <Select
            label=""
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="priceDesc">Sort: Highest Offered Rate</option>
            <option value="priceAsc">Sort: Lowest Offered Rate</option>
            <option value="qtyDesc">Sort: Highest Required Volume</option>
          </Select>
        </div>
      </Card>

      {/* Results Section */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <LoadingState message="Fetching active institutional buyer requirements..." />
        </div>
      ) : filteredBuyers.length === 0 ? (
        <EmptyState
          title="No Matching Buyer Requirements Found"
          description="There are currently no open buyer requirements matching your search filters. Prospective buyers will reach out once you list your produce."
          icon={Users}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {filteredBuyers.map((b) => (
            <Card
              key={b.id}
              className="buyer-card-anim border-gray-200/90 hover:border-emerald-400 p-5 space-y-4 transition-all hover:shadow-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-base">
                      {b.buyer_name || "Verified Buyer"}
                    </h3>
                    <Badge variant="emerald" dot>
                      Open Order
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin size={13} className="text-gray-400" />
                    {b.location || "Delivery Point on Request"}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-gray-400 block">Ceiling Rate</span>
                  <span className="text-xl font-extrabold text-emerald-700">
                    {b.max_price ? `₹${Number(b.max_price).toLocaleString()}` : "Open"}
                  </span>
                  <span className="text-xs text-gray-500"> / {b.unit}</span>
                </div>
              </div>

              {/* Requirement Specs */}
              <div className="bg-gray-50 rounded-xl p-3 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-gray-400 block">Crop</span>
                  <span className="font-bold text-gray-800 flex items-center gap-1 mt-0.5">
                    🌾 {b.crop_name}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block">Volume Needed</span>
                  <span className="font-bold text-gray-800 flex items-center gap-1 mt-0.5">
                    <Package size={13} className="text-gray-400" />
                    {b.quantity} {b.unit}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block">Need By</span>
                  <span className="font-semibold text-gray-700 flex items-center gap-1 mt-0.5">
                    <Calendar size={13} className="text-gray-400" />
                    {b.required_by ? b.required_by.split("T")[0] : "Urgent"}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Target Grade: <strong>{b.quality_grade || "Any Quality"}</strong>
                </span>

                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleOpenOffer(b)}
                  icon={Send}
                >
                  Send Proposal
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Offer Submission Modal */}
      {selectedBuyer && (
        <Modal
          isOpen={offerModalOpen}
          onClose={() => setOfferModalOpen(false)}
          title={`Submit Offer to ${selectedBuyer.buyer_name || "Buyer"}`}
          subtitle={`Requirement: ${selectedBuyer.quantity} ${selectedBuyer.unit} of ${selectedBuyer.crop_name}`}
        >
          <form onSubmit={handleSendOfferSubmit} className="space-y-4">
            {offerError && (
              <div className="p-3 rounded-lg bg-red-50 text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle size={16} />
                <span>{offerError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label={`Your Offer Rate (₹ / ${selectedBuyer.unit})`}
                type="number"
                required
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                helperText={`Buyer maximum: ₹${selectedBuyer.max_price || "Open"}`}
              />

              <Input
                label={`Supply Volume (${selectedBuyer.unit})`}
                type="number"
                required
                value={offerQuantity}
                onChange={(e) => setOfferQuantity(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                Note to Buyer
              </label>
              <textarea
                rows={3}
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Details regarding quality grade, packaging, or dispatch readiness..."
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => setOfferModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={submittingOffer}
                icon={Send}
              >
                Submit Offer
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Success Confirmation Modal */}
      <Modal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        title="Commercial Offer Dispatched!"
        subtitle="Your proposal has been officially registered and forwarded to the buyer."
      >
        <div className="space-y-4">
          <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={28} />
          </div>

          {createdOfferData && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-xs sm:text-sm text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-500">Offer Tracking ID:</span>
                <span className="font-bold text-gray-900">#KS-OFFER-{createdOfferData.offerId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Recipient Buyer:</span>
                <span className="font-semibold text-gray-900">{createdOfferData.buyerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Offered Volume:</span>
                <span className="font-semibold text-gray-900">
                  {createdOfferData.quantity} {createdOfferData.unit} of {createdOfferData.crop}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Offered Rate:</span>
                <span className="font-bold text-emerald-700">₹{createdOfferData.price} / {createdOfferData.unit}</span>
              </div>
            </div>
          )}

          <p className="text-xs text-gray-500">
            You can negotiate counter-offers and monitor acceptance status under My Offers.
          </p>

          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1"
              onClick={() => setSuccessModalOpen(false)}
            >
              Done
            </Button>
            <Link to="/offers" className="flex-1">
              <Button variant="outline" className="w-full">
                Go to My Offers
              </Button>
            </Link>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Buyers;