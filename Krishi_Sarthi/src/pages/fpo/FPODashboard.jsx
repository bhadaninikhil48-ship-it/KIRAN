import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  TrendingUp,
  Store,
  ShoppingBasket,
  ShieldCheck,
  Package,
  Layers,
  Info,
  RefreshCw,
  ArrowRight,
  Sparkles,
  MapPin,
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";

export function FPODashboard() {
  const { user } = useContext(AuthContext);
  const [openRequirements, setOpenRequirements] = useState([]);
  const [marketPrices, setMarketPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [reqRes, priceRes] = await Promise.allSettled([
        api.get("/api/buyer/requirements/open"),
        api.get("/api/market/prices"),
      ]);

      if (reqRes.status === "fulfilled") {
        setOpenRequirements(reqRes.value.requirements || []);
      }
      if (priceRes.status === "fulfilled") {
        setMarketPrices(priceRes.value.prices || priceRes.value.records || []);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              FPO Collective Command
            </h1>
            <Badge variant="emerald" dot>
              Cluster Aggregator
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Welcome, <strong className="text-gray-800">{user?.name || "FPO Leader"}</strong>. Aggregate smallholder harvest volumes, track bulk buyer demand, and optimize mandi logistics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            icon={RefreshCw}
            onClick={loadData}
          >
            Refresh
          </Button>
          <Link to="/markets">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" icon={Store}>
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

      {/* Cluster Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-gray-200/90">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Bulk Buyer Demands
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <ShoppingBasket size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-gray-900">
              {openRequirements.length}
            </span>
            <p className="text-xs text-gray-500 mt-1">
              Active open institutional lots
            </p>
          </div>
        </Card>

        <Card className="p-5 border-gray-200/90">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Tracked Mandis
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Store size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-gray-900">
              {marketPrices.length > 0 ? marketPrices.length : "Live APMC"}
            </span>
            <p className="text-xs text-gray-500 mt-1">
              Real-time spot price feeds
            </p>
          </div>
        </Card>

        <Card className="p-5 border-gray-200/90">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Bargaining Power
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-700">
              +12% to +18%
            </span>
            <p className="text-xs text-gray-500 mt-1">
              Cluster volume premium
            </p>
          </div>
        </Card>

        <Card className="p-5 border-gray-200/90">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Legal Protection
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-gray-900">
              100%
            </span>
            <p className="text-xs text-gray-500 mt-1">
              Digital contracts enforced
            </p>
          </div>
        </Card>
      </div>

      {/* Cluster Aggregation Notice */}
      <div className="bg-gradient-to-br from-emerald-50/70 via-white to-blue-50/50 border border-emerald-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl mt-0.5">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">
              KIRAN FPO Aggregation Protocol
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
              As an FPO partner, you connect individual smallholders into aggregated freight lots to negotiate directly with verified enterprise buyers. This eliminates middlemen exploitation, lowers per-quintal transportation freight, and guarantees transparent settlement.
            </p>
          </div>
        </div>
      </div>

      {/* Active Institutional Demands */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBasket size={18} className="text-emerald-600" />
            Active Institutional Demands Suitable for Aggregation
          </h2>
          <Link
            to="/markets"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
          >
            Explore Market Intelligence <ArrowRight size={13} />
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
            {openRequirements.map((req) => (
              <Card key={req.id} className="p-5 border-gray-200 hover:border-emerald-300 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{req.crop_name}</h3>
                    <p className="text-xs text-gray-500">
                      Buyer: <strong>{req.buyer_name || "Enterprise Buyer"}</strong>
                    </p>
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

                <div className="pt-1 flex items-center justify-between text-xs text-gray-400">
                  <span>Demand #{req.id}</span>
                  <Link to="/markets">
                    <Button size="xs" variant="outline">
                      Compare Prices
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
