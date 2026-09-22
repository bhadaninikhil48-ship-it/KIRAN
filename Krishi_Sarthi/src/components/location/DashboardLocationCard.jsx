import { useContext } from "react";
import {
  MapPin,
  ChevronRight,
  Plus,
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { useAddresses } from "../../context/AddressContext";

export function DashboardLocationCard({ className = "" }) {
  const { user } = useContext(AuthContext) || {};
  const {
    defaultAddress,
    selectedAddress,
    openAddressManager,
    openAddAddress,
  } = useAddresses();

  const userRole = user?.role || "farmer";

  // Contextual labels based on user role
  const roleLabel =
    userRole === "buyer"
      ? "Procurement Warehouse"
      : userRole === "fpo"
      ? "Aggregation Hub"
      : "Primary Farmgate";

  // Active location: selected address or default address
  const activeLocation = selectedAddress || defaultAddress;

  const handleOpenManager = () => {
    openAddressManager({ flowContext: "normal" });
  };

  const handleOpenAdd = () => {
    openAddAddress({ flowContext: "normal" });
  };

  if (!activeLocation) {
    // EMPTY STATE: No saved address yet
    return (
      <div
        onClick={handleOpenAdd}
        className={`bg-white border-2 border-dashed border-emerald-200/90 hover:border-emerald-500 hover:bg-emerald-50/40 rounded-2xl p-4 sm:p-5 transition-all cursor-pointer group shadow-2xs ${className}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform shrink-0">
              <MapPin size={20} />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Location Setup
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                  Required
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-emerald-800 transition-colors">
                Add Location
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Set your {roleLabel.toLowerCase()} to activate live mandi rates & pickup logistics
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <Plus size={14} />
              <span>Add</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  // SAVED LOCATION STATE
  return (
    <div
      onClick={handleOpenManager}
      className={`bg-white border border-gray-200/90 hover:border-emerald-400 hover:shadow-xs rounded-2xl p-4 sm:p-5 transition-all cursor-pointer group shadow-2xs ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform shrink-0 mt-0.5">
            <MapPin size={20} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {roleLabel}
              </span>

              {activeLocation.tag && (
                <span className="text-[10px] font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                  {activeLocation.tag}
                </span>
              )}

              {Boolean(activeLocation.is_default) && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Default
                </span>
              )}
            </div>

            {/* Village / Locality prominent */}
            <h4 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-emerald-800 transition-colors truncate mt-0.5">
              {activeLocation.village_locality || activeLocation.name || "Operational Location"}
            </h4>

            {/* District, State • Pincode */}
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {[activeLocation.district, activeLocation.state].filter(Boolean).join(", ")}
              {activeLocation.pincode ? ` • ${activeLocation.pincode}` : ""}
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-1 text-xs font-semibold text-emerald-700 group-hover:text-emerald-800 group-hover:translate-x-0.5 transition-all">
          <span>Change</span>
          <ChevronRight size={15} />
        </div>
      </div>
    </div>
  );
}

export default DashboardLocationCard;
