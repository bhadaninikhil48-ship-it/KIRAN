export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  loading = false,
  type = "button",
  icon: Icon,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

  const sizeStyles = {
    xs: "text-xs px-2.5 py-1 gap-1.5 min-h-[30px]",
    sm: "text-xs sm:text-sm px-3 py-1.5 gap-2 min-h-[34px]",
    md: "text-sm px-4 py-2 gap-2 min-h-[40px]",
    lg: "text-base px-5 py-2.5 gap-2.5 min-h-[46px]",
  };

  const variantStyles = {
    primary:
      "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-xs focus:ring-emerald-500",
    secondary:
      "bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100/80 active:bg-emerald-200/80 focus:ring-emerald-500",
    outline:
      "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100 shadow-xs focus:ring-gray-400",
    ghost:
      "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-400",
    danger:
      "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-xs focus:ring-red-500",
    amber:
      "bg-amber-600 text-white hover:bg-amber-700 active:bg-amber-800 shadow-xs focus:ring-amber-500",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${
        variantStyles[variant] || variantStyles.primary
      } ${className}`}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      ) : (
        Icon && <Icon size={size === "xs" ? 14 : size === "sm" ? 16 : 18} />
      )}
      <span>{children}</span>
    </button>
  );
}

export default Button;
