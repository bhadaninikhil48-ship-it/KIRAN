import {
  MapPin,
  Calendar,
  Package,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Truck,
  ArrowRight,
  Info,
  Navigation,
} from "lucide-react";
import { Modal } from "./ui/Modal";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Avatar } from "./ui/Avatar";
import { resolveBuyerProfile } from "./BuyerProfileModal";
import { calculateTransitDistance } from "../utils/distanceCalculator";
import { CropImage } from "./ui/CropImage";

export function BuyerOfferDetailsModal({
  isOpen,
  onClose,
  requirement,
  farmerOrigin,
  onSendProposal,
  sendActionLabel = "Send Proposal",
}) {
  if (!requirement) return null;

  const profile = resolveBuyerProfile(requirement);
  const buyerLocation = requirement.location || profile.location || "Delivery Point on Request";
  const origin = farmerOrigin || "Indore Agri Cluster • Madhya Pradesh";

  const transitInfo = calculateTransitDistance(origin, buyerLocation);

  const offeredRate = requirement.max_price
    ? Number(requirement.max_price).toLocaleString()
    : "Open";
  const unit = requirement.unit || "quintal";
  const requiredQty = requirement.quantity || "100";
  const qualityGrade = requirement.quality_grade || "Any Quality";
  const requiredByDate = requirement.required_by
    ? requirement.required_by.split("T")[0]
    : "Prompt Dispatch";

  const totalContractValue =
    requirement.estimatedLotValue ||
    (requirement.max_price
      ? Math.round(
          (Number(requiredQty) / (unit === "quintal" ? 1 : 100)) *
            Number(requirement.max_price)
        )
      : null);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Procurement Requirement & Offer Details"
      subtitle={`Requirement ID #REQ-${requirement.id || "101"} • ${requirement.crop_name}`}
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        {/* Buyer Identity Bar */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/90 border border-gray-200">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar
              name={profile.name}
              src={profile.avatar}
              role="buyer"
              size="lg"
              ring
              className="ring-emerald-500/20 shadow-2xs shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="font-bold text-gray-900 text-base truncate">{profile.name}</h4>
                <span className="text-emerald-600 shrink-0" title="Verified Buyer">
                  <CheckCircle2 size={14} />
                </span>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                <MapPin size={12} className="text-emerald-600 shrink-0" />
                <span className="truncate">{buyerLocation}</span>
              </p>
            </div>
          </div>

          <Badge variant="emerald" dot className="shrink-0 text-xs">
            Open Order
          </Badge>
        </div>

        {/* Primary Offer Pricing Card */}
        <div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 border-2 border-emerald-300 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3.5">
              <CropImage crop={requirement.crop_name} size="lot" className="rounded-xl shadow-xs shrink-0 border border-emerald-200" />
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                  Offered Rate • {requirement.crop_name}
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
                    {requirement.max_price ? `₹${offeredRate}` : "Open Rate"}
                  </span>
                  <span className="text-xs font-semibold text-emerald-900">
                    / {unit}
                  </span>
                </div>
              </div>
            </div>

            {totalContractValue && (
              <div className="text-right">
                <span className="text-[10px] uppercase font-semibold text-gray-400 block">
                  Est. Total Contract Value
                </span>
                <span className="text-base sm:text-lg font-bold text-gray-900">
                  ₹{totalContractValue.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-emerald-100/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-emerald-900">
            <div className="flex items-center gap-1.5 flex-wrap">
              <TrendingUp size={13} className="text-emerald-600 shrink-0" />
              <span>
                <strong>APMC Min Price:</strong>{" "}
                {requirement.apmcMinPrice
                  ? `₹${Number(requirement.apmcMinPrice).toLocaleString()} / quintal`
                  : "Mandi Floor Benchmark"}
              </span>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2 text-[11px] flex-wrap">
              <span className="text-gray-500 font-medium">
                MSP: <span className="font-semibold text-gray-700">MSP Unavailable</span>
              </span>
              <span className="font-bold bg-white/80 px-2 py-0.5 rounded border border-emerald-200 text-emerald-800 shrink-0">
                Prompt Escrow Settlement
              </span>
            </div>
          </div>
        </div>

        {/* Requirement Specs 4-Box Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100 space-y-1">
            <span className="text-gray-400 block text-[10px] uppercase font-semibold">
              Crop Required
            </span>
            <div className="flex items-center gap-2">
              <CropImage crop={requirement.crop_name} size="sm" className="rounded-md shrink-0" />
              <p className="font-bold text-gray-900 text-sm truncate">
                {requirement.crop_name}
              </p>
            </div>
          </div>

          <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100 space-y-0.5">
            <span className="text-gray-400 block text-[10px] uppercase font-semibold">
              Volume Needed
            </span>
            <p className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
              <Package size={14} className="text-emerald-600" />
              <span>{requiredQty} {unit}</span>
            </p>
          </div>

          <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100 space-y-0.5">
            <span className="text-gray-400 block text-[10px] uppercase font-semibold">
              Target Grade
            </span>
            <p className="font-bold text-emerald-800 text-sm flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>{qualityGrade}</span>
            </p>
          </div>

          <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100 space-y-0.5">
            <span className="text-gray-400 block text-[10px] uppercase font-semibold">
              Need-by Date
            </span>
            <p className="font-semibold text-gray-900 flex items-center gap-1.5">
              <Calendar size={14} className="text-emerald-600" />
              <span>{requiredByDate}</span>
            </p>
          </div>
        </div>

        {/* Logistics & Transit Distance Breakdown */}
        <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
              <Truck size={16} className="text-blue-600 shrink-0" />
              <span>Transit & Logistics Distance</span>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-white px-2.5 py-0.5 rounded-full border border-blue-200">
              {transitInfo.formatted}
            </span>
          </div>

          <div className="text-xs text-gray-600 space-y-1.5 bg-white/90 p-3 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-500">Farmer Origin:</span>
              <span className="font-bold text-gray-900">{origin}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-500">Buyer Delivery Point:</span>
              <span className="font-bold text-gray-900">{buyerLocation}</span>
            </div>
            <div className="pt-1 text-[11px] text-blue-700 font-medium">
              ℹ {transitInfo.note}
            </div>
          </div>
        </div>

        {/* Modal Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          {onSendProposal && (
            <Button
              variant="primary"
              size="sm"
              icon={ArrowRight}
              onClick={() => {
                onClose();
                onSendProposal(requirement);
              }}
            >
              {sendActionLabel}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default BuyerOfferDetailsModal;
