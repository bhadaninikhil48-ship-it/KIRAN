import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { updateProfile } from "../controllers/farmerController.js";

const router = express.Router();

router.put(
    "/profile",
    protect,
    allowRoles("farmer"),
    updateProfile
);

export default router;