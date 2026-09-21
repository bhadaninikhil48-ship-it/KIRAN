import {
  CheckCircle2,
  MapPin,
  Calendar,
  Package,
  Star,
  ShieldCheck,
  Building2,
  Clock,
  Send,
  ExternalLink,
} from "lucide-react";
import { Modal } from "./ui/Modal";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Avatar } from "./ui/Avatar";
import { CropImage } from "./ui/CropImage";

// Known verified profiles for demonstration & institutional buyers
const KNOWN_BUYER_METADATA = {
  3: {
    name: "ABC Foods & Agro Products Pvt. Ltd.",
    badge: "Verified Institutional Buyer",
    rating: 4.7,
    reviewsCount: 38,
    since: "March 2025",
    completedPurchases: 128,
    location: "Bilaspur, Chhattisgarh",
    category: "FMCG Food Processing & Export",
    gstin: "22AABCA1234F1Z8",
    paymentSecurity: "100% Escrow Backed",
    recentPurchases: [
      { crop: "Wheat", qty: "250 quintal", date: "15 Sep 2026" },
      { crop: "Rice", qty: "500 quintal", date: "28 Aug 2026" },
      { crop: "Potato", qty: "100 quintal", date: "10 Aug 2026" },
    ],
  },
  1: {
    name: "FreshMart Agri Logistics",
    badge: "Verified Corporate Buyer",
    rating: 4.8,
    reviewsCount: 56,
    since: "June 2024",
    completedPurchases: 142,
    location: "Indore Agri Cluster, Madhya Pradesh",
    category: "Fresh Retail Chain & Cold Chain Storage",
    gstin: "23AABCF9876G1Z2",
    paymentSecurity: "100% Escrow Backed",
    recentPurchases: [
      { crop: "Tomato", qty: "500 quintal", date: "12 Sep 2026" },
      { crop: "Onion", qty: "800 quintal", date: "01 Sep 2026" },
      { crop: "Garlic", qty: "350 quintal", date: "22 Aug 2026" },
    ],
  },
  2: {
    name: "ITC Choupal Procurement",
    badge: "Government Certified Corporate",
    rating: 4.9,
    reviewsCount: 112,
    since: "January 2023",
    completedPurchases: 320,
    location: "Bhopal Hub, Madhya Pradesh",
    category: "National Commodity Procurement",
    gstin: "23AAACI0001B1Z9",
    paymentSecurity: "100% Escrow Backed",
    recentPurchases: [
      { crop: "Wheat", qty: "1,200 quintal", date: "18 Sep 2026" },
      { crop: "Soybean", qty: "900 quintal", date: "06 Sep 2026" },
      { crop: "Gram", qty: "450 quintal", date: "20 Aug 2026" },
    ],
  },
};

/**
 * Resolves full verified buyer profile by merging backend fields with profile metadata
 */
export function resolveBuyerProfile(req) {
  if (!req) {
    return {
      id: 3,
      name: "ABC Foods Pvt. Ltd.",
      rating: 4.7,
      since: "March 2025",
      completedPurchases: 128,
      location: "Bilaspur, Chhattisgarh",
      verified: true,
      recentPurchases: [
        { crop: "Wheat", qty: "250 quintal" },
        { crop: "Rice", qty: "500 quintal" },
        { crop: "Potato", qty: "100 quintal" },
      ],
    };
  }

  const buyerKey = req.buyer_id || req.id || 3;
  const known = KNOWN_BUYER_METADATA[buyerKey] || KNOWN_BUYER_METADATA[3];

  const displayName =
    req.buyer_name && req.buyer_name !== "Demo" && req.buyer_name !== "Verified Buyer"
      ? req.buyer_name
      : known?.name || "ABC Foods Pvt. Ltd.";

  const displayLocation = req.location || known?.location || "Bilaspur, Chhattisgarh";

  const displaySince = req.buyer_since
    ? new Date(req.buyer_since).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
    : known?.since || "March 2025";

  const storedAvatar =
    typeof window !== "undefined"
      ? (req.buyer_id && localStorage.getItem(`kiran_avatar_${req.buyer_id}`)) ||
        (req.id && localStorage.getItem(`kiran_avatar_${req.id}`)) ||
        (buyerKey && localStorage.getItem(`kiran_avatar_${buyerKey}`)) ||
        null
      : null;

  return {
    id: req.buyer_id || req.id,
    name: displayName,
    avatar: req.buyer_avatar || storedAvatar || null,
    badge: known?.badge || "✓ Verified Buyer",
    rating: known?.rating || 4.7,
    reviewsCount: known?.reviewsCount || 38,
    since: displaySince,
    completedPurchases: known?.completedPurchases || 128,
    location: displayLocation,
    category: known?.category || "Agro Commodity Wholesale & Processing",
    gstin: known?.gstin || "22AABCA1234F1Z8",
    paymentSecurity: "100% Escrow Protected",
    verified: true,
    recentPurchases: known?.recentPurchases || [
      { crop: "Wheat", qty: "250 quintal", date: "15 Sep 2026" },
      { crop: "Rice", qty: "500 quintal", date: "28 Aug 2026" },
      { crop: "Potato", qty: "100 quintal", date: "10 Aug 2026" },
    ],
  };
}

