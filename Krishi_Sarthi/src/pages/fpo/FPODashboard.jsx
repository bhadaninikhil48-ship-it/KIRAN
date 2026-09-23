import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Store,
  ShoppingBasket,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  Sparkles,
  MapPin,
  Users,
  Package,
  FileText,
  ReceiptText,
  Send,
  Plus,
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { CropImage } from "../../components/ui/CropImage";

export function FPODashboard() {
  const { user } = useContext(AuthContext);
  const [fpoProfile, setFpoProfile] = useState(null);
  const [openRequirements, setOpenRequirements] = useState([]);
  const [lotStats, setLotStats] = useState({ total_lots: 0, aggregated_lots: 0, offered_lots: 0, contracted_lots: 0 });
  const [offersCount, setOffersCount] = useState(0);
  const [contractsCount, setContractsCount] = useState(0);
  const [marketPrices, setMarketPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [profRes, lotsRes, offersRes, contractsRes, reqRes, priceRes] = await Promise.allSettled([
        api.get("/api/fpo/profile"),
        api.get("/api/fpo/lots"),
        api.get("/api/fpo/marketplace/offers"),
        api.get("/api/fpo/contracts"),
        api.get("/api/fpo/marketplace/requirements"),
        api.get("/api/market/prices"),
      ]);

      if (profRes.status === "fulfilled" && profRes.value?.profile) {
        setFpoProfile(profRes.value.profile);
      }
      if (lotsRes.status === "fulfilled" && lotsRes.value?.stats) {
        setLotStats(lotsRes.value.stats);
      }
      if (offersRes.status === "fulfilled" && offersRes.value?.offers) {
        setOffersCount(offersRes.value.offers.length);
      }
      if (contractsRes.status === "fulfilled" && contractsRes.value?.contracts) {
        setContractsCount(contractsRes.value.contracts.length);
      }
      if (reqRes.status === "fulfilled") {
        setOpenRequirements(reqRes.value?.requirements || []);
      }
      if (priceRes.status === "fulfilled") {
        setMarketPrices(priceRes.value?.prices || priceRes.value?.records || []);
      }
    } catch (err) {
      console.error("Error loading FPO dashboard data:", err);
      setError("Failed to load FPO data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {fpoProfile?.fpo_name || "FPO Collective Command"}
            </h1>
            <Badge variant="emerald" dot>
              Cluster Aggregator
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 max-w-xl">
            Welcome, <strong className="text-gray-800">{user?.name || "FPO Leader"}</strong>. Aggregate smallholder harvest volumes, track bulk buyer demand, and manage direct trade contracts.
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
          <Link to="/markets">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold" icon={Store}>
              Mandi Prices
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Cluster Overview Grid (Live Backend Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Members */}
        <Link to="/fpo/members" className="block group">
          <Card className="p-5 border-gray-200/90 group-hover:border-emerald-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Farmer Members
              </span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                <Users size={18} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                {fpoProfile ? fpoProfile.total_members_count : "0"}
              </span>
              <p className="text-xs text-gray-500 mt-1 flex items-center justify-between">
                <span>{fpoProfile?.active_members_count || 0} active in pool</span>
                <span className="text-emerald-600 font-semibold group-hover:underline">Manage &rarr;</span>
              </p>
            </div>
          </Card>
        </Link>

        {/* Card 2: Aggregated Lots */}
        <Link to="/fpo/lots" className="block group">
          <Card className="p-5 border-gray-200/90 group-hover:border-emerald-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Aggregated Lots
              </span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                <Package size={18} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                {lotStats.aggregated_lots}
              </span>
              <p className="text-xs text-gray-500 mt-1 flex items-center justify-between">
                <span>{lotStats.total_lots} total lots created</span>
                <span className="text-emerald-600 font-semibold group-hover:underline">View Lots &rarr;</span>
              </p>
            </div>
          </Card>
        </Link>

        {/* Card 3: Submitted Offers */}
        <Link to="/fpo/offers" className="block group">
          <Card className="p-5 border-gray-200/90 group-hover:border-emerald-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Submitted Bids
              </span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
                <FileText size={18} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-bold text-amber-700">
                {offersCount}
              </span>
              <p className="text-xs text-gray-500 mt-1 flex items-center justify-between">
                <span>Active marketplace offers</span>
                <span className="text-amber-700 font-semibold group-hover:underline">Bids &rarr;</span>
              </p>
            </div>
          </Card>
        </Link>

        {/* Card 4: Binding Contracts */}
        <Link to="/fpo/contracts" className="block group">
          <Card className="p-5 border-gray-200/90 group-hover:border-emerald-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Trade Contracts
              </span>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors">
                <ReceiptText size={18} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-bold text-purple-700">
                {contractsCount}
              </span>
              <p className="text-xs text-gray-500 mt-1 flex items-center justify-between">
                <span>Enforceable digital deeds</span>
                <span className="text-purple-700 font-semibold group-hover:underline">Deeds &rarr;</span>
              </p>
            </div>
          </Card>
        </Link>
      </div>

      {/* Cluster Aggregation Notice */}
      <div className="bg-gradient-to-br from-emerald-50/70 via-white to-blue-50/50 border border-emerald-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl mt-0.5">
            <Sparkles size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-900">
              KIRAN FPO Aggregation Protocol
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
              As an FPO partner, you connect individual smallholders into aggregated freight lots to negotiate directly with verified enterprise buyers. This eliminates middlemen exploitation, lowers per-quintal transportation freight, and guarantees transparent settlement.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <Link to="/fpo/members">
                <Button size="xs" variant="outline" icon={Users}>
                  1. Enroll Farmers
                </Button>
              </Link>
              <Link to="/fpo/lots">
                <Button size="xs" variant="outline" icon={Package}>
                  2. Aggregate Lots
                </Button>
              </Link>
              <Link to="/fpo/marketplace">
                <Button size="xs" className="bg-emerald-600 hover:bg-emerald-700 text-white" icon={ShoppingBasket}>
                  3. Bid on Demand
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Active Institutional Demands */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBasket size={18} className="text-emerald-600" />
            Active Institutional Demands Suitable for Aggregation ({openRequirements.length})
          </h2>
          <Link
            to="/fpo/marketplace"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
          >
            Open Marketplace Exchange <ArrowRight size={13} />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : openRequirements.length === 0 ? (
          <Card className="p-8 text-center border-dashed border-gray-200">
            <p className="text-sm text-gray-500">
              No open buyer demands currently listed in the exchange.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {openRequirements.slice(0, 6).map((req) => (
              <Card key={req.id} className="p-5 border-gray-200 hover:border-emerald-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-start gap-3">
                      <CropImage
                        crop={req.crop_name}
                        size="card"
                        className="rounded-xl shadow-xs shrink-0 border border-gray-200 mt-0.5"
                      />
                      <div>
                        <h3 className="font-bold text-gray-900 text-base">{req.crop_name}</h3>
                        <p className="text-xs text-gray-500">
                          Buyer: <strong>{req.buyer_name || "Enterprise Buyer"}</strong>
                        </p>
                      </div>
                    </div>
                    <Badge variant="blue">
                      {req.quality_grade || "Grade A"}
                    </Badge>
                  </div>

                  <div className="space-y-1.5 my-3 py-2 border-t border-b border-gray-100 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Target Volume:</span>
                      <span className="font-bold text-gray-800">
                        {Number(req.quantity).toLocaleString()} {req.unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Budget Ceiling:</span>
                      <span className="font-bold text-emerald-700">
                        ₹{Number(req.max_price || req.target_price || 0).toLocaleString()} / {req.unit}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Destination Hub:</span>
                      <span className="font-medium text-gray-700 flex items-center gap-1">
                        <MapPin size={11} className="text-gray-400" />
                        {req.location || req.delivery_location || "Regional Hub"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-gray-400 border-t border-gray-100">
                  <span>Demand #{req.id}</span>
                  <Link to="/fpo/marketplace">
                    <Button size="xs" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold" icon={Send}>
                      Bid Consignment
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FPODashboard;
