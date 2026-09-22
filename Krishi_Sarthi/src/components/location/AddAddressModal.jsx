import { useState, useEffect, useContext } from "react";
import {
  MapPin,
  Navigation,
  Edit3,
  CheckCircle2,
  X,
  AlertCircle,
  Loader2,
  Compass,
  ArrowLeft,
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { useAddresses } from "../../context/AddressContext";
import { MapTilerMapModal } from "./MapTilerMapModal";
import { Button } from "../ui/Button";

export function AddAddressModal({
  isOpen,
  onClose,
  initialMode = null, // 'current' | 'manual' | null
  onSuccess = null,
}) {
  const { user } = useContext(AuthContext) || {};
  const {
    addAddress,
    flowContext,
    onAddressCreatedCallback,
    selectAddress,
  } = useAddresses();

  // Steps: 'choose_method' | 'form'
  const [step, setStep] = useState(() => (initialMode === "manual" ? "form" : "choose_method"));
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [locatingGPS, setLocatingGPS] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  // Form Fields
  const [name, setName] = useState(user?.name || "");
  const [tag, setTag] = useState(
    user?.role === "buyer"
      ? "Central Warehouse"
      : user?.role === "fpo"
      ? "Aggregation Center"
      : "Farm 1"
  );
  const [villageLocality, setVillageLocality] = useState("");
  const [landmark, setLandmark] = useState("");
  const [district, setDistrict] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");
  const [coordinates, setCoordinates] = useState({ latitude: null, longitude: null });
  const [isDefault, setIsDefault] = useState(true);

  // Status states
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const clearAddressFields = () => {
    setVillageLocality("");
    setLandmark("");
    setDistrict("");
    setStateName("");
    setPincode("");
    setCoordinates({ latitude: null, longitude: null });
  };

  // Method 1: Use My Current Location
  const handleUseCurrentLocation = () => {
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser. Please select 'Away From My Location'.");
      return;
    }

    setLocatingGPS(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocatingGPS(false);
        const { latitude, longitude } = pos.coords;
        setCoordinates({ latitude, longitude });

        // Open MapTiler interactive map centered on current location
        setIsMapModalOpen(true);
      },
      (err) => {
        setLocatingGPS(false);
        console.warn("Location permission/acquisition error:", err);
        if (err.code === 1) {
          // PERMISSION_DENIED
          setGpsError("Location permission was denied. You can allow location access in your browser or choose 'Away From My Location' below.");
        } else if (err.code === 2) {
          // POSITION_UNAVAILABLE
          setGpsError("Location is currently unavailable on your device. Please enter your address details manually.");
        } else {
          setGpsError("Location request timed out. Please try again or enter details manually.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // Trigger current location lookup if requested via initialMode
  useEffect(() => {
    if (isOpen && initialMode === "current") {
      const timer = setTimeout(() => {
        handleUseCurrentLocation();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialMode]);

  // Callback when user confirms pinpoint on MapTiler map
  const handleMapLocationSelected = (locationData) => {
    setIsMapModalOpen(false);

    // Prefill form from reverse geocoded data
    setVillageLocality(locationData.village_locality || "");
    setDistrict(locationData.district || "");
    setStateName(locationData.state || "");
    setPincode(locationData.pincode || "");
    setLandmark(locationData.landmark || "");
    setCoordinates({
      latitude: locationData.latitude,
      longitude: locationData.longitude,
    });

    // Advance to confirmation form
    setStep("form");
  };

  // Method 2: Away From My Location (Manual Form)
  const handleAwayFromLocation = () => {
    setGpsError(null);
    clearAddressFields();
    setStep("form");
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!villageLocality.trim() || !district.trim() || !stateName.trim()) {
      setErrorMsg("Please fill in Village/Locality, District, and State.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: name.trim() || user?.name || "Authorized Contact",
        tag: tag.trim() || "Primary Location",
        village_locality: villageLocality.trim(),
        landmark: landmark.trim() || null,
        district: district.trim(),
        state: stateName.trim(),
        pincode: pincode.trim() || null,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        is_default: isDefault,
      };

      const createdAddress = await addAddress(payload);

      setSuccessMsg("Address added successfully");

      // Auto-select the newly created address
      if (createdAddress) {
        selectAddress(createdAddress.id);
      }

      // Execute custom callback if passed
      const activeCallback = onSuccess || onAddressCreatedCallback;
      if (activeCallback && createdAddress) {
        activeCallback(createdAddress);
      }

      // Brief pause to show success message before closing modal
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      console.error("Address save failure:", err);
      setErrorMsg(err.message || "Failed to save address. Please verify your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
        <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {step === "form" && (
                <button
                  type="button"
                  onClick={() => setStep("choose_method")}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer mr-1"
                  title="Back to options"
                >
                  <ArrowLeft size={18} />
                </button>
              )}
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                <MapPin size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 leading-tight">
                  {step === "choose_method" ? "Add New Address" : "Confirm Address Details"}
                </h3>
                <p className="text-xs text-gray-500">
                  {flowContext === "sell-new-crop"
                    ? "Add farmgate pickup address for this crop lot"
                    : "Add location for mandi intelligence & contracts"}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="p-4 mx-6 mt-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-semibold animate-fadeIn">
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-4 mx-6 mt-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-xs sm:text-sm animate-fadeIn">
              <AlertCircle size={18} className="text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Step 1: Choose Method */}
          {step === "choose_method" && (
            <div className="p-6 space-y-4">
              {gpsError && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
                  <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <span>{gpsError}</span>
                </div>
              )}

              <p className="text-xs sm:text-sm text-gray-600 font-medium">
                How would you like to set your location?
              </p>

              <div className="space-y-3">
                {/* Option A: Use My Current Location */}
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={locatingGPS}
                  className="w-full text-left p-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50 hover:border-emerald-500 transition-all flex items-start gap-3.5 group cursor-pointer shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    {locatingGPS ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <Navigation size={20} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-gray-900 group-hover:text-emerald-900 transition-colors">
                        Use My Current Location
                      </h4>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                        GPS & MapTiler
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      Detects your device location, shows your farmgate pin on MapTiler, and auto-fills village, district, and pincode.
                    </p>
                  </div>
                </button>

                {/* Option B: Away From My Location */}
                <button
                  type="button"
                  onClick={handleAwayFromLocation}
                  className="w-full text-left p-4 rounded-2xl border border-gray-200 bg-white hover:border-emerald-400 hover:bg-gray-50/60 transition-all flex items-start gap-3.5 group cursor-pointer shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-all">
                    <Edit3 size={19} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-gray-900 group-hover:text-emerald-900 transition-colors">
                      Away From My Location
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      Enter village, district, state, and pincode manually for remote farmland, secondary plots, or buyer warehouses.
                    </p>
                  </div>
                </button>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-gray-500 hover:text-gray-700 font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Confirmation & Edit Form */}
          {step === "form" && (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Coordinates Chip if present */}
              {coordinates.latitude && coordinates.longitude && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Compass size={15} className="text-emerald-600 shrink-0" />
                    <span>GPS Coordinates Linked</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMapModalOpen(true)}
                    className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Adjust on Map
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Contact Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Contact Person / Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Patil"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>

                {/* Location Tag */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Location Label / Tag
                  </label>
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="e.g. Farm 1, Main Plot, Central Hub"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Village / Locality */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Village / Locality / Tehsil <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={villageLocality}
                  onChange={(e) => setVillageLocality(e.target.value)}
                  placeholder="e.g. Makhmalabad Village or Mandi Road"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>

              {/* Landmark */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near Kisan Seva Kendra or Gram Panchayat"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* District */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    District <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Nashik"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    placeholder="e.g. Maharashtra"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="e.g. 422003"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Default Address Checkbox */}
              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="isDefaultCheckbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                />
                <label
                  htmlFor="isDefaultCheckbox"
                  className="text-xs text-gray-700 font-medium cursor-pointer"
                >
                  Set as primary default address for mandi discovery & digital contracts
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  disabled={submitting}
                  className="text-xs font-medium"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin mr-1.5" />
                      Saving Address...
                    </>
                  ) : (
                    "Confirm Address"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* MapTiler Pinpoint Modal */}
      {isMapModalOpen && (
        <MapTilerMapModal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          initialCoordinates={coordinates}
          onSelectLocation={handleMapLocationSelected}
        />
      )}
    </>
  );
}

export default AddAddressModal;
