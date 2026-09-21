import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  ClipboardList,
  ShieldCheck,
  PackageCheck,
  Truck,
  CheckCircle2,
  CreditCard,
  IndianRupee,
  MapPin,
  Calendar,
  Clock,
  Navigation,
  CheckCheck,
  Package,
  Sparkles,
  Check,
  ChevronRight,
} from "lucide-react";
import { Modal } from "./ui/Modal";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { CropImage } from "./ui/CropImage";

export const LIFECYCLE_STAGES = [
  { id: 1, key: "order_initiated", label: "Order Initiated", icon: ClipboardList },
  { id: 2, key: "order_confirmed", label: "Order Confirmed", icon: ShieldCheck },
  { id: 3, key: "pickup_completed", label: "Pickup Completed", icon: PackageCheck },
  { id: 4, key: "in_delivery", label: "In Delivery", icon: Truck },
  { id: 5, key: "delivered", label: "Delivered", icon: CheckCircle2 },
  { id: 6, key: "payment_initiated", label: "Payment Initiated", icon: CreditCard },
  { id: 7, key: "payment_successful", label: "Payment Successful", icon: IndianRupee },
];

export function getProduceStage(item) {
  if (!item) return 1;
  const saved = localStorage.getItem(`kiran_produce_stage_${item.id}`);
  if (saved !== null) {
    return Math.max(1, Math.min(7, parseInt(saved, 10)));
  }
  if (item.status === "sold") return 7;
  if (item.status === "in_transit" || item.status === "in delivery") return 4;
  
  // Deterministic demonstration baseline for pre-seeded database lots
  if (item.id === 1) return 4; // In Delivery with live tracking
  if (item.id === 3) return 7; // Payment Successful completed summary
  return 1; // Newly added or standard listing: Order Initiated (waiting for buyer)
}

