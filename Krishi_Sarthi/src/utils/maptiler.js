/**
 * MapTiler helper functions for map initialization and reverse geocoding
 * 
 * SECURITY:
 * Never hardcodes or logs the API key.
 * Reads solely from import.meta.env.MY_MAP_API_KEY or import.meta.env.VITE_MY_MAP_API_KEY.
 */

export function getMapTilerKey() {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env.MY_MAP_API_KEY || import.meta.env.VITE_MY_MAP_API_KEY || "";
  }
  return "";
}

/**
 * Reverse geocode coordinates [longitude, latitude] into address parts
 * @param {number} longitude 
 * @param {number} latitude 
 * @returns {Promise<Object>}
 */
export async function reverseGeocode(longitude, latitude) {
  const apiKey = getMapTilerKey();

  if (!apiKey) {
    return {
      success: false,
      error: "MapTiler API key not found. Please enter address manually.",
      latitude,
      longitude,
      village_locality: "",
      district: "",
      state: "",
      pincode: "",
      landmark: "",
      full_address: `Coordinates: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
    };
  }

  try {
    const url = `https://api.maptiler.com/geocoding/${longitude},${latitude}.json?key=${apiKey}&language=en`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Geocoding failed with status: ${response.status}`);
    }

    const data = await response.json();
    const features = data?.features || [];

    if (features.length === 0) {
      return {
        success: true,
        latitude,
        longitude,
        village_locality: "Farmgate Area",
        district: "",
        state: "",
        pincode: "",
        landmark: "",
        full_address: `Location (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`,
      };
    }

    const primaryFeature = features[0];
    const context = primaryFeature?.context || [];

    // Extract address segments by checking MapTiler context types
    let postalCode = "";
    let locality = "";
    let district = "";
    let state = "";
    let country = "";

    for (const item of context) {
      const id = (item.id || "").toLowerCase();
      if (id.startsWith("postal_code") || id.startsWith("postcode")) {
        postalCode = item.text || "";
      } else if (id.startsWith("locality") || id.startsWith("neighborhood") || id.startsWith("subdistrict")) {
        locality = item.text || "";
      } else if (id.startsWith("county") || id.startsWith("municipality") || id.startsWith("district")) {
        district = item.text || "";
      } else if (id.startsWith("region") || id.startsWith("state") || id.startsWith("province")) {
        state = item.text || "";
      } else if (id.startsWith("country")) {
        country = item.text || "";
      }
    }

    // If primary feature is locality or poi, use it
    const primaryText = primaryFeature.text || "";
    const placeType = (primaryFeature.place_type || [])[0] || "";

    if (!locality) {
      locality = primaryText;
    } else if (placeType === "poi" || placeType === "address") {
      locality = `${primaryText}, ${locality}`;
    }

    if (!district && !locality.includes(primaryText)) {
      district = primaryText;
    }

    // Default fallback for state if empty
    if (!state && country === "India") {
      state = "India";
    }

    return {
      success: true,
      latitude,
      longitude,
      village_locality: locality || primaryText || "Farm / Locality",
      landmark: features.length > 1 && features[1]?.text ? features[1].text : "",
      district: district || locality || "",
      state: state || "",
      pincode: postalCode || "",
      full_address: primaryFeature.place_name || [locality, district, state, postalCode].filter(Boolean).join(", "),
    };
  } catch (err) {
    console.warn("Reverse geocoding notice:", err.message);
    return {
      success: false,
      error: err.message,
      latitude,
      longitude,
      village_locality: "",
      district: "",
      state: "",
      pincode: "",
      landmark: "",
      full_address: `Pinned Location (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`,
    };
  }
}
