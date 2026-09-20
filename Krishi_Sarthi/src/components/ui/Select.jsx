import { ChevronDown } from "lucide-react";

export function Select({
  label,
  helperText,
  error,
  id,
  className = "",
  required = false,
  children,
  options,
  ...props
}) {
  const selectId =
    id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative rounded-lg shadow-2xs">
        <select
          id={selectId}
          required={required}
          className={`appearance-none block w-full rounded-lg border text-sm text-gray-900 transition-colors duration-150 outline-none
            pl-3 sm:pl-3.5 pr-10 py-2 sm:py-2.5 min-h-[42px] bg-white cursor-pointer
            ${
              error
                ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                : "border-gray-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
            }
            ${className}`}
          {...props}
        >
          {children ||
            options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
          <ChevronDown size={18} />
        </div>
      </div>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

export default Select;