export function Input({
  label,
  helperText,
  error,
  id,
  className = "",
  type = "text",
  required = false,
  icon: Icon,
  suffix,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative rounded-lg shadow-2xs">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Icon size={18} />
          </div>
        )}

        <input
          id={inputId}
          type={type}
          required={required}
          className={`block w-full rounded-lg border text-sm text-gray-900 transition-colors duration-150 outline-none
            ${Icon ? "pl-10" : "pl-3 sm:pl-3.5"}
            ${suffix ? "pr-12" : "pr-3 sm:pr-3.5"}
            py-2 sm:py-2.5 min-h-[42px]
            ${
              error
                ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                : "border-gray-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 bg-white"
            }
            ${className}`}
          {...props}
        />

        {suffix && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs sm:text-sm text-gray-500 font-medium">
            {suffix}
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

export default Input;
