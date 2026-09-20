import { useState, useEffect, useRef } from "react";
import {
  MapPin,
  ArrowRight,
  TrendingUp,
  Calendar,
  Package,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { LoadingState } from "../components/ui/LoadingState";
import { animateStagger } from "../utils/animations";
import { api } from "../services/api";

export function Opportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState("All");

  const containerRef = useRef(null);

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setLoading(true);
        // Fetch both market prices and buyer requirements
        const [marketRes, buyerRes] = await Promise.all([
          api.get("/api/market/prices"),
          api.get("/api/buyer/requirements/open"),
        ]);

        const opps = [];

        // 1. Process Open Buyer Requirements
        const requirements = buyerRes?.requirements || [];
        requirements.forEach((req) => {
          opps.push({
            id: `buyer-${req.id}`,
            source: "Institutional Buyer",
            name: req.buyer_name || "Verified Institutional Buyer",
            category: "Direct Procurement Contract",
            crop: req.crop_name,
            grade: req.quality_grade || "Grade A",
            price: Number(req.max_price || 0),
            quantity: req.quantity,
            unit: req.unit,
            location: req.location || "Regional Delivery Center",
            date: req.required_by ? req.required_by.split("T")[0] : null,
            actionUrl: "/buyers",
            actionLabel: "Submit Offer to Buyer",
          });
        });

        // 2. Process Mandi Market Prices
        const prices = marketRes?.prices || [];
        prices.forEach((p) => {
          opps.push({
            id: `market-${p.id}`,
            source: "APMC Mandi Auction",
            name: `${p.market_name}`,
            category: "Regulated APMC Yard",
            crop: p.crop_name,
            grade: "Mandi Benchmark",
            price: Number(p.modal_price || 0),
            minPrice: Number(p.min_price || 0),
            maxPrice: Number(p.max_price || 0),
            quantity: p.arrival_quantity,
            unit: p.arrival_unit || "quintal",
            location: `${p.district || ""}, ${p.state || ""}`,
            date: p.price_date ? p.price_date.split("T")[0] : null,
            actionUrl: "/markets",
            actionLabel: "View Mandi Intelligence",
          });
        });

        // Sort descending by price / modal price
        opps.sort((a, b) => b.price - a.price);

        // Mark top opportunity
        if (opps.length > 0) {
          opps[0].recommended = true;
        }

        setOpportunities(opps);
      } catch (err) {
        console.error("Failed to fetch opportunities:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  useEffect(() => {
    if (containerRef.current && !loading) {
      animateStagger(containerRef.current.querySelectorAll(".opp-card-anim"), {
        delay: 0.05,
      });
    }
  }, [loading, selectedCrop]);

  const uniqueCrops = [
    "All",
    ...new Set(opportunities.map((o) => o.crop).filter(Boolean)),
  ];

  const filteredOpportunities = opportunities.filter((o) => {
    if (selectedCrop === "All") return true;
    return o.crop.toLowerCase() === selectedCrop.toLowerCase();
  });

  return (
    <div ref={containerRef} className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Best Selling Opportunities Matrix
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Real-time commercial opportunities ranked by highest modal prices and buyer requirements from the KIRAN database.
          </p>
        </div>

        <Link to="/sell">
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            List Fresh Produce Lot
          </Button>
        </Link>
      </div>

      {/* Crop Filter Tabs */}
      {uniqueCrops.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {uniqueCrops.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedCrop(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCrop === c
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {c === "All" ? "All Commodities" : c}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <LoadingState message="Analyzing best selling opportunities across mandis and buyers..." />
        </div>
      ) : filteredOpportunities.length === 0 ? (
        <EmptyState
          title="No Market Opportunities Available"
          description="There are currently no recorded market prices or open buyer requirements matching your filter."
          icon={TrendingUp}
        />
      ) : (
        /* Opportunity Comparison Cards */
        <div className="space-y-4">
          {filteredOpportunities.map((opp, idx) => (
            <div
              key={opp.id || idx}
              className={`opp-card-anim rounded-2xl border transition-all p-5 sm:p-6 ${
                opp.recommended
                  ? "bg-gradient-to-br from-emerald-50/70 via-white to-white border-2 border-emerald-500 shadow-xs hover:shadow-md"
                  : "bg-white border-gray-200/90 hover:border-gray-300 shadow-2xs"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        opp.recommended
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {opp.recommended ? "#1 Highest Price Rate" : `Rank #${idx + 1}`}
                    </span>
                    <Badge variant={opp.source === "Institutional Buyer" ? "blue" : "emerald"}>
                      {opp.source}
                    </Badge>
                  </div>

                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                      {opp.name}
                    </h3>
                    <span className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                      <MapPin size={13} className="text-gray-400" />
                      {opp.location}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500">
                    Target Commodity: <strong className="text-gray-800">{opp.crop}</strong>
                    {opp.grade && ` • Quality: ${opp.grade}`}
                  </p>
                </div>

                {/* Quoted Rate Block */}
                <div className="flex items-center gap-5 bg-white p-3.5 rounded-xl border border-gray-100 shadow-2xs">
                  <div className="text-right">
                    <span className="text-xs text-gray-400 block">
                      {opp.source === "Institutional Buyer" ? "Offered Rate" : "Modal Rate"}
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-emerald-700">
                      ₹{opp.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500"> / {opp.unit || "quintal"}</span>
                  </div>

                  <div className="h-8 w-px bg-gray-200" />

                  <Link to={opp.actionUrl}>
                    <Button size="sm" variant="primary" icon={ArrowRight}>
                      {opp.actionLabel}
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Metrics Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 text-xs">
                <div>
                  <span className="text-gray-400 block">Session Date</span>
                  <span className="font-semibold text-gray-800 flex items-center gap-1 mt-0.5">
                    <Calendar size={13} className="text-gray-400" />
                    {opp.date || "Active Live"}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block">Available Volume</span>
                  <span className="font-semibold text-gray-800 flex items-center gap-1 mt-0.5">
                    <Package size={13} className="text-gray-400" />
                    {opp.quantity ? `${opp.quantity} ${opp.unit || "q"}` : "Auction Lot"}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block">Min / Floor Price</span>
                  <span className="font-semibold text-gray-700 mt-0.5 block">
                    {opp.minPrice ? `₹${opp.minPrice.toLocaleString()}/q` : "—"}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block">Max / Ceiling Price</span>
                  <span className="font-semibold text-emerald-700 mt-0.5 block">
                    {opp.maxPrice ? `₹${opp.maxPrice.toLocaleString()}/q` : `₹${opp.price.toLocaleString()}/q`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Opportunities;