import express from "express";

import { createBuyerRequirement, getMyRequirements, getOpenRequirements, getBuyerProfileById } from "../controllers/buyerController.js";

import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
    "/requirements",
    protect,
    allowRoles("buyer"),
    createBuyerRequirement
);

router.get(
    "/requirements/my",
    protect,
    allowRoles("buyer"),
    getMyRequirements
);

router.get(
    "/requirements/open",
    protect,
    allowRoles("farmer"),
    getOpenRequirements
);

router.get(
    "/profile/:id",
    protect,
    getBuyerProfileById
);

export default router;