export function formatEventDate(baseDateStr, daysOffset = 0) {
  let baseDate;
  if (baseDateStr) {
    baseDate = new Date(baseDateStr);
    if (isNaN(baseDate.getTime())) {
      baseDate = new Date("2026-09-20T10:00:00Z");
    }
  } else {
    baseDate = new Date("2026-09-20T10:00:00Z");
  }
  const target = new Date(baseDate);
  target.setDate(target.getDate() + daysOffset);
  return target.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function ProduceDetailModal({
  isOpen,
  onClose,
  item,
  onStageChange,
  allowSimulation = false,
}) {
  const { user } = useContext(AuthContext) || {};
  const [currentStage, setCurrentStage] = useState(1);

  // Role-gated: Strictly hidden for farmer role (must remain read-only view)
  const canSimulate = Boolean(allowSimulation && user?.role && user.role !== "farmer");

  useEffect(() => {
    if (item) {
      setCurrentStage(getProduceStage(item));
    }
  }, [item, isOpen]);

  if (!item) return null;

  const handleUpdateStage = (newStage) => {
    setCurrentStage(newStage);
    localStorage.setItem(`kiran_produce_stage_${item.id}`, newStage.toString());
    if (onStageChange) {
      onStageChange(item.id, newStage);
    }
  };

  // Generate realistic sequential dates for each stage based on listing date
  const stageDates = {
    1: formatEventDate(item.created_at, 0),
    2: formatEventDate(item.created_at, 2),
    3: formatEventDate(item.created_at, 4),
    4: formatEventDate(item.created_at, 5),
    5: formatEventDate(item.created_at, 7),
    6: formatEventDate(item.created_at, 7),
    7: formatEventDate(item.created_at, 8),
  };

  const currentStageObj = LIFECYCLE_STAGES.find((s) => s.id === currentStage) || LIFECYCLE_STAGES[0];
  const isTransactionCompleted = currentStage === 7;
  const isInDelivery = currentStage === 4;

  // Real or estimated prices
  const estimatedRate = 2750;
  const totalWeightQuintal = item.unit === "kg" ? Number(item.quantity) / 100 : Number(item.quantity);
  const estimatedGross = Math.round(totalWeightQuintal * estimatedRate);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${item.crop_name} — Transaction & Consignment Tracking`}
      subtitle={`Lot ID #KS-LOT-${item.id} • Registered Farmgate: ${item.location || "Indore, Madhya Pradesh"}`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Top Status & Prototype Stage Controller */}
        <div className="bg-gradient-to-r from-emerald-50 via-white to-blue-50 border border-gray-200/90 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-4">
            <CropImage
              crop={item.crop_name}
              size="lot"
              className="rounded-2xl shadow-sm shrink-0 border-2 border-emerald-200"
            />
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Current Transaction Status • {item.crop_name}
              </span>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    isTransactionCompleted
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : isInDelivery
                      ? "bg-blue-100 text-blue-800 border border-blue-300"
                      : currentStage === 1
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  <currentStageObj.icon size={14} />
                  <span>{currentStageObj.label}</span>
                </span>

                <span className="text-xs text-gray-600 font-medium">
                  Stage {currentStage} of 7
                </span>
              </div>

              <p className="text-xs text-gray-600 mt-1">
                {currentStage === 1 &&
                  "Produce lot published on KIRAN exchange. Awaiting institutional buyer match & procurement contract."}
                {currentStage === 2 &&
                  "Buyer purchase order accepted. Consignment verification & quality inspection scheduled."}
                {currentStage === 3 &&
                  "Harvest collected from farmgate location. Transport dispatch confirmed."}
                {currentStage === 4 &&
                  "Produce consignment is currently in transit to regional distribution hub."}
                {currentStage === 5 &&
                  "Consignment safely delivered to buyer aggregation center. Awaiting settlement release."}
                {currentStage === 6 &&
                  "Escrow payment clearance initiated to farmer's linked bank account."}
                {currentStage === 7 &&
                  "Transaction fully settled! Payment credited to farmer's linked SBI account."}
              </p>
            </div>
          </div>

          {/* Demo stage controller (role-gated: strictly hidden for Farmer role) */}
          {canSimulate && (
            <div className="flex items-center gap-2 bg-white/80 p-2 rounded-xl border border-gray-200 shrink-0">
              <span className="text-[11px] font-semibold text-gray-500 hidden sm:inline">
                Simulate:
              </span>
              <select
                value={currentStage}
                onChange={(e) => handleUpdateStage(parseInt(e.target.value, 10))}
                aria-label="Simulate Lifecycle Stage"
                className="text-xs font-semibold bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {LIFECYCLE_STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.id}. {s.label}
                  </option>
                ))}
              </select>

              {currentStage < 7 && (
                <button
                  type="button"
                  onClick={() => handleUpdateStage(currentStage + 1)}
                  title="Advance to next lifecycle stage"
                  className="text-xs font-semibold px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <span>Advance</span>
                  <ChevronRight size={13} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* PRODUCE LOT SPECIFICATIONS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50/80 p-4 rounded-xl border border-gray-200/80 text-xs">
          <div className="space-y-1">
            <span className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold">
              Produce & Quality
            </span>
            <div className="flex items-center gap-2.5 pt-0.5">
              <CropImage crop={item.crop_name} size="card" className="rounded-xl shadow-2xs shrink-0 border border-gray-200" />
              <div className="min-w-0">
                <p className="font-bold text-gray-900 text-sm truncate">{item.crop_name}</p>
                <span className="inline-block text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                  {item.quality_grade || "Grade A"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold">
              Consignment Volume
            </span>
            <p className="font-bold text-gray-900 text-sm">
              {item.quantity} {item.unit}
            </p>
            {item.unit === "kg" && (
              <p className="text-[11px] text-gray-500">
                ({totalWeightQuintal.toFixed(1)} Quintals)
              </p>
            )}
          </div>

          <div className="space-y-0.5">
            <span className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold">
              Target Value / Payout
            </span>
            <p className="font-bold text-emerald-700 text-sm">
              ₹{estimatedGross.toLocaleString()}
            </p>
            <p className="text-[11px] text-gray-500">
              ₹{estimatedRate.toLocaleString()}/q benchmark
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold">
              Buyer Placement
            </span>
            <p className="font-semibold text-gray-900 truncate">
              {currentStage >= 2
                ? "FreshMart Agri Logistics"
                : "Awaiting Procurement Match"}
            </p>
            <p className="text-[11px] text-gray-500 truncate">
              {currentStage >= 2 ? "Contract #KS-4091" : "Listed on KIRAN Exchange"}
            </p>
          </div>
        </div>

        {/* HORIZONTAL TRANSACTION LIFECYCLE (Must be ONE HORIZONTAL ROW on desktop) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
              <Clock size={14} className="text-emerald-600" />
              <span>Complete Transaction Lifecycle</span>
            </h4>
            <span className="text-[11px] text-gray-500 font-medium">
              Horizontal Progress Timeline
            </span>
          </div>

          <div className="w-full bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-2xs overflow-x-auto pb-4 pt-4">
            {/* The Horizontal Timeline Row */}
            <div className="min-w-[720px] flex items-start justify-between relative px-2">
              {/* Background connecting track */}
              <div className="absolute top-5 left-8 right-8 h-1 bg-gray-200 -z-0" />

              {/* Active filled connecting line */}
              <div
                className="absolute top-5 left-8 h-1 bg-emerald-500 transition-all duration-300 -z-0"
                style={{
                  width: `${((Math.min(currentStage, 7) - 1) / 6) * 100}%`,
                }}
              />

              {LIFECYCLE_STAGES.map((stage) => {
                const isCompleted = stage.id < currentStage;
                const isCurrent = stage.id === currentStage;
                const isPending = stage.id > currentStage;
                const StageIcon = stage.icon;
                const stageDate = isPending ? "Pending" : stageDates[stage.id];

                return (
                  <div
                    key={stage.id}
                    className="flex flex-col items-center text-center relative z-10 flex-1 px-1"
                  >
                    {/* Circle Node with Icon */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? "bg-emerald-600 text-white shadow-xs ring-4 ring-emerald-50"
                          : isCurrent
                          ? "bg-blue-600 text-white shadow-md ring-4 ring-blue-100 scale-110"
                          : "bg-white text-gray-400 border-2 border-gray-300 shadow-2xs"
                      }`}
                      title={`${stage.label} — ${stageDate}`}
                    >
                      {isCompleted ? (
                        <Check size={18} strokeWidth={3} />
                      ) : (
                        <StageIcon size={18} />
                      )}
                    </div>

                    {/* Stage Name */}
                    <span
                      className={`text-xs mt-2 font-bold leading-tight ${
                        isCurrent
                          ? "text-blue-700"
                          : isCompleted
                          ? "text-gray-900"
                          : "text-gray-400 font-medium"
                      }`}
                    >
                      {stage.label}
                    </span>

                    {/* Date or Pending text */}
                    <span
                      className={`text-[11px] mt-1 font-semibold ${
                        isCurrent
                          ? "text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full"
                          : isCompleted
                          ? "text-emerald-700"
                          : "text-gray-400 font-normal"
                      }`}
                    >
                      {stageDate}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* LIVE IN-TRANSIT LOCATION SECTION (Only visible while produce is in delivery / in transit) */}
        {isInDelivery && (
          <div className="bg-gradient-to-br from-blue-50/80 via-white to-emerald-50/40 border-2 border-blue-200 rounded-2xl p-5 shadow-xs space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-blue-100">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Live Consignment Tracking & In-Transit Location
                </h4>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                <Truck size={14} />
                <span>Status: In Delivery</span>
              </span>
            </div>

            {/* Highway Location Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="bg-white border border-blue-100 rounded-xl p-3.5 shadow-2xs flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-700 shrink-0 mt-0.5">
                  <Navigation size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Current Highway Location
                  </span>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">
                    Dewas → Gaya Highway (NH 52, Near Indore Logistics Hub)
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Speed: 54 km/h • GPS Signal: Active
                  </p>
                </div>
              </div>

              <div className="bg-white border border-blue-100 rounded-xl p-3.5 shadow-2xs flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 shrink-0 mt-0.5">
                  <Truck size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Assigned Fleet & Transporter
                  </span>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">
                    KIRAN Agri Reefer #MP-09-AG-8821
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Driver: Ramesh Singh (+91 98260 12345)
                  </p>
                </div>
              </div>
            </div>

            {/* In-Transit Visual Progress Bar */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs font-medium text-gray-600 mb-1.5">
                <span>Farmgate: {item.location || "Indore"}</span>
                <span className="font-bold text-blue-700">65% Transit Completed</span>
                <span>Destination: FreshMart Regional Hub</span>
              </div>
              <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-blue-600 h-2.5 rounded-full w-[65%]" />
              </div>
            </div>
          </div>
        )}

        {/* COMPLETED TRANSACTION SUMMARY (Displayed when Payment Successful / Stage 7) */}
        {isTransactionCompleted && (
          <div className="bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/50 border-2 border-emerald-300 rounded-2xl p-5 shadow-xs space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <CheckCheck size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">
                    Transaction Successfully Completed & Settled
                  </h4>
                  <p className="text-xs text-emerald-700">
                    All fulfillment milestones verified and escrow funds settled
                  </p>
                </div>
              </div>
              <Badge variant="emerald" dot>
                Finalized
              </Badge>
            </div>

            {/* Clean Historical Milestones */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-white rounded-xl border border-emerald-200/80 shadow-2xs flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <PackageCheck size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">✓ Pickup Completed</p>
                  <p className="text-xs text-gray-500">{stageDates[3]}</p>
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-emerald-200/80 shadow-2xs flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">✓ Delivered</p>
                  <p className="text-xs text-gray-500">{stageDates[5]}</p>
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-emerald-200/80 shadow-2xs flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <IndianRupee size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">✓ Payment Successful</p>
                  <p className="text-xs text-gray-500">{stageDates[7]}</p>
                </div>
              </div>
            </div>

            {/* Settlement Receipt */}
            <div className="text-xs bg-emerald-100/60 text-emerald-900 rounded-xl p-3 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="font-medium">
                ₹{estimatedGross.toLocaleString()} settled to Farmer SBI Account (Ending ...4091)
              </span>
              <span className="font-bold text-[11px] text-emerald-800 bg-white/80 px-2 py-0.5 rounded border border-emerald-200">
                UTR #KIRAN-2026-SETTLE-0926
              </span>
            </div>
          </div>
        )}

        {/* Farmgate & Scheduling Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-200/80">
          <div className="flex items-center gap-2">
            <MapPin size={15} className="text-gray-400 shrink-0" />
            <span>Farmgate Location: <strong className="text-gray-800">{item.location || "Indore, Madhya Pradesh"}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-gray-400 shrink-0" />
            <span>Harvest Ready Date: <strong className="text-gray-800">{item.available_from ? String(item.available_from).split("T")[0] : "Prompt"}</strong></span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ProduceDetailModal;
