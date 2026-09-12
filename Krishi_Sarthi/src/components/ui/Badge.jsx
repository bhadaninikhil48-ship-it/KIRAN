export function Badge({
  children,
  variant = "neutral",
  size = "sm",
  dot = false,
  className = "",
}) {
  const variants = {
    neutral: "bg-gray-100 text-gray-700 border-gray-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    green: "bg-green-50 text-green-700 border-green-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    yellow: "bg-yellow-50 text-yellow-800 border-yellow-200",
    red: "bg-red-50 text-red-700 border-red-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  };

  const dotColors = {
    neutral: "bg-gray-400",
    emerald: "bg-emerald-500",
    green: "bg-green-500",
    blue: "bg-blue-500",
    amber: "bg-amber-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
    purple: "bg-purple-500",
  };

  const sizes = {
    xs: "text-[11px] px-2 py-0.5 font-medium",
    sm: "text-xs px-2.5 py-0.5 font-medium",
    md: "text-xs sm:text-sm px-3 py-1 font-medium",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${
        sizes[size] || sizes.sm
      } ${variants[variant] || variants.neutral} ${className}`}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            dotColors[variant] || dotColors.neutral
          }`}
        />
      )}
      {children}
    </span>
  );
}

export default Badge;
