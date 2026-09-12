export function LoadingState({ message = "Loading data...", className = "" }) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    >
      <div className="relative flex h-10 w-10 items-center justify-center mb-3">
        <div className="absolute h-10 w-10 animate-ping rounded-full bg-emerald-200 opacity-60"></div>
        <div className="h-7 w-7 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin"></div>
      </div>
      <p className="text-sm font-medium text-gray-700">{message}</p>
      <p className="text-xs text-gray-400 mt-0.5">Fetching latest market intelligence</p>
    </div>
  );
}

export default LoadingState;
