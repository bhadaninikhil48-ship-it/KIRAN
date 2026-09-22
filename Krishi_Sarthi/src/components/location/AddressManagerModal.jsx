import { useContext } from "react";
import {
  MapPin,
  Plus,
  Trash2,
  Star,
  X,
  Compass,
  Check,
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { useAddresses } from "../../context/AddressContext";
import { Button } from "../ui/Button";

export function AddressManagerModal({
  isOpen,
  onClose,
  onSelectAddress,
}) {
  const { user } = useContext(AuthContext) || {};
  const {
    addresses,
    selectedAddress,
    selectAddress,
    setAsDefault,
    removeAddress,
    openAddAddress,
    flowContext,
  } = useAddresses();

  if (!isOpen) return null;

  const handleSelect = (addr) => {
    selectAddress(addr.id);
    if (onSelectAddress) {
      onSelectAddress(addr);
    }
    onClose();
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to remove this saved address?")) {
      try {
        await removeAddress(id);
      } catch (err) {
        alert("Failed to delete address: " + err.message);
      }
    }
  };

  const handleSetDefault = async (e, id) => {
    e.stopPropagation();
    try {
      await setAsDefault(id);
    } catch (err) {
      alert("Failed to set default: " + err.message);
    }
  };

  const handleAddNew = () => {
    onClose();
    openAddAddress({ flowContext });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                {user?.role === "buyer"
                  ? "Select Delivery / Warehouse Address"
                  : user?.role === "fpo"
                  ? "Select Aggregation Center Location"
                  : "Select Farmgate Pickup Address"}
              </h3>
              <p className="text-xs text-gray-500">
                Choose an active address or add a new operational location
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Saved Addresses List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3.5 divide-y divide-gray-50">
          {addresses.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <MapPin size={26} />
              </div>
              <h4 className="text-base font-bold text-gray-900">
                No saved addresses yet
              </h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-5">
                Add your farmgate location or storage warehouse to streamline harvest lot creation, mandi price benchmarks, and buyer contracts.
              </p>
              <Button
                type="button"
                size="sm"
                onClick={handleAddNew}
                icon={Plus}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                + Add New Address
              </Button>
            </div>
          ) : (
            addresses.map((addr) => {
              const isSelected = selectedAddress && String(selectedAddress.id) === String(addr.id);
              const isPrimaryDefault = Boolean(addr.is_default);

              return (
                <div
                  key={addr.id}
                  onClick={() => handleSelect(addr)}
                  className={`pt-3.5 first:pt-0 cursor-pointer group`}
                >
                  <div
                    className={`p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-500"
                        : "border-gray-200/90 bg-white hover:border-emerald-300 hover:bg-gray-50/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {/* Radio selection circle */}
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                            isSelected
                              ? "border-emerald-600 bg-emerald-600 text-white"
                              : "border-gray-300 bg-white group-hover:border-emerald-400"
                          }`}
                        >
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>

                        <div>
                          {/* Tag & Default Badge */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-gray-900">
                              {addr.tag || "Location"}
                            </span>

                            {isPrimaryDefault && (
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                                Default
                              </span>
                            )}

                            {addr.latitude && addr.longitude && (
                              <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1">
                                <Compass size={11} className="text-emerald-600" />
                                GPS Linked
                              </span>
                            )}
                          </div>

                          {/* Contact Name */}
                          <p className="text-xs font-semibold text-gray-700 mt-1">
                            {addr.name}
                          </p>

                          {/* Village / Locality & District */}
                          <h4 className="text-sm font-bold text-gray-900 mt-0.5">
                            {addr.village_locality}
                          </h4>

                          {/* Full Address details */}
                          <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                            {[
                              addr.landmark,
                              addr.district,
                              addr.state,
                              addr.pincode ? `PIN ${addr.pincode}` : null,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        </div>
                      </div>

                      {/* Delete action */}
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, addr.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Delete address"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Bottom action row */}
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      {!isPrimaryDefault ? (
                        <button
                          type="button"
                          onClick={(e) => handleSetDefault(e, addr.id)}
                          className="text-gray-500 hover:text-emerald-700 font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <Star size={13} />
                          <span>Set as Default</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-700">
                          Primary Default Address
                        </span>
                      )}

                      <Button
                        type="button"
                        size="xs"
                        variant={isSelected ? "primary" : "outline"}
                        className={`text-xs ${
                          isSelected
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                            : "border-gray-200 text-gray-700 hover:border-emerald-300"
                        }`}
                        onClick={() => handleSelect(addr)}
                      >
                        {isSelected ? "Selected" : "Select This Address"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Add New Address button */}
        {addresses.length > 0 && (
          <div className="p-4 px-6 bg-gray-50/90 border-t border-gray-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleAddNew}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={16} />
              <span>+ Add New Address</span>
            </button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs font-medium"
            >
              Done
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddressManagerModal;
