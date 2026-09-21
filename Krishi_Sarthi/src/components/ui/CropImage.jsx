import { useState, useEffect } from "react";
import { getCropImage, FALLBACK_CROP_IMAGE } from "../../utils/cropImages";

/**
 * Reusable CropImage component for consistent produce visual presentation across the Buyer application.
 *
 * Automatically resolves realistic vector produce graphics for known crops (Banana, Potato, Carrot,
 * Garlic/Lasun, Tomato, Onion, Wheat, Rice, Soybean, Litchi, etc.) and falls back to a neutral produce
 * crate/sprout visual for test or unrecognized crop names.
 */
export function CropImage({
  cropName,
  size = "md",
  className = "",
  imageClassName = "",
  alt,
  rounded = "rounded-2xl",
  bordered = true,
  shadow = true,
  hoverEffect = true,
}) {
  const resolvedSrc = getCropImage(cropName);
  const [currentSrc, setCurrentSrc] = useState(resolvedSrc);

  // Update image source if cropName changes dynamically
  useEffect(() => {
    setCurrentSrc(getCropImage(cropName));
  }, [cropName]);

  // Size mapping
  const sizeClasses = {
    xs: "w-8 h-8 p-1 rounded-lg",
    sm: "w-11 h-11 sm:w-12 sm:h-12 p-1.5 rounded-xl",
    md: "w-14 h-14 sm:w-16 sm:h-16 p-1.5 rounded-2xl",
    lg: "w-20 h-20 p-2 rounded-2xl",
    xl: "w-24 h-24 p-2.5 rounded-3xl",
  };

  const chosenSizeClass = sizeClasses[size] || sizeClasses.md;
  const borderClass = bordered ? "border border-gray-100/90" : "";
  const shadowClass = shadow ? "shadow-2xs" : "";
  const hoverClass = hoverEffect ? "group-hover:scale-105 transition-transform duration-200" : "";

  const effectiveAlt =
    alt || (cropName ? `Fresh ${cropName} produce` : "Agricultural produce");

  return (
    <div
      className={`overflow-hidden shrink-0 bg-gray-50/80 flex items-center justify-center select-none ${chosenSizeClass} ${borderClass} ${shadowClass} ${hoverClass} ${className}`}
      title={cropName || "Agricultural Commodity"}
    >
      <img
        src={currentSrc}
        alt={effectiveAlt}
        className={`w-full h-full object-contain pointer-events-none ${imageClassName}`}
        onError={() => {
          if (currentSrc !== FALLBACK_CROP_IMAGE) {
            setCurrentSrc(FALLBACK_CROP_IMAGE);
          }
        }}
      />
    </div>
  );
}

export default CropImage;
