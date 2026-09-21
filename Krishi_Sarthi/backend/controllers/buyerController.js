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
                br.id,
                br.buyer_id,
                br.crop_name,
                br.quantity,
                br.unit,
                br.quality_grade,
                br.max_price,
                br.required_by,
                br.location,
                br.status,
                br.created_at,
                u.name AS buyer_name,
                u.email AS buyer_email,
                u.created_at AS buyer_since
            FROM buyer_requirements br
            LEFT JOIN users u ON br.buyer_id = u.id
            WHERE br.status = 'open'
        `;

        const params = [];

        if (crop) {
            query += ` AND br.crop_name = ?`;
            params.push(crop);
        }

        query += ` ORDER BY br.created_at DESC`;

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

export const getBuyerProfileById = async (req, res) => {
    try {
        const { id } = req.params;

        const [users] = await db.query(
            `SELECT id, name, email, role, created_at FROM users WHERE id = ?`,
            [id]
        );

        if (!users || users.length === 0) {
            return res.status(404).json({ message: "Buyer not found" });
        }

        const buyer = users[0];

        // Fetch buyer's actual contracts from MySQL contracts table
        const [contracts] = await db.query(
            `SELECT crop_name, quantity, unit, agreed_price, total_amount, delivery_location, status, created_at 
             FROM contracts 
             WHERE buyer_id = ? 
             ORDER BY created_at DESC 
             LIMIT 5`,
            [id]
        );

        const [countRes] = await db.query(
            `SELECT COUNT(*) as completed_count FROM contracts WHERE buyer_id = ? AND status = 'completed'`,
            [id]
        );

        const completedCount = countRes[0]?.completed_count !== undefined 
            ? countRes[0].completed_count 
            : contracts.length;

        res.status(200).json({
            buyer: {
                id: buyer.id,
                name: buyer.name,
                email: buyer.email,
                role: buyer.role,
                since: buyer.created_at,
                completedPurchases: completedCount,
                recentPurchases: contracts.map(c => ({
                    crop: c.crop_name,
                    qty: `${c.quantity} ${c.unit}`,
                    date: c.created_at ? new Date(c.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : null
                }))
            }
        });
    } catch (error) {
        console.error("Failed to fetch buyer profile:", error);
        res.status(500).json({ message: "Server error" });
    }
};