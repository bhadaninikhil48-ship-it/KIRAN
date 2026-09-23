import db from "../config/db.js";

export const getBuyerContracts = async (req, res) => {
    try {
        const buyerId = req.user.id;

        const [contracts] = await db.query(
            `SELECT
                c.id,
                c.offer_id,
                c.requirement_id,
                c.farmer_id,
                c.fpo_id,
                c.fpo_lot_id,
                c.seller_type,
                c.buyer_id,
                c.crop_name,
                c.quantity,
                c.unit,
                c.agreed_price,
                c.total_amount,
                c.quality_grade,
                c.delivery_location,
                c.required_by,
                c.status,
                c.created_at,
                COALESCE(u.name, fp.fpo_name) AS seller_name,
                f.phone AS farmer_phone,
                fp.fpo_name,
                fp.contact_person AS fpo_contact_person,
                fp.phone AS fpo_phone,
                fl.lot_number
             FROM contracts c
             LEFT JOIN farmer_profiles f ON c.farmer_id = f.id
             LEFT JOIN users u ON f.user_id = u.id
             LEFT JOIN fpo_profiles fp ON c.fpo_id = fp.id
             LEFT JOIN fpo_lots fl ON c.fpo_lot_id = fl.id
             WHERE c.buyer_id = ?
             ORDER BY c.created_at DESC`,
            [buyerId]
        );

        res.status(200).json({
            contracts
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

export const getFpoContracts = async (req, res) => {
    try {
        const userId = req.user.id;

        const [fpoProfiles] = await db.query(
            "SELECT id FROM fpo_profiles WHERE user_id = ?",
            [userId]
        );

        if (fpoProfiles.length === 0) {
            return res.status(404).json({
                message: "FPO profile not found"
            });
        }

        const fpoId = fpoProfiles[0].id;

        const [contracts] = await db.query(
            `SELECT
                c.id,
                c.offer_id,
                c.requirement_id,
                c.fpo_id,
                c.fpo_lot_id,
                c.seller_type,
                c.buyer_id,
                c.crop_name,
                c.quantity,
                c.unit,
                c.agreed_price,
                c.total_amount,
                c.quality_grade,
                c.delivery_location,
                c.required_by,
                c.status,
                c.created_at,
                u.name AS buyer_name,
                u.email AS buyer_email,
                fl.lot_number,
                fl.aggregation_center,
                br.location AS buyer_location
             FROM contracts c
             JOIN users u ON c.buyer_id = u.id
             LEFT JOIN fpo_lots fl ON c.fpo_lot_id = fl.id
             LEFT JOIN buyer_requirements br ON c.requirement_id = br.id
             WHERE c.seller_type = 'fpo' AND c.fpo_id = ?
             ORDER BY c.created_at DESC`,
            [fpoId]
        );

        res.status(200).json({
            contracts
        });

    } catch (error) {
        console.error("Error in getFpoContracts:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

export const getFarmerContracts = async (req, res) => {
    try {
        const farmerUserId = req.user.id;

        const [contracts] = await db.query(
            `SELECT
                contracts.id,
                contracts.offer_id,
                contracts.requirement_id,
                contracts.farmer_id,
                contracts.buyer_id,
                contracts.crop_name,
                contracts.quantity,
                contracts.unit,
                contracts.agreed_price,
                contracts.total_amount,
                contracts.quality_grade,
                contracts.delivery_location,
                contracts.required_by,
                contracts.status,
                contracts.created_at,
                users.name AS buyer_name
             FROM contracts
             INNER JOIN users
                ON contracts.buyer_id = users.id
             INNER JOIN farmer_profiles
                ON contracts.farmer_id = farmer_profiles.id
             WHERE farmer_profiles.user_id = ?
             ORDER BY contracts.created_at DESC`,
            [farmerUserId]
        );

        res.status(200).json({
            contracts
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};