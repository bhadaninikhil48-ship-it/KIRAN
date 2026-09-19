import express from "express";

import { getBuyerContracts, getFarmerContracts } from "../controllers/contractController.js";

import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
    "/buyer",
    protect,
    allowRoles("buyer"),
    getBuyerContracts
);

router.get(
    "/farmer",
    protect,
    allowRoles("farmer"),
    getFarmerContracts
);

export default router;