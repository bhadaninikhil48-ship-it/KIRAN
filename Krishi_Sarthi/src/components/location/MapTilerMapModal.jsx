import { useState, useEffect, useRef, useCallback } from "react";
import {
  MapPin,
  CheckCircle2,
  X,
  Navigation,
  Loader2,
  AlertCircle,
} from "lucide-react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import { getMapTilerKey, reverseGeocode } from "../../utils/maptiler";
import { Button } from "../ui/Button";

export function MapTilerMapModal({
  isOpen,
  onClose,
  initialCoordinates,
  onSelectLocation,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Default coordinate: central agricultural zone (Indore / MP)
  const defaultLng = 75.8577;
  const defaultLat = 22.7196;

  const [currentCoords, setCurrentCoords] = useState(() => ({
    longitude: initialCoordinates?.longitude ?? defaultLng,
    latitude: initialCoordinates?.latitude ?? defaultLat,
  }));

  const [geocodedData, setGeocodedData] = useState(null);
  const [geocodingLoading, setGeocodingLoading] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [locatingCurrent, setLocatingCurrent] = useState(false);

  // Position change & reverse geocode
  const handlePositionChange = useCallback(async (lng, lat) => {
    setCurrentCoords({ longitude: lng, latitude: lat });
    setGeocodingLoading(true);
    try {
      const res = await reverseGeocode(lng, lat);
      setGeocodedData(res);
    } catch (err) {
      console.warn("Geocoding failed:", err);
    } finally {
      setGeocodingLoading(false);
    }
  }, []);

  // Initialize Map and Marker when modal opens
  useEffect(() => {
    if (!isOpen) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
      return;
    }

    const apiKey = getMapTilerKey();

    // Give DOM a tick to paint modal container
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (!apiKey) {
        setMapError("MapTiler API key not found in environment. You can still confirm coordinates manually.");
      }

      try {
        if (apiKey) {
          maptilersdk.config.apiKey = apiKey;
        }

        const initialLng = initialCoordinates?.longitude ?? currentCoords.longitude ?? defaultLng;
        const initialLat = initialCoordinates?.latitude ?? currentCoords.latitude ?? defaultLat;

        const map = new maptilersdk.Map({
          container: mapContainerRef.current,
          style: maptilersdk.MapStyle.STREETS,
          center: [initialLng, initialLat],
          zoom: 14,
          navigationControl: "top-right",
        });

        // Add draggable emerald pin
        const marker = new maptilersdk.Marker({
          draggable: true,
          color: "#059669",
        })
          .setLngLat([initialLng, initialLat])
          .addTo(map);

        // Marker drag handler
        marker.on("dragend", () => {
          const lngLat = marker.getLngLat();
          handlePositionChange(lngLat.lng, lngLat.lat);
        });

        // Map click handler moves marker
        map.on("click", (e) => {
          marker.setLngLat(e.lngLat);
          handlePositionChange(e.lngLat.lng, e.lngLat.lat);
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;

        // Trigger initial reverse geocode
        handlePositionChange(initialLng, initialLat);
      } catch (err) {
        console.warn("Map initialization error:", err);
        setMapError("Interactive map preview unavailable. Coordinates can still be selected.");
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isOpen, initialCoordinates, handlePositionChange, currentCoords.longitude, currentCoords.latitude]);

  // Re-center on user's device location
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLocatingCurrent(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocatingCurrent(false);
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo({ center: [longitude, latitude], zoom: 15 });
          markerRef.current.setLngLat([longitude, latitude]);
        }
        handlePositionChange(longitude, latitude);
      },
      (err) => {
        setLocatingCurrent(false);
        console.warn("Geolocation denied or error:", err.message);
        alert("Unable to fetch current location. Please adjust the pin manually on the map.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // User confirms this pinned location
  const handleConfirmPin = () => {
    const payload = {
      latitude: currentCoords.latitude,
      longitude: currentCoords.longitude,
      village_locality: geocodedData?.village_locality || "",
      district: geocodedData?.district || "",
      state: geocodedData?.state || "",
      pincode: geocodedData?.pincode || "",
      landmark: geocodedData?.landmark || "",
      full_address: geocodedData?.full_address || `${currentCoords.latitude.toFixed(5)}, ${currentCoords.longitude.toFixed(5)}`,
    };

    onSelectLocation(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                Select Location on Map
              </h3>
              <p className="text-xs text-gray-500">
                Drag the green marker or click anywhere on the map to pinpoint your farmgate/warehouse
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

        {/* Map Container & Error Warning */}
        <div className="relative flex-1 min-h-[350px] sm:min-h-[420px] bg-gray-100">
          {mapError && (
            <div className="absolute top-3 left-3 right-3 z-10 p-3 bg-amber-50/95 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2 backdrop-blur-xs">
              <AlertCircle size={16} className="shrink-0 text-amber-600" />
              <span>{mapError}</span>
            </div>
          )}

          <div ref={mapContainerRef} className="w-full h-full min-h-[350px] sm:min-h-[420px]" />

          {/* Quick "My GPS Location" Floating Button */}
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={locatingCurrent}
            className="absolute bottom-4 right-4 z-10 px-3 py-2 bg-white/95 hover:bg-white text-emerald-800 border border-gray-200/90 rounded-xl shadow-md text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer hover:shadow-lg disabled:opacity-50"
          >
            {locatingCurrent ? (
              <Loader2 size={15} className="animate-spin text-emerald-600" />
            ) : (
              <Navigation size={15} className="text-emerald-600" />
            )}
            <span>Recenter to Device GPS</span>
          </button>
        </div>

        {/* Live Reverse-Geocoded Location Display */}
        <div className="p-4 sm:p-5 bg-gray-50/90 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-200">
                Selected Point
              </span>
              {geocodingLoading && (
                <span className="flex items-center gap-1 text-[11px] text-gray-500">
                  <Loader2 size={12} className="animate-spin text-emerald-600" />
                  Resolving address...
                </span>
              )}
            </div>

            <h4 className="text-sm sm:text-base font-bold text-gray-900 truncate mt-1">
              {geocodedData?.village_locality || "Pinpointed Location"}
            </h4>

            <p className="text-xs text-gray-600 truncate mt-0.5">
              {geocodedData?.full_address || `${currentCoords.latitude.toFixed(5)}, ${currentCoords.longitude.toFixed(5)}`}
            </p>

            <div className="flex items-center gap-3 text-[11px] text-gray-400 font-mono mt-1">
              <span>Lat: {currentCoords.latitude.toFixed(5)}</span>
              <span>Lon: {currentCoords.longitude.toFixed(5)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs font-medium"
            >
              Cancel
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleConfirmPin}
              icon={CheckCircle2}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
            >
              Select This Address
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapTilerMapModal;
