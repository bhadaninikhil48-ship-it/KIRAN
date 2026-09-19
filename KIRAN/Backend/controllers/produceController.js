import db from "../config/db.js";

export const addProduce = async (req, res) => {
    try {
        const farmerId = req.user.id;

        const {
            crop_name,
            quantity,
            unit,
            quality_grade,
            expected_harvest_date,
            available_from,
            location
        } = req.body;

        if (!crop_name || !quantity) {
            return res.status(400).json({
                message: "Crop name and quantity are required"
            });
        }

        const [farmer] = await db.query(
            "SELECT id FROM farmer_profiles WHERE user_id = ?",
            [farmerId]
        );

        if (farmer.length === 0) {
            return res.status(404).json({
                message: "Farmer profile not found"
            });
        }

        const farmerProfileId = farmer[0].id;

        const [result] = await db.query(
            `INSERT INTO produce
            (farmer_id, crop_name, quantity, unit, quality_grade,
             expected_harvest_date, available_from, location)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                farmerProfileId,
                crop_name,
                quantity,
                unit || "kg",
                quality_grade || null,
                expected_harvest_date || null,
                available_from || null,
                location || null
            ]
        );

        res.status(201).json({
            message: "Produce added successfully",
            produceId: result.insertId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

export const getMyProduce = async (req, res) => {
    try {
        const userId = req.user.id;

        const [farmer] = await db.query(
            "SELECT id FROM farmer_profiles WHERE user_id = ?",
            [userId]
        );

        if (farmer.length === 0) {
            return res.status(404).json({
                message: "Farmer profile not found"
            });
        }

        const farmerProfileId = farmer[0].id;

        const [produce] = await db.query(
            "SELECT * FROM produce WHERE farmer_id = ? ORDER BY created_at DESC",
            [farmerProfileId]
        );

        res.status(200).json({
            produce
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

export const updateProduce = async (req, res) => {
    try {
        const userId = req.user.id;
        const produceId = req.params.id;

        const {
            crop_name,
            quantity,
            unit,
            quality_grade,
            expected_harvest_date,
            available_from,
            location
        } = req.body;

        const [farmer] = await db.query(
            "SELECT id FROM farmer_profiles WHERE user_id = ?",
            [userId]
        );

        if (farmer.length === 0) {
            return res.status(404).json({
                message: "Farmer profile not found"
            });
        }

        const farmerProfileId = farmer[0].id;

        const [result] = await db.query(
            `UPDATE produce
             SET crop_name = ?,
                 quantity = ?,
                 unit = ?,
                 quality_grade = ?,
                 expected_harvest_date = ?,
                 available_from = ?,
                 location = ?
             WHERE id = ? AND farmer_id = ?`,
            [
                crop_name,
                quantity,
                unit,
                quality_grade || null,
                expected_harvest_date || null,
                available_from || null,
                location || null,
                produceId,
                farmerProfileId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Produce not found or access denied"
            });
        }

        res.status(200).json({
            message: "Produce updated successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

export const deleteProduce = async (req, res) => {
    try {
        const userId = req.user.id;
        const produceId = req.params.id;

        const [farmer] = await db.query(
            "SELECT id FROM farmer_profiles WHERE user_id = ?",
            [userId]
        );

        if (farmer.length === 0) {
            return res.status(404).json({
                message: "Farmer profile not found"
            });
        }

        const farmerProfileId = farmer[0].id;

        const [result] = await db.query(
            "DELETE FROM produce WHERE id = ? AND farmer_id = ?",
            [produceId, farmerProfileId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Produce not found or access denied"
            });
        }

        res.status(200).json({
            message: "Produce deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

export const getProduceStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const [farmer] = await db.query(
            "SELECT id FROM farmer_profiles WHERE user_id = ?",
            [userId]
        );

        if (farmer.length === 0) {
            return res.status(404).json({
                message: "Farmer profile not found"
            });
        }

        const farmerProfileId = farmer[0].id;

        const [stats] = await db.query(
            `SELECT
                COUNT(*) AS total,
                SUM(status = 'available') AS available,
                SUM(status = 'sold') AS sold
             FROM produce
             WHERE farmer_id = ?`,
            [farmerProfileId]
        );

        res.status(200).json({
            total: stats[0].total,
            available: stats[0].available || 0,
            sold: stats[0].sold || 0
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};