export function BuyerProfileModal({
  isOpen,
  onClose,
  requirement,
  onSendOffer,
}) {
  if (!requirement) return null;

  const profile = resolveBuyerProfile(requirement);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Buyer Profile & Verification"
      subtitle="KIRAN Verified Institutional Procurement Partner"
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        {/* Top Header Profile Banner */}
        <div className="bg-gradient-to-r from-emerald-50 via-white to-blue-50 border border-gray-200/90 rounded-2xl p-4 sm:p-5 flex items-start gap-4 shadow-2xs">
          <Avatar
            name={profile.name}
            src={profile.avatar}
            role="buyer"
            size="xl"
            ring
            className="shrink-0 shadow-xs ring-emerald-500/20"
          />

          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-gray-900 leading-tight">
                {profile.name}
              </h3>
            </div>

            <div className="flex items-center gap-2 flex-wrap pt-0.5">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                <CheckCircle2 size={12} className="text-emerald-600" />
                <span>✓ Verified Buyer</span>
              </span>

              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                <Star size={12} className="fill-amber-500 text-amber-500" />
                <span>{profile.rating} Rating</span>
                <span className="text-gray-400 text-[11px] font-normal">
                  ({profile.reviewsCount} reviews)
                </span>
              </span>
            </div>

            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
              <MapPin size={13} className="text-emerald-600 shrink-0" />
              <span>{profile.location}</span>
            </p>
          </div>
        </div>

        {/* 2-Column Key Trust Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-100 space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 block">
              On KIRAN since:
            </span>
            <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <Calendar size={14} className="text-emerald-600" />
              <span>{profile.since}</span>
            </p>
          </div>

          <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-100 space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 block">
              Completed Purchases:
            </span>
            <p className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>{profile.completedPurchases} Lots Settled</span>
            </p>
          </div>
        </div>

        {/* Recent Purchases List */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
            <Package size={14} className="text-emerald-600" />
            <span>Recent Purchases:</span>
          </h4>

          {profile.recentPurchases && profile.recentPurchases.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden shadow-2xs">
              {profile.recentPurchases.map((item, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2.5 flex items-center justify-between text-xs hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <CropImage crop={item.crop} size="sm" className="rounded-lg shrink-0 shadow-2xs border border-gray-200" />
                    <div>
                      <span className="font-bold text-gray-900 block">
                        {item.crop}
                      </span>
                      <span className="text-[11px] text-gray-500 font-medium">
                        Volume: {item.qty}
                      </span>
                    </div>
                  </div>
                  {item.date && (
                    <span className="text-[11px] text-gray-400 font-medium">
                      {item.date}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-500 border border-gray-100 text-center">
              No previous purchase history available yet on KIRAN exchange.
            </div>
          )}
        </div>

        {/* Business & Trade Security Details */}
        <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-medium">Procurement Security:</span>
            <span className="font-bold text-emerald-800 flex items-center gap-1">
              <ShieldCheck size={13} className="text-emerald-600" />
              100% Escrow Protection Guaranteed
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-medium">Business Sector:</span>
            <span className="font-semibold text-gray-900">{profile.category}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-medium">GSTIN / Registration:</span>
            <span className="font-mono text-gray-700">{profile.gstin}</span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          {onSendOffer && (
            <Button
              variant="primary"
              size="sm"
              icon={Send}
              onClick={() => {
                onClose();
                onSendOffer(requirement);
              }}
            >
              Send Offer to Buyer
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default BuyerProfileModal;
