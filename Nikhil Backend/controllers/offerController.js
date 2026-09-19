import db from "../config/db.js";

export const createOffer = async (req, res) => {
    try {

        const userId = req.user.id;

        const {
            requirement_id,
            offer_price,
            quantity,
            message
        } = req.body;

        if (!requirement_id || !offer_price || !quantity) {
            return res.status(400).json({
                message: "Requirement, offer price and quantity are required"
            });
        }

        // Get farmer profile
        const [farmerRows] = await db.query(
            `SELECT id
             FROM farmer_profiles
             WHERE user_id = ?`,
            [userId]
        );

        if (farmerRows.length === 0) {
            return res.status(404).json({
                message: "Farmer profile not found"
            });
        }

        const farmerId = farmerRows[0].id;

        // Check buyer requirement
        const [requirements] = await db.query(
            `SELECT id, status
             FROM buyer_requirements
             WHERE id = ?`,
            [requirement_id]
        );

        if (requirements.length === 0) {
            return res.status(404).json({
                message: "Buyer requirement not found"
            });
        }

        if (requirements[0].status !== "open") {
            return res.status(400).json({
                message: "This buyer requirement is no longer open"
            });
        }

        // Create offer
        const [result] = await db.query(
            `INSERT INTO offers
            (
                requirement_id,
                farmer_id,
                offer_price,
                quantity,
                message
            )
            VALUES (?, ?, ?, ?, ?)`,
            [
                requirement_id,
                farmerId,
                offer_price,
                quantity,
                message || null
            ]
        );

        res.status(201).json({
            message: "Offer created successfully",
            offerId: result.insertId
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

export const getBuyerOffers = async (req, res) => {
    try {

        const buyerId = req.user.id;

        const [offers] = await db.query(
            `SELECT
                offers.id,
                offers.requirement_id,
                offers.offer_price,
                offers.quantity,
                offers.message,
                offers.status,
                offers.created_at,
                buyer_requirements.crop_name,
                buyer_requirements.unit,
                buyer_requirements.quality_grade,
                buyer_requirements.max_price,
                buyer_requirements.location,
                users.name AS farmer_name
             FROM offers
             INNER JOIN buyer_requirements
                ON offers.requirement_id = buyer_requirements.id
             INNER JOIN farmer_profiles
                ON offers.farmer_id = farmer_profiles.id
             INNER JOIN users
                ON farmer_profiles.user_id = users.id
             WHERE buyer_requirements.buyer_id = ?
             ORDER BY offers.created_at DESC`,
            [buyerId]
        );

        res.status(200).json({
            offers
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

export const updateOfferStatus = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const buyerId = req.user.id;
        const { id } = req.params;
        const { status } = req.body;

        if (!["accepted", "rejected"].includes(status)) {
            return res.status(400).json({
                message: "Invalid offer status"
            });
        }

        await connection.beginTransaction();

        const [offers] = await connection.query(
            `SELECT
                offers.id,
                offers.status,
                offers.offer_price,
                offers.quantity,
                offers.farmer_id,
                buyer_requirements.id AS requirement_id,
                buyer_requirements.buyer_id,
                buyer_requirements.crop_name,
                buyer_requirements.unit,
                buyer_requirements.quality_grade,
                buyer_requirements.location,
                buyer_requirements.required_by
             FROM offers
             INNER JOIN buyer_requirements
                ON offers.requirement_id = buyer_requirements.id
             WHERE offers.id = ?
               AND buyer_requirements.buyer_id = ?`,
            [id, buyerId]
        );

        if (offers.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Offer not found"
            });
        }

        const offer = offers[0];

        if (offer.status !== "pending") {
            await connection.rollback();

            return res.status(400).json({
                message: "This offer has already been processed"
            });
        }

        await connection.query(
            `UPDATE offers
             SET status = ?
             WHERE id = ?`,
            [status, id]
        );

        if (status === "accepted") {
            const totalAmount =
                Number(offer.quantity) * Number(offer.offer_price);

            await connection.query(
                `INSERT INTO contracts (
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
                    required_by
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    offer.id,
                    offer.requirement_id,
                    offer.farmer_id,
                    offer.buyer_id,
                    offer.crop_name,
                    offer.quantity,
                    offer.unit,
                    offer.offer_price,
                    totalAmount,
                    offer.quality_grade,
                    offer.location,
                    offer.required_by
                ]
            );
        }

        await connection.commit();

        res.status(200).json({
            message: `Offer ${status} successfully`,
            contractCreated: status === "accepted"
        });

    } catch (error) {

        await connection.rollback();

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });

    } finally {
        connection.release();
    }
};