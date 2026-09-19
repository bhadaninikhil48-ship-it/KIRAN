import db from "../config/db.js";

export const getBuyerContracts = async (req, res) => {
    try {
        const buyerId = req.user.id;

        const [contracts] = await db.query(
            `SELECT
                id,
                offer_id,
                requirement_id,
                farmer_id,
                buyer_id,
                crop_name,
                quantity,
                unit,
                agreed_price,
                total_amount,
                quality_grade,
                delivery_location,
                required_by,
                status,
                created_at
             FROM contracts
             WHERE buyer_id = ?
             ORDER BY created_at DESC`,
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