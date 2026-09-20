import db from "../config/db.js";

export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const [profiles] = await db.query(
            `SELECT
                u.name,
                u.email,
                fp.phone,
                fp.village,
                fp.district,
                fp.state
             FROM users u
             LEFT JOIN farmer_profiles fp
                ON u.id = fp.user_id
             WHERE u.id = ?`,
            [userId]
        );

        if (profiles.length === 0) {
            return res.status(404).json({
                message: "Farmer not found"
            });
        }

        res.status(200).json({
            profile: profiles[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            phone,
            village,
            district,
            state
        } = req.body;

        const [existingProfile] = await db.query(
            "SELECT id FROM farmer_profiles WHERE user_id = ?",
            [userId]
        );

        if (existingProfile.length > 0) {

            await db.query(
                `UPDATE farmer_profiles
                 SET phone = ?, village = ?, district = ?, state = ?
                 WHERE user_id = ?`,
                [phone, village, district, state, userId]
            );

        } else {

            await db.query(
                `INSERT INTO farmer_profiles
                 (user_id, phone, village, district, state)
                 VALUES (?, ?, ?, ?, ?)`,
                [userId, phone, village, district, state]
            );
        }

        res.json({
            message: "Farmer profile saved successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};