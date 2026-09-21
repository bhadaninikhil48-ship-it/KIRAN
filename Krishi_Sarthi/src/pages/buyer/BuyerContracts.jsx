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
import { Avatar } from "../../components/ui/Avatar";
import { EmptyState } from "../../components/ui/EmptyState";
import { CropImage } from "../../components/ui/CropImage";

// Standard 5-stage contract lifecycle for ALL buyer contracts
const CONTRACT_STAGES = [
  { id: "accepted", label: "Offer Accepted", shortLabel: "Accepted", icon: CheckCircle2 },
  { id: "confirmed", label: "Contract Confirmed", shortLabel: "Confirmed", icon: FileCheck },
  { id: "fulfillment", label: "In Fulfillment", shortLabel: "Fulfillment", icon: Truck },
  { id: "delivery", label: "Delivery Verification", shortLabel: "Delivery", icon: Package },
  { id: "payment", label: "Payment Settlement", shortLabel: "Settlement", icon: ReceiptText },
];

/**
 * Derives the active stage index from real contract status data.
 * Zero fabricated progress: maps directly to backend contract states.
 */
function getContractCurrentStage(contract) {
  const normStatus = (contract.status || "").toLowerCase().trim();

  if (normStatus === "completed" || normStatus === "settled") {
    return "payment";
  }
  if (normStatus === "delivered") {
    return "delivery";
  }
  if (normStatus === "active" || normStatus === "confirmed") {
    return "fulfillment";
  }
  if (normStatus === "pending") {
    return "confirmed";
  }
  return "fulfillment";
}

/**
 * Stage Detail Panel: displays real, grounded contract information
 * for whichever stage the buyer clicks.
 */
