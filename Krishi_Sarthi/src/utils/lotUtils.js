/**
 * Filter lots eligible for creating a new FPO offer against a specific buyer requirement.
 * 
 * Rules:
 * 1. Lot status MUST be 'aggregated' (NOT 'draft', 'offered', 'contracted', etc.)
 * 2. Crop comparison MUST be robust to capitalization and whitespace (e.g. "coffee", "Coffee", " COFFEE ")
 * 
 * @param {Object} requirement Buyer requirement object
 * @param {Array} lotList Array of FPO lot objects
 * @returns {Array} Filtered list of eligible lots
 */
export const getEligibleLotsForRequirement = (requirement, lotList) => {
  if (!requirement || !Array.isArray(lotList)) return [];

  const requirementCrop = String(requirement.crop_name || requirement.crop || "")
    .trim()
    .toLowerCase();

  if (!requirementCrop) return [];

  return lotList.filter((lot) => {
    // 1. Status Filter: Only lots in 'aggregated' status are eligible for creating a new offer
    const lotStatus = String(lot.status || "").trim().toLowerCase();
    if (lotStatus !== "aggregated") return false;

    // 2. Crop Matching: Robust case-insensitive and trimmed comparison
    const lotCrop = String(lot.crop_name || lot.crop || "")
      .trim()
      .toLowerCase();

    return lotCrop === requirementCrop;
  });
};
