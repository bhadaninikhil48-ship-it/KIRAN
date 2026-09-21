import { useState } from "react";

export function Avatar({
  src,
  name = "User",
  role = "farmer",
  size = "md",
  className = "",
  ring = false,
  showBadge = false,
  badgeColor = "bg-emerald-500",
  alt,
}) {
  const [hasError, setHasError] = useState(false);

  // Compute initials
  const initials = name
    ? name
        .trim()
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  // Size mapping
  const sizeClasses = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-9 h-9 text-xs",
    lg: "w-11 h-11 text-sm font-semibold",
    xl: "w-14 h-14 text-base font-bold",
    "2xl": "w-20 h-20 text-xl font-extrabold",
  };

  // Role-based background color for initials fallback
  const roleBg = {
    farmer: "bg-emerald-600 text-white",
    buyer: "bg-blue-600 text-white",
    fpo: "bg-teal-700 text-white",
  }[role] || "bg-emerald-600 text-white";

  const ringClass = ring ? "ring-2 ring-emerald-500/30 ring-offset-1" : "";
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  const showImage = Boolean(src) && !hasError;

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full select-none ${sizeClass} ${ringClass} ${className}`}
      title={name}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt || name}
          onError={() => setHasError(true)}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <div
          className={`w-full h-full rounded-full flex items-center justify-center font-bold uppercase ${roleBg}`}
        >
          {initials}
        </div>
      )}

      {showBadge && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-2 border-white ${badgeColor} ${
            size === "xs" || size === "sm"
              ? "w-2 h-2"
              : size === "md"
              ? "w-2.5 h-2.5"
              : "w-3.5 h-3.5"
          }`}
        />
      )}
    </div>
  );
}

export default Avatar;