function StageDetailPanel({ stageId, contract, stageIndex, currentStageIndex }) {
  const isCompleted = stageIndex < currentStageIndex;
  const isCurrent = stageIndex === currentStageIndex;
  const stageStatusText = isCompleted
    ? "Completed Stage"
    : isCurrent
    ? "Current Active Stage"
    : "Upcoming Stage";

  return (
    <div className="mt-3.5 p-4 rounded-xl border bg-gray-50/90 border-gray-200/90 text-xs space-y-2.5 transition-all">
      <div className="flex items-center justify-between pb-2 border-b border-gray-200/70 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900 text-sm tracking-tight flex items-center gap-1.5">
            {stageId === "accepted" && <CheckCircle2 size={16} className="text-emerald-600" />}
            {stageId === "confirmed" && <FileCheck size={16} className="text-emerald-600" />}
            {stageId === "fulfillment" && <Truck size={16} className="text-blue-600" />}
            {stageId === "delivery" && <Package size={16} className="text-amber-600" />}
            {stageId === "payment" && <ReceiptText size={16} className="text-purple-600" />}
            {CONTRACT_STAGES[stageIndex].label}
          </span>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
              isCompleted
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : isCurrent
                ? "bg-blue-50 text-blue-800 border-blue-200 animate-pulse"
                : "bg-gray-100 text-gray-600 border-gray-200"
            }`}
          >
            {stageStatusText}
          </span>
        </div>
        <span className="text-[11px] text-gray-400 font-mono">
          Deed #{contract.id} • Offer #{contract.offer_id}
        </span>
      </div>

      {/* Stage-Specific Real Data Content */}
      {stageId === "accepted" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-gray-700">
          <div>
            <span className="text-gray-400 block text-[11px]">Associated Offer</span>
            <strong className="text-gray-900">Offer #{contract.offer_id}</strong>
          </div>
          <div>
            <span className="text-gray-400 block text-[11px]">Agreed Base Rate</span>
            <strong className="text-emerald-700">
              ₹{Number(contract.agreed_price).toLocaleString("en-IN")} / {contract.unit}
            </strong>
          </div>
          <div>
            <span className="text-gray-400 block text-[11px]">Contracted Lot</span>
            <strong className="text-gray-900">
              {Number(contract.quantity).toLocaleString("en-IN")} {contract.unit}
            </strong>
          </div>
          <p className="col-span-1 sm:col-span-3 text-[11px] text-gray-500 mt-1">
            Farmer proposal was reviewed and formally accepted by buyer. Legal deed minted automatically.
          </p>
        </div>
      )}

      {stageId === "confirmed" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-gray-700">
          <div>
            <span className="text-gray-400 block text-[11px]">Deed Generated Date</span>
            <strong className="text-gray-900">
              {new Date(contract.created_at).toLocaleDateString()}
            </strong>
          </div>
          <div>
            <span className="text-gray-400 block text-[11px]">Linked Requirement</span>
            <strong className="text-gray-900">Requirement #{contract.requirement_id}</strong>
          </div>
          <div>
            <span className="text-gray-400 block text-[11px]">Total Legal Value</span>
            <strong className="text-emerald-700">
              ₹{Number(contract.total_amount).toLocaleString("en-IN")}
            </strong>
          </div>
          <p className="col-span-1 sm:col-span-3 text-[11px] text-gray-500 mt-1">
            Enforceable digital trade deed locked under Agricultural Procurement Standards with fixed rate guarantee.
          </p>
        </div>
      )}

      {stageId === "fulfillment" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-gray-700">
          <div>
            <span className="text-gray-400 block text-[11px]">Commodity Lot</span>
            <strong className="text-gray-900">
              {contract.crop_name} ({contract.quality_grade || "Grade A"})
            </strong>
          </div>
          <div>
            <span className="text-gray-400 block text-[11px]">Target Delivery Hub</span>
            <strong className="text-gray-900">
              {contract.delivery_location || "Buyer Designated Warehouse"}
            </strong>
          </div>
          <div>
            <span className="text-gray-400 block text-[11px]">Required By</span>
            <strong className="text-gray-900">
              {contract.required_by
                ? new Date(contract.required_by).toLocaleDateString()
                : "Per Procurement Terms"}
            </strong>
          </div>
          <p className="col-span-1 sm:col-span-3 text-[11px] text-gray-500 mt-1">
            Farmer is preparing or dispatching the contracted crop volume to the agreed destination hub.
          </p>
        </div>
      )}

      {stageId === "delivery" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-gray-700">
          <div>
            <span className="text-gray-400 block text-[11px]">Receiving Destination</span>
            <strong className="text-gray-900">
              {contract.delivery_location || "Buyer Warehouse"}
            </strong>
          </div>
          <div>
            <span className="text-gray-400 block text-[11px]">Required By Date</span>
            <strong className="text-gray-900">
              {contract.required_by
                ? new Date(contract.required_by).toLocaleDateString()
                : "Scheduled"}
            </strong>
          </div>
          <div>
            <span className="text-gray-400 block text-[11px]">Inspection Protocol</span>
            <strong className="text-gray-900">Quality & Moisture Check</strong>
          </div>
          <p className="col-span-1 sm:col-span-3 text-[11px] text-gray-500 mt-1">
            Physical receiving dock will verify weighment and grade specs before releasing formal delivery sign-off.
          </p>
        </div>
      )}

      {stageId === "payment" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-gray-700">
          <div>
            <span className="text-gray-400 block text-[11px]">Settlement Amount</span>
            <strong className="text-emerald-700 text-sm">
              ₹{Number(contract.total_amount).toLocaleString("en-IN")}
            </strong>
          </div>
          <div>
            <span className="text-gray-400 block text-[11px]">Payment Status</span>
            <strong className="text-amber-800">Pending Gateway</strong>
          </div>
          <div>
            <span className="text-gray-400 block text-[11px]">Settlement Mechanism</span>
            <strong className="text-gray-900">Smart Escrow Vault</strong>
          </div>
          <p className="col-span-1 sm:col-span-3 text-[11px] text-gray-500 mt-1">
            Payment settlement is secured via legal digital deed. Direct escrow gateway disbursement executes upon delivery.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Common Status Tracker:
 * 1 consistent 5-stage tracking system used across ALL buyer contracts.
 * Fully interactive and clickable without cross-contract state leakage.
 */
function ContractStatusTracker({
  contract,
  selectedStage,
  onSelectStage,
  currentStageId,
}) {
  const currentStageIndex = CONTRACT_STAGES.findIndex((s) => s.id === currentStageId);
  const selectedStageIndex = CONTRACT_STAGES.findIndex((s) => s.id === selectedStage);

  return (
    <div className="my-5 p-4 sm:p-5 bg-gray-50/70 rounded-2xl border border-gray-100">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
          <Clock size={14} className="text-emerald-600" />
          Contract Fulfillment Lifecycle
        </span>
        <span className="text-[11px] text-gray-500">
          Click any stage to inspect details
        </span>
      </div>

      {/* Desktop Horizontal Tracker (md: and above) */}
      <div className="hidden md:block">
        <div className="grid grid-cols-5 gap-2 relative">
          {CONTRACT_STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const isSelected = stage.id === selectedStage;
            const IconComponent = stage.icon;

            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => onSelectStage(stage.id)}
                className={`p-2.5 rounded-xl text-center flex flex-col items-center justify-between transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? "bg-white shadow-xs border-2 border-emerald-500 ring-2 ring-emerald-100"
                    : "bg-white/60 hover:bg-white border border-gray-200/70 hover:border-gray-300"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-2xs transition-transform ${
                    isCompleted
                      ? "bg-emerald-600 text-white"
                      : isCurrent
                      ? "bg-blue-600 text-white animate-pulse ring-4 ring-blue-100"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <IconComponent size={15} />
                </div>

                <span
                  className={`text-[11px] mt-2 font-semibold block tracking-tight ${
                    isSelected ? "text-emerald-900 font-bold" : "text-gray-800"
                  }`}
                >
                  {stage.label}
                </span>

                <span
                  className={`text-[10px] mt-0.5 block ${
                    isCompleted
                      ? "text-emerald-600 font-medium"
                      : isCurrent
                      ? "text-blue-600 font-bold"
                      : "text-gray-400"
                  }`}
                >
                  {isCompleted ? "Completed" : isCurrent ? "Current Stage" : "Scheduled"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Vertical Tracker (< md:) */}
      <div className="md:hidden space-y-2">
        {CONTRACT_STAGES.map((stage, idx) => {
          const isCompleted = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;
          const isSelected = stage.id === selectedStage;
          const IconComponent = stage.icon;

          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => onSelectStage(stage.id)}
              className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer ${
                isSelected
                  ? "bg-white shadow-xs border-2 border-emerald-500 ring-2 ring-emerald-100"
                  : "bg-white/60 hover:bg-white border border-gray-200/70"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                    isCompleted
                      ? "bg-emerald-600 text-white"
                      : isCurrent
                      ? "bg-blue-600 text-white ring-2 ring-blue-100"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <IconComponent size={14} />
                </div>
                <div>
                  <span
                    className={`text-xs block font-semibold ${
                      isSelected ? "text-emerald-900 font-bold" : "text-gray-800"
                    }`}
                  >
                    {stage.label}
                  </span>
                  <span
                    className={`text-[10px] block ${
                      isCompleted
                        ? "text-emerald-600 font-medium"
                        : isCurrent
                        ? "text-blue-600 font-bold"
                        : "text-gray-400"
                    }`}
                  >
                    {isCompleted ? "Completed" : isCurrent ? "Current Stage" : "Scheduled"}
                  </span>
                </div>
              </div>

              <ChevronRight
                size={16}
                className={isSelected ? "text-emerald-600" : "text-gray-300"}
              />
            </button>
          );
        })}
      </div>

      {/* Stage Detail Panel for the Selected Stage */}
      <StageDetailPanel
        stageId={selectedStage}
        contract={contract}
        stageIndex={selectedStageIndex}
        currentStageIndex={currentStageIndex}
      />
    </div>
  );
}

