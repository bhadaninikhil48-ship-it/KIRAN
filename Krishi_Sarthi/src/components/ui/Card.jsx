export function Card({
  children,
  className = "",
  hover = false,
  padding = "default",
  ...props
}) {
  const paddings = {
    none: "",
    sm: "p-3 sm:p-4",
    default: "p-4 sm:p-6",
    lg: "p-5 sm:p-7 md:p-8",
  };

  return (
    <div
      className={`bg-white border border-gray-200/90 rounded-xl sm:rounded-2xl shadow-xs transition-all duration-200 ${
        hover ? "hover:border-emerald-300 hover:shadow-md cursor-pointer" : ""
      } ${paddings[padding] || paddings.default} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className = "" }) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 mb-4 border-b border-gray-100 ${className}`}
    >
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}

export default Card;
