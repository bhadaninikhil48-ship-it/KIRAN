import express from "express";
import { addProduce, getMyProduce, updateProduce, deleteProduce, getProduceStats } from "../controllers/produceController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
    "/",
    protect,
    allowRoles("farmer"),
    addProduce
);

router.get(
    "/my",
    protect,
    allowRoles("farmer"),
    getMyProduce
);

router.put(
    "/:id",
    protect,
    allowRoles("farmer"),
    updateProduce
);

router.delete(
    "/:id",
    protect,
    allowRoles("farmer"),
    deleteProduce
);

router.get(
    "/stats",
    protect,
    allowRoles("farmer"),
    getProduceStats
);

export default router;