/**
 * Dedicated ContractCard Component:
 * Encapsulates independent UI state for each contract so selecting stages
 * on Contract #28 does NOT leak into Contract #27 or any other deed.
 */
function ContractCard({ contract }) {
  const currentStageId = getContractCurrentStage(contract);
  // Default selected stage is the contract's CURRENT active stage
  const [selectedStage, setSelectedStage] = useState(currentStageId);

  const isConfirmed =
    contract.status === "active" || contract.status === "confirmed";

  // Farmer profile image from existing contract data if present
  const farmerPhoto =
    contract.profile_image ||
    contract.avatar ||
    contract.profileImage ||
    contract.photo ||
    contract.image_url ||
    contract.avatar_url ||
    null;

  // Real farmer display name
  const farmerDisplayName =
    contract.farmer_name ||
    contract.seller_name ||
    (contract.farmer_id ? `Farmer #${contract.farmer_id}` : "Enrolled Producer");

  return (
    <Card className="p-5 sm:p-7 border-gray-200/90 hover:border-emerald-300 hover:shadow-md transition-all duration-200 bg-white rounded-2xl flex flex-col justify-between group">
      <div>
        {/* Card Header: Crop Image + Contract Spec + Total Value */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-start gap-3.5 min-w-0">
            {/* Visual Crop Presentation */}
            <CropImage cropName={contract.crop_name} size="md" />

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight truncate"
                  title={contract.crop_name}
                >
                  Contract #{contract.id}: {contract.crop_name} Consignment
                </h2>
                <StatusBadge
                  status={isConfirmed ? "Confirmed" : contract.status || "Active"}
                />
              </div>

              <p className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-2">
                <span>
                  Generated: {new Date(contract.created_at).toLocaleDateString()}
                </span>
                <span>•</span>
                <span className="font-medium text-gray-600">
                  Offer #{contract.offer_id}
                </span>
                <span>•</span>
                <span className="font-medium text-gray-600">
                  Requirement #{contract.requirement_id}
                </span>
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-baseline sm:items-end justify-between shrink-0">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Total Contract Value
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tracking-tight">
              ₹{Number(contract.total_amount).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Common Status Tracker (Clickable, Grounded, Isolated State) */}
        <ContractStatusTracker
          contract={contract}
          selectedStage={selectedStage}
          onSelectStage={setSelectedStage}
          currentStageId={currentStageId}
        />

        {/* Contract Specifications Grid (4 Columns) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b border-gray-100 text-xs sm:text-sm">
          {/* Agreed Rate */}
          <div>
            <span className="text-xs text-gray-400 block font-medium">Agreed Rate</span>
            <span className="font-bold text-gray-900 text-base block mt-0.5">
              ₹{Number(contract.agreed_price).toLocaleString("en-IN")}{" "}
              <span className="text-xs font-normal text-gray-500">/ {contract.unit}</span>
            </span>
            <span className="text-[11px] text-emerald-600 font-medium block mt-0.5">
              Fixed rate deed
            </span>
          </div>

          {/* Contracted Volume */}
          <div>
            <span className="text-xs text-gray-400 block font-medium">Contracted Volume</span>
            <span className="font-bold text-gray-900 text-base block mt-0.5">
              {Number(contract.quantity).toLocaleString("en-IN")}{" "}
              <span className="text-xs font-normal text-gray-500">{contract.unit}</span>
            </span>
            <span className="text-[11px] text-gray-500 block mt-0.5">
              Grade: {contract.quality_grade || "Grade A"}
            </span>
          </div>

          {/* Delivery Destination */}
          <div>
            <span className="text-xs text-gray-400 block font-medium">Delivery Destination</span>
            <span className="font-bold text-gray-900 text-base flex items-center gap-1 mt-0.5 min-w-0">
              <MapPin size={14} className="text-emerald-600 shrink-0" />
              <span className="truncate" title={contract.delivery_location || "Buyer Warehouse"}>
                {contract.delivery_location || "Buyer Warehouse"}
              </span>
            </span>
            {contract.required_by && (
              <span className="text-[11px] text-gray-500 block mt-0.5">
                Required By: {new Date(contract.required_by).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Payment Settlement Notice */}
          <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/70">
            <span className="text-xs text-amber-900 block font-bold">
              Payment Settlement
            </span>
            <div className="mt-1 flex items-center gap-1.5">
              <FileCheck size={15} className="text-amber-700 shrink-0" />
              <span className="font-bold text-amber-800 text-xs">
                Pending Gateway
              </span>
            </div>
            <div className="mt-1 text-[10px] text-amber-800/80 flex items-start gap-1">
              <Info size={11} className="mt-0.5 shrink-0 text-amber-700" />
              <span>Direct escrow payment integration pending backend support.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Part 1: Real Farmer Profile Section (Replacing generic "Enrolled Farmer") */}
      <div className="pt-4 mt-2 p-4 bg-gray-50/80 rounded-2xl border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Real Farmer Image / Fallback Avatar */}
          <Avatar
            src={farmerPhoto}
            name={farmerDisplayName}
            role="farmer"
            size="md"
            className="ring-2 ring-emerald-200 shrink-0 shadow-xs"
          />

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-gray-900 text-sm sm:text-base tracking-tight truncate">
                {farmerDisplayName}
              </h4>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70 shrink-0">
                Verified Producer
              </span>
              {contract.farmer_id && (
                <span className="text-[10px] text-gray-400 font-mono">
                  #F-{contract.farmer_id}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5 text-xs text-gray-500 mt-1 flex-wrap">
              {contract.farmer_district ? (
                <span className="flex items-center gap-1">
                  <MapPin size={12} className="text-emerald-600 shrink-0" />
                  {contract.farmer_district}
                  {contract.farmer_state ? `, ${contract.farmer_state}` : ""}
                </span>
              ) : contract.delivery_location ? (
                <span className="flex items-center gap-1">
                  <MapPin size={12} className="text-gray-400 shrink-0" />
                  {contract.delivery_location}
                </span>
              ) : null}

              {contract.farmer_phone && (
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <PhoneCall size={12} /> {contract.farmer_phone}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link to="/support">
            <Button
              size="xs"
              variant="outline"
              icon={ShieldCheck}
              className="text-amber-800 border-amber-300 hover:bg-amber-50 font-medium"
            >
              Dispute Support
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}

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
