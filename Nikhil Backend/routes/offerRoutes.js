import express from "express";

import { createOffer, getBuyerOffers, updateOfferStatus } from "../controllers/offerController.js";

import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
    "/",
    protect,
    allowRoles("farmer"),
    createOffer
);

router.get(
    "/buyer",
    protect,
    allowRoles("buyer"),
    getBuyerOffers
);

router.patch(
  "/:id/status",
  protect,
  allowRoles("buyer"),
  updateOfferStatus
);

export default router;