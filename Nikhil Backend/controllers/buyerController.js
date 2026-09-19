import db from "../config/db.js";

export const createBuyerRequirement = async (req, res) => {
    try {

        const buyerId = req.user.id;

        const {
            crop_name,
            quantity,
            unit,
            quality_grade,
            max_price,
            required_by,
            location
        } = req.body;

        if (!crop_name || !quantity) {
            return res.status(400).json({
                message: "Crop name and quantity are required"
            });
        }

        const [result] = await db.query(
            `INSERT INTO buyer_requirements
            (
                buyer_id,
                crop_name,
                quantity,
                unit,
                quality_grade,
                max_price,
                required_by,
                location
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                buyerId,
                crop_name,
                quantity,
                unit || "kg",
                quality_grade || null,
                max_price || null,
                required_by || null,
                location || null
            ]
        );

        res.status(201).json({
            message: "Buyer requirement created successfully",
            requirementId: result.insertId
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

export const getMyRequirements = async (req, res) => {
    try {

        const buyerId = req.user.id;

        const [requirements] = await db.query(
            `SELECT *
             FROM buyer_requirements
             WHERE buyer_id = ?
             ORDER BY created_at DESC`,
            [buyerId]
        );

        res.status(200).json({
            requirements
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

export const getOpenRequirements = async (req, res) => {
    try {

        const { crop } = req.query;

        let query = `
            SELECT
                id,
                crop_name,
                quantity,
                unit,
                quality_grade,
                max_price,
                required_by,
                location,
                status,
                created_at
            FROM buyer_requirements
            WHERE status = 'open'
        `;

        const params = [];

        if (crop) {
            query += ` AND crop_name = ?`;
            params.push(crop);
        }

        query += ` ORDER BY created_at DESC`;

        const [requirements] = await db.query(
            query,
            params
        );

        res.status(200).json({
            requirements
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};