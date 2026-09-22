import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBasket,
  FileText,
  ReceiptText,
  TrendingUp,
  PlusCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  MapPin,
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { CropImage } from "../../components/ui/CropImage";
import { DashboardLocationCard } from "../../components/location/DashboardLocationCard";

export function BuyerDashboard() {
  const { user } = useContext(AuthContext) || {};
  const [requirements, setRequirements] = useState([]);
  const [offers, setOffers] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [reqRes, offRes, conRes] = await Promise.allSettled([
        api.get("/api/buyer/requirements/my"),
        api.get("/api/offers/buyer"),
        api.get("/api/contracts/buyer"),
      ]);

      const reqData = reqRes.status === "fulfilled" ? reqRes.value : null;
      const offData = offRes.status === "fulfilled" ? offRes.value : null;
      const conData = conRes.status === "fulfilled" ? conRes.value : null;

      setRequirements(reqData?.requirements || (Array.isArray(reqData) ? reqData : []));
      setOffers(offData?.offers || (Array.isArray(offData) ? offData : []));
      setContracts(conData?.contracts || (Array.isArray(conData) ? conData : []));
    } catch (err) {
      console.error("Error loading buyer dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [reqRes, offRes, conRes] = await Promise.allSettled([
          api.get("/api/buyer/requirements/my"),
          api.get("/api/offers/buyer"),
          api.get("/api/contracts/buyer"),
        ]);
        if (!active) return;
        const reqData = reqRes.status === "fulfilled" ? reqRes.value : null;
        const offData = offRes.status === "fulfilled" ? offRes.value : null;
        const conData = conRes.status === "fulfilled" ? conRes.value : null;

        setRequirements(reqData?.requirements || (Array.isArray(reqData) ? reqData : []));
        setOffers(offData?.offers || (Array.isArray(offData) ? offData : []));
        setContracts(conData?.contracts || (Array.isArray(conData) ? conData : []));
      } catch (err) {
        if (!active) return;
        console.error("Error loading buyer dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const openReqs = Array.isArray(requirements) ? requirements.filter((r) => r?.status === "open") : [];
  const pendingOffers = Array.isArray(offers) ? offers.filter((o) => o?.status === "pending") : [];
  const activeContracts = Array.isArray(contracts) ? contracts.filter((c) => c?.status === "active") : [];
  const totalSourcedValue = Array.isArray(contracts)
    ? contracts.reduce((acc, c) => acc + (Number(c?.total_amount) || 0), 0)
    : 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header & Location Setup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
        <div className="lg:col-span-8 bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Buyer Command Center
              </h1>
              <Badge variant="blue" dot>
                Procurement Hub
              </Badge>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 max-w-xl">
              Welcome back, <strong className="text-gray-800">{user?.name || "Buyer"}</strong>. Manage your procurement pipeline, incoming farmer offers, and legal fulfillment contracts.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              size="sm"
              variant="outline"
              icon={RefreshCw}
              onClick={loadData}
            >
              Refresh
            </Button>
            <Link to="/buyer/requirements">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold" icon={PlusCircle}>
                Post Requirement
              </Button>
            </Link>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col justify-center">
          <DashboardLocationCard className="h-full flex flex-col justify-center" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
          {error}
        </div>
      ) : (
        <>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 border-gray-200/90">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Open Demands
                </span>
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <ShoppingBasket size={18} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {openReqs.length}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  Active procurement lots
                </p>
              </div>
            </Card>

            <Card className="p-5 border-gray-200/90">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Pending Offers
                </span>
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Clock size={18} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {pendingOffers.length}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  Awaiting your acceptance
                </p>
              </div>
            </Card>

            <Card className="p-5 border-gray-200/90">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Active Contracts
                </span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <ReceiptText size={18} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {activeContracts.length}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  In fulfillment / transit
                </p>
              </div>
            </Card>

            <Card className="p-5 border-gray-200/90">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Total Contract Value
                </span>
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <TrendingUp size={18} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                  ₹{totalSourcedValue.toLocaleString()}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  Committed legal value
                </p>
              </div>
            </Card>
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/buyer/requirements" className="block group">
              <Card className="p-5 border-gray-200 hover:border-emerald-500 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl group-hover:scale-105 transition-transform">
                    <ShoppingBasket size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                      Manage Requirements
                    </h3>
                    <p className="text-xs text-gray-500">
                      Post new crop specs or view current listings
                    </p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link to="/buyer/offers" className="block group">
              <Card className="p-5 border-gray-200 hover:border-blue-500 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-50 text-blue-700 rounded-xl group-hover:scale-105 transition-transform">
                    <FileText size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                      Review Farmer Offers
                    </h3>
                    <p className="text-xs text-gray-500">
                      Accept, reject, or negotiate counter-proposals
                    </p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link to="/buyer/contracts" className="block group">
              <Card className="p-5 border-gray-200 hover:border-purple-500 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-50 text-purple-700 rounded-xl group-hover:scale-105 transition-transform">
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                      Enforce Contracts
                    </h3>
                    <p className="text-xs text-gray-500">
                      View binding digital contracts and dispatches
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>

          {/* Section: Recent Offers Received */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Clock size={18} className="text-amber-600" />
                Latest Offers from Farmers
              </h2>
              <Link
                to="/buyer/offers"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
              >
                View All Offers <ArrowRight size={13} />
              </Link>
            </div>

            {offers.length === 0 ? (
              <Card className="p-8 text-center border-dashed border-gray-200">
                <p className="text-sm text-gray-500">
                  No offers submitted by farmers yet. Make sure your requirements are posted to receive competitive farmer bids.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {offers.slice(0, 4).map((offer) => (
                  <Card key={offer.id} className="p-5 border-gray-200 hover:border-emerald-300 transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <CropImage
                          crop={offer.crop_name}
                          size="card"
                          className="rounded-xl shadow-xs shrink-0 border border-gray-200 mt-0.5"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-gray-900 text-base">
                              {offer.crop_name || "Produce"}
                            </h3>
                            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                              {offer.quality_grade || "Grade A"}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Farmer: <strong>{offer.farmer_name || "Farmer"}</strong> • Requirement #{offer.requirement_id || "-"}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={offer.status === "pending" ? "Pending" : offer.status === "accepted" ? "Accepted" : "Rejected"} />
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-gray-400 block">Offered Rate</span>
                        <span className="font-bold text-gray-900 text-sm">
                          ₹{(Number(offer.offer_price) || 0).toLocaleString()} / {offer.unit || "kg"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Volume</span>
                        <span className="font-bold text-gray-900 text-sm">
                          {(Number(offer.quantity) || 0).toLocaleString()} {offer.unit || "kg"}
                        </span>
                      </div>
                      <Link to="/buyer/offers">
                        <Button size="xs" variant="outline">
                          Action
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Section: Your Posted Requirements */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ShoppingBasket size={18} className="text-emerald-600" />
                Active Requirements
              </h2>
              <Link
                to="/buyer/requirements"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
              >
                Manage All <ArrowRight size={13} />
              </Link>
            </div>

            {requirements.length === 0 ? (
              <Card className="p-8 text-center border-dashed border-gray-200">
                <p className="text-sm text-gray-500 mb-3">
                  You have not published any crop demand listings yet.
                </p>
                <Link to="/buyer/requirements">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    Publish First Requirement
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {requirements.slice(0, 3).map((req) => (
                  <Card key={req.id} className="p-5 border-gray-200">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <CropImage
                          crop={req.crop_name}
                          size="sm"
                          className="rounded-lg shadow-2xs shrink-0 border border-gray-200"
                        />
                        <h3 className="font-bold text-gray-900">{req.crop_name || "Produce"}</h3>
                      </div>
                      <Badge variant={req.status === "open" ? "emerald" : "gray"}>
                        {(req.status || "open").toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-xs space-y-1 text-gray-600">
                      <div>Quantity: <strong>{(Number(req.quantity) || 0).toLocaleString()} {req.unit || "kg"}</strong></div>
                      <div>Max Budget: <strong>₹{(Number(req.max_price) || 0).toLocaleString()} / {req.unit || "kg"}</strong></div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <MapPin size={12} /> {req.location || "Direct Delivery"}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default BuyerDashboard;
