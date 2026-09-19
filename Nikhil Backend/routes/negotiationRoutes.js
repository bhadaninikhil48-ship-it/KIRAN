import express from "express";

import { createNegotiation,getNegotiationHistory } from "../controllers/negotiationController.js";

import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
    "/",
    protect,
    allowRoles("farmer", "buyer"),
    createNegotiation
);


router.get(
    "/:offerId",
    protect,
    allowRoles("farmer", "buyer"),
    getNegotiationHistory
);


export default router;