import express from "express";
import {
    getProfile,
    createProfile,
    updateProfile,
    getMembers,
    addMember,
    updateMember,
    deleteMember,
    searchFarmers,
    // Phase 2B: Lot and produce aggregation controllers
    getLots,
    createLot,
    getLotById,
    updateLot,
    deleteLot,
    getLotItems,
    addLotItem,
    removeLotItem,
    getAvailableMemberProduce,
    // Phase 2C-A: FPO Marketplace Participation
    getMarketplaceRequirements,
    createMarketplaceOffer,
    getMyMarketplaceOffers,
    // Phase 2C-B2: FPO Contracts
    getFpoContracts
} from "../controllers/fpoController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// ----------------------------------------------------------------------------
// FPO Profile Routes (Restricted to role = 'fpo')
// ----------------------------------------------------------------------------
router.get("/profile", protect, allowRoles("fpo"), getProfile);
router.post("/profile", protect, allowRoles("fpo"), createProfile);
router.put("/profile", protect, allowRoles("fpo"), updateProfile);

// ----------------------------------------------------------------------------
// FPO Member Management Routes (Restricted to role = 'fpo')
// ----------------------------------------------------------------------------
router.get("/members", protect, allowRoles("fpo"), getMembers);
router.post("/members", protect, allowRoles("fpo"), addMember);
router.put("/members/:id", protect, allowRoles("fpo"), updateMember);
router.delete("/members/:id", protect, allowRoles("fpo"), deleteMember);

// Helper Search Route for Enrolling Registered Farmers
router.get("/farmers/search", protect, allowRoles("fpo"), searchFarmers);

// ----------------------------------------------------------------------------
// Phase 2B: FPO Lot Management Routes (Restricted to role = 'fpo')
// ----------------------------------------------------------------------------
router.get("/lots", protect, allowRoles("fpo"), getLots);
router.post("/lots", protect, allowRoles("fpo"), createLot);
router.get("/lots/:id", protect, allowRoles("fpo"), getLotById);
router.put("/lots/:id", protect, allowRoles("fpo"), updateLot);
router.delete("/lots/:id", protect, allowRoles("fpo"), deleteLot);

// ----------------------------------------------------------------------------
// Phase 2B: Lot Contribution Items & Double-Allocation Guarded Endpoints
// ----------------------------------------------------------------------------
router.get("/lots/:lotId/items", protect, allowRoles("fpo"), getLotItems);
router.post("/lots/:lotId/items", protect, allowRoles("fpo"), addLotItem);
router.delete("/lots/:lotId/items/:itemId", protect, allowRoles("fpo"), removeLotItem);

// Available produce listing for FPO members
router.get("/produce/available", protect, allowRoles("fpo"), getAvailableMemberProduce);

// ----------------------------------------------------------------------------
// Phase 2C-A: FPO Marketplace Participation (Buyer Requirements & Bidding)
// ----------------------------------------------------------------------------
router.get("/marketplace/requirements", protect, allowRoles("fpo"), getMarketplaceRequirements);
router.post("/marketplace/offers", protect, allowRoles("fpo"), createMarketplaceOffer);
router.get("/marketplace/offers", protect, allowRoles("fpo"), getMyMarketplaceOffers);

// ----------------------------------------------------------------------------
// Phase 2C-B2: FPO Contracts
// ----------------------------------------------------------------------------
router.get("/contracts", protect, allowRoles("fpo"), getFpoContracts);

export default router;
