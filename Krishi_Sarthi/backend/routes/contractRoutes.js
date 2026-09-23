import express from "express";

import { getBuyerContracts, getFarmerContracts, getFpoContracts } from "../controllers/contractController.js";

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

router.get(
    "/fpo",
    protect,
    allowRoles("fpo"),
    getFpoContracts
);

router.get(
    "/",
    protect,
    allowRoles("buyer"),
    getBuyerContracts
);

export default router;