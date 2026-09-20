import express from "express";
import db from "../config/db.js";
import { register, login } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/me", protect, async (req, res) => {
    try {
        const [users] = await db.query(
            "SELECT id, name, email, role FROM users WHERE id = ?",
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            message: "You are authenticated",
            user: users[0]
        });

    } catch (error) {
        console.error("Get current user error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

export default router;


