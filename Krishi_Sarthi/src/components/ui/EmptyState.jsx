import { Inbox } from "lucide-react";
import Button from "./Button";

export function EmptyState({
  icon: Icon = Inbox,
  title = "No data found",
  description = "Try adjusting your filters or search terms.",
  actionLabel,
  onAction,
  className = "",
}) {
  return (
    <div
      className={`text-center py-10 sm:py-14 px-4 bg-gray-50/70 rounded-2xl border border-dashed border-gray-200 ${className}`}
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100/70 text-emerald-700 mb-3">
        <Icon size={24} />
      </div>
      <h3 className="text-sm sm:text-base font-semibold text-gray-900">
        {title}
      </h3>
      <p className="mt-1 text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-4">
          <Button size="sm" variant="outline" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

export default EmptyState;
