import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ReceiptText,
  ShieldCheck,
  Truck,
  FileCheck,
  Calendar,
  MapPin,
  PhoneCall,
  User,
  Info,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  CheckCircle2,
  Clock,
  Package,
  AlertCircle,
  TrendingUp,
  X,
  ChevronRight,
  Circle,
  Layers,
} from "lucide-react";
import api from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { CropImage } from "../../components/ui/CropImage";

export function BuyerContracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Client-side search & filtering state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cropFilter, setCropFilter] = useState("all");

  const loadContracts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/api/contracts/buyer");
      setContracts(res.contracts || []);
    } catch (err) {
      console.error("Error fetching buyer contracts:", err);
      setError("Failed to load your contracts. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContracts();
  }, []);

  // Compute metrics from real contract data
  const totalContractValue = contracts.reduce(
    (acc, c) => acc + (Number(c.total_amount) || 0),
    0
  );
  const activeContractsCount = contracts.filter(
    (c) => c.status === "active" || c.status === "confirmed"
  ).length;
  const totalVolumeCount = contracts.reduce(
    (acc, c) => acc + (Number(c.quantity) || 0),
    0
  );

  // Extract unique crop names for dynamic filter
  const availableCrops = Array.from(
    new Set(contracts.map((c) => c.crop_name).filter(Boolean))
  ).sort();

  // Safely filter contracts locally
  const filteredContracts = contracts.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (c.crop_name || "").toLowerCase().includes(q) ||
      (c.delivery_location || "").toLowerCase().includes(q) ||
      String(c.id).includes(q) ||
      String(c.offer_id).includes(q);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" &&
        (c.status === "active" || c.status === "confirmed")) ||
      c.status === statusFilter;

    const matchesCrop =
      cropFilter === "all" ||
      (c.crop_name || "").toLowerCase() === cropFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesCrop;
  });

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* 1. Page Header Container */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-1.5 min-w-0">
            {/* Title & Badges */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Legal Fulfillment Contracts
              </h1>
              <Badge variant="emerald" dot size="sm">
                Binding Digital Deeds
              </Badge>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50/90 border border-emerald-200/70 px-2.5 py-0.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Escrow & Fulfillment Active
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 max-w-2xl leading-relaxed">
              Enforceable digital trade agreements generated upon offer acceptance with complete fulfillment tracking.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <Button
              size="sm"
              variant="outline"
              icon={RefreshCw}
              loading={loading}
              onClick={loadContracts}
              className="text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 font-medium shadow-xs"
            >
              Refresh
            </Button>
            <Link to="/buyer/offers">
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow font-medium active:scale-[0.98] transition-all"
                icon={ArrowRight}
              >
                Browse Farmer Offers
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Error Alert Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center justify-between gap-3 text-sm shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={18} className="text-red-600 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 p-1"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* 2. Overview Metrics Bar (when contracts exist) */}
      {!loading && contracts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Metric 1: Total Committed Value */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">
                Total Committed Value
              </span>
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100/80 shrink-0">
                <TrendingUp size={18} />
              </div>
            </div>
            <div className="mt-3 min-w-0">
              <span
                className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight block truncate"
                title={`₹${totalContractValue.toLocaleString("en-IN")}`}
              >
                ₹{totalContractValue.toLocaleString("en-IN")}
              </span>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                Legal payment liability
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-5">
          {contracts.map((contract) => (
            <Card key={contract.id} className="p-6 border-gray-200 hover:border-emerald-300 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="flex items-start gap-3.5">
                  <CropImage
                    crop={contract.crop_name}
                    size="card"
                    className="rounded-xl shadow-xs shrink-0 border border-gray-200 mt-0.5"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                        Contract #{contract.id}: {contract.crop_name} Consignment
                      </h2>
                      <StatusBadge status={contract.status === "active" ? "Confirmed" : contract.status || "Active"} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-2">
                      <span>Generated: {new Date(contract.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Offer #{contract.offer_id}</span>
                      <span>•</span>
                      <span>Requirement #{contract.requirement_id}</span>
                    </p>
                  </div>
                </div>

          {/* Metric 2: Active Contracts */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">
                Active Contracts
              </span>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/80 shrink-0">
                <ReceiptText size={18} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight block">
                {activeContractsCount}
              </span>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                In fulfillment pipeline
              </p>
            </div>
          </div>

          {/* Metric 3: Contracted Volume */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">
                Contracted Volume
              </span>
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/80 shrink-0">
                <Package size={18} />
              </div>
            </div>
            <div className="mt-3 min-w-0">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight block truncate">
                {totalVolumeCount.toLocaleString("en-IN")}
              </span>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                Total commodity units
              </p>
            </div>
          </div>

          {/* Metric 4: Legal Security */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">
                Enforceability
              </span>
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100/80 shrink-0">
                <ShieldCheck size={18} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight block">
                100% Binding
              </span>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                Protected by digital deeds
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Search & Filter Bar (when contracts exist) */}
      {!loading && contracts.length > 0 && (
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/90 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by crop, location, contract ID..."
                aria-label="Search contracts"
                className="w-full pl-9 pr-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg bg-gray-50/70 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 hover:border-gray-300 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Dropdown Filters */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Crop Filter */}
              <select
                value={cropFilter}
                onChange={(e) => setCropFilter(e.target.value)}
                aria-label="Filter by crop"
                className="text-xs font-medium border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50/80 text-gray-800 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors cursor-pointer"
              >
                <option value="all">All Crops ({contracts.length})</option>
                {availableCrops.map((crop) => (
                  <option key={crop} value={crop}>
                    {crop} ({contracts.filter((c) => c.crop_name === crop).length})
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by status"
                className="text-xs font-medium border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50/80 text-gray-800 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active / Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Reset button */}
              {(searchQuery || statusFilter !== "all" || cropFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setCropFilter("all");
                  }}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold underline cursor-pointer px-1"
                >
                  Reset filters
                </button>
              )}
            </div>
          </div>

          <div className="text-xs font-medium text-gray-500 pt-1 border-t border-gray-100 flex items-center justify-between">
            <span>
              Showing <strong className="text-gray-900 font-semibold">{filteredContracts.length}</strong> of{" "}
              <strong className="text-gray-900 font-semibold">{contracts.length}</strong> legal deeds
            </span>
          </div>
        </div>
      )}

      {/* Contracts List Display Area */}
      {loading ? (
        /* SaaS Skeleton Loading State */
        <div className="space-y-5 animate-pulse">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-200/70 p-6 sm:p-7 space-y-5"
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="w-14 h-14 bg-gray-200 rounded-2xl"></div>
                  <div>
                    <div className="h-5 bg-gray-200 rounded w-48 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-28"></div>
              </div>
              <div className="h-14 bg-gray-100 rounded-xl"></div>
              <div className="grid grid-cols-4 gap-4">
                <div className="h-16 bg-gray-100 rounded-xl"></div>
                <div className="h-16 bg-gray-100 rounded-xl"></div>
                <div className="h-16 bg-gray-100 rounded-xl"></div>
                <div className="h-16 bg-gray-100 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      ) : contracts.length === 0 ? (
        /* Empty State */
        <EmptyState
          icon={ReceiptText}
          title="No Contracts Generated Yet"
          description="When you accept a farmer's offer, a legally binding contract will be minted instantly with delivery terms, agreed unit rate, and total payable amount."
          actionLabel="Review Incoming Offers"
          onAction={() => window.location.assign("/buyer/offers")}
        />
      ) : filteredContracts.length === 0 ? (
        /* Filter Empty State */
        <EmptyState
          icon={Filter}
          title="No Matching Contracts Found"
          description="None of your active fulfillment contracts match your current search or filter criteria."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery("");
            setStatusFilter("all");
            setCropFilter("all");
          }}
        />
      ) : (
        /* Dedicated Contract Cards with Independent Local State */
        <div className="space-y-6">
          {filteredContracts.map((contract) => (
            <ContractCard key={contract.id} contract={contract} />
          ))}
        </div>
      )}
    </div>
  );
}

export default BuyerContracts;
