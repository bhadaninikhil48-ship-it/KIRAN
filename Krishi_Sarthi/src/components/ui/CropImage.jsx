import { useState } from "react";
import { getCropImage } from "../../utils/cropImageMap";

/**
 * CropImage Component
 * 
 * CORE PRODUCT PURPOSE:
 * Serves as a PRIMARY CROP-RECOGNITION / ACCESSIBILITY FEATURE for farmers with limited literacy.
 * Renders large, recognizable, natural agricultural produce photography so that the user
 * can visually identify the crop immediately (e.g. "Ye aaloo hai") without reading text.
 * 
 * Context Sizes:
 * - 'xs': 24x24px (compact chips/indicators)
 * - 'sm': 36x36px (list rows/specs)
 * - 'md': 48x48px (standard cards)
 * - 'table': 56-64px (Market Intelligence commodity table rows)
 * - 'card': 56-64px (buyer cards, offer cards, dashboard cards)
 * - 'lg': 64-80px (Active produce listings, consignment cards)
 * - 'lot': 80-96px (Active Farm Lot hero card)
 * - 'preview': 96-112px (Sell New Crop form selection visual confirmation)
 * - 'xl': 112-128px (large detail views)
 */
export function CropImage({
  crop,
  cropName,
  size = "md",
  shape = "rounded",
  className = "",
  alt,
  showCategoryBadge = false,
}) {
  const [hasError, setHasError] = useState(false);

  const effectiveCrop = cropName || crop || "Wheat";
  const cropData = getCropImage(effectiveCrop);

  // Sizing definitions mapped to Tailwind classes
  const sizeClasses = {
    xs: "w-6 h-6 text-xs",
    sm: "w-9 h-9 text-sm",
    md: "w-12 h-12 text-base",
    table: "w-14 h-14 sm:w-16 sm:h-16 text-xl",
    card: "w-14 h-14 sm:w-16 sm:h-16 text-xl",
    lg: "w-16 h-16 sm:w-20 sm:h-20 text-2xl",
    lot: "w-20 h-20 sm:w-24 sm:h-24 text-3xl",
    preview: "w-24 h-24 sm:w-28 sm:h-28 text-4xl",
    xl: "w-28 h-28 sm:w-32 sm:h-32 text-4xl",
  }[size] || "w-12 h-12 text-base";

  // Shape definitions
  const shapeClasses = {
    rounded: "rounded-xl",
    circle: "rounded-full",
    square: "rounded-lg",
  }[shape] || "rounded-xl";

  // Category-based emergency fallback colors
  const categoryBg = {
    Cereals: "bg-amber-100 text-amber-800 border-amber-200",
    Millets: "bg-amber-100 text-amber-800 border-amber-200",
    Vegetables: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Fruits: "bg-orange-100 text-orange-800 border-orange-200",
    Pulses: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Oilseeds: "bg-lime-100 text-lime-800 border-lime-200",
    Spices: "bg-amber-100 text-amber-900 border-amber-200",
    "Cash Crops": "bg-slate-100 text-slate-800 border-slate-200",
    "Dry Fruits": "bg-amber-100 text-amber-900 border-amber-200",
    Flowers: "bg-pink-100 text-pink-800 border-pink-200",
    Fodder: "bg-emerald-100 text-emerald-800 border-emerald-200",
  }[cropData.category] || "bg-emerald-100 text-emerald-800 border-emerald-200";

  const displayAlt = alt || cropData.alt || `${crop} natural produce photograph`;

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden border border-gray-200/90 shadow-2xs select-none bg-gray-50 ${sizeClasses} ${shapeClasses} ${className}`}
      title={crop}
    >
      {!hasError && cropData.url ? (
        <img
          src={cropData.url}
          alt={displayAlt}
          loading="lazy"
          onError={() => setHasError(true)}
          className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
        />
      ) : (
        /* Emergency Fallback (offline or failed network request) */
        <div
          className={`w-full h-full flex flex-col items-center justify-center border font-bold ${categoryBg}`}
        >
          <span>{cropData.fallbackEmoji || "🌾"}</span>
        </div>
      )}

      {showCategoryBadge && cropData.category && (
        <span className="absolute bottom-0 right-0 px-1 py-0.5 text-[9px] font-bold bg-black/60 text-white rounded-tl backdrop-blur-xs">
          {cropData.category}
        </span>
      )}
    </div>
  );
}

export default CropImage;
