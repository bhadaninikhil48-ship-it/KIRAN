import db from "../config/db.js";

export const createNegotiation = async (req, res) => {
    try {
        const userId = req.user.id;
        const { offerId, price, quantity, message } = req.body;

        if (!offerId || !price || !quantity) {
            return res.status(400).json({
                message: "Offer ID, price and quantity are required"
            });
        }

        const [offers] = await db.query(
            `SELECT
                offers.id,
                offers.status,
                offers.farmer_id,
                buyer_requirements.buyer_id
             FROM offers
             INNER JOIN buyer_requirements
                ON offers.requirement_id = buyer_requirements.id
             INNER JOIN farmer_profiles
                ON offers.farmer_id = farmer_profiles.id
             WHERE offers.id = ?`,
            [offerId]
        );

        if (offers.length === 0) {
            return res.status(404).json({
                message: "Offer not found"
            });
        }

        const offer = offers[0];

        if (offer.status !== "pending") {
            return res.status(400).json({
                message: "Negotiation is only available for pending offers"
            });
        }

        let senderRole;

        if (req.user.role === "buyer" && offer.buyer_id === userId) {
            senderRole = "buyer";
        } else if (req.user.role === "farmer") {

            const [farmer] = await db.query(
                `SELECT id
                 FROM farmer_profiles
                 WHERE user_id = ?`,
                [userId]
            );

            if (
                farmer.length === 0 ||
                farmer[0].id !== offer.farmer_id
            ) {
                return res.status(403).json({
                    message: "You are not authorized to negotiate this offer"
                });
            }

            senderRole = "farmer";

        } else {
            return res.status(403).json({
                message: "You are not authorized to negotiate this offer"
            });
        }

        await db.query(
            `INSERT INTO offer_negotiations (
                offer_id,
                sender_id,
                sender_role,
                price,
                quantity,
                message
            )
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                offerId,
                userId,
                senderRole,
                price,
                quantity,
                message || null
            ]
        );

        res.status(201).json({
            message: "Negotiation submitted successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

export const getNegotiationHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { offerId } = req.params;

        const [offers] = await db.query(
            `SELECT
                offers.id,
                offers.farmer_id,
                buyer_requirements.buyer_id
             FROM offers
             INNER JOIN buyer_requirements
                ON offers.requirement_id = buyer_requirements.id
             WHERE offers.id = ?`,
            [offerId]
        );

        if (offers.length === 0) {
            return res.status(404).json({
                message: "Offer not found"
            });
        }

        const offer = offers[0];

        let authorized = false;

        if (req.user.role === "buyer") {
            authorized = offer.buyer_id === userId;
        }

        if (req.user.role === "farmer") {
            const [farmer] = await db.query(
                `SELECT id
                 FROM farmer_profiles
                 WHERE user_id = ?`,
                [userId]
            );

            if (
                farmer.length > 0 &&
                farmer[0].id === offer.farmer_id
            ) {
                authorized = true;
            }
        }

        if (!authorized) {
            return res.status(403).json({
                message: "You are not authorized to view this negotiation"
            });
        }

        const [negotiations] = await db.query(
            `SELECT
                id,
                offer_id,
                sender_id,
                sender_role,
                price,
                quantity,
                message,
                created_at
             FROM offer_negotiations
             WHERE offer_id = ?
             ORDER BY created_at ASC`,
            [offerId]
        );

        res.status(200).json({
            negotiations
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};