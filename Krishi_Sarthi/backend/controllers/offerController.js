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
                offers.seller_type,
                offers.farmer_id,
                offers.fpo_id,
                offers.fpo_lot_id,
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
                COALESCE(farmer_users.name, fpo_profiles.fpo_name, 'Unknown Seller') AS farmer_name,
                COALESCE(farmer_users.name, fpo_profiles.fpo_name, 'Unknown Seller') AS seller_name,
                fpo_profiles.fpo_name,
                fpo_lots.lot_number
             FROM offers
             INNER JOIN buyer_requirements
                ON offers.requirement_id = buyer_requirements.id
             LEFT JOIN farmer_profiles
                ON offers.farmer_id = farmer_profiles.id
             LEFT JOIN users farmer_users
                ON farmer_profiles.user_id = farmer_users.id
             LEFT JOIN fpo_profiles
                ON offers.fpo_id = fpo_profiles.id
             LEFT JOIN fpo_lots
                ON offers.fpo_lot_id = fpo_lots.id
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

        // 1. Lock the offer and join buyer requirement
        const [offers] = await connection.query(
            `SELECT
                offers.id,
                offers.status,
                offers.offer_price,
                offers.quantity,
                offers.farmer_id,
                offers.fpo_id,
                offers.fpo_lot_id,
                offers.seller_type,
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
             FOR UPDATE`,
            [id]
        );

        if (offers.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                message: "Offer not found"
            });
        }

        const offer = offers[0];

        // 2. Verify requirement ownership by the authenticated buyer
        if (offer.buyer_id !== buyerId) {
            await connection.rollback();
            return res.status(403).json({
                message: "Unauthorized: You do not own the buyer requirement for this offer"
            });
        }

        // 3. Verify offer is still pending
        if (offer.status !== "pending") {
            await connection.rollback();
            return res.status(400).json({
                message: "This offer has already been processed"
            });
        }

        // 4. Duplicate contract protection: Check if contract already exists
        const [existingContracts] = await connection.query(
            `SELECT id FROM contracts WHERE offer_id = ? FOR UPDATE`,
            [offer.id]
        );
        if (existingContracts.length > 0) {
            await connection.rollback();
            return res.status(400).json({
                message: "Contract already exists for this offer"
            });
        }

        // If status is rejected, update offer and commit
        if (status === "rejected") {
            await connection.query(
                `UPDATE offers
                 SET status = 'rejected'
                 WHERE id = ?`,
                [id]
            );

            await connection.commit();
            return res.status(200).json({
                message: "Offer rejected successfully",
                contractCreated: false
            });
        }

        // Status is "accepted"
        // 5. Determine final negotiated terms (inspect offer_negotiations)
        const [negotiations] = await connection.query(
            `SELECT price, quantity
             FROM offer_negotiations
             WHERE offer_id = ?
             ORDER BY created_at DESC, id DESC
             LIMIT 1`,
            [offer.id]
        );

        let finalPrice = Number(offer.offer_price);
        let finalQuantity = Number(offer.quantity);

        if (negotiations.length > 0) {
            finalPrice = Number(negotiations[0].price);
            finalQuantity = Number(negotiations[0].quantity);
        }

        // 6. Validate final terms
        if (isNaN(finalPrice) || finalPrice <= 0 || isNaN(finalQuantity) || finalQuantity <= 0) {
            await connection.rollback();
            return res.status(400).json({
                message: "Invalid contract price or quantity"
            });
        }

        const totalAmount = Number((finalQuantity * finalPrice).toFixed(2));

        // 7. Handle polymorphic seller (FPO vs Farmer)
        if (offer.seller_type === "fpo") {
            if (!offer.fpo_id || !offer.fpo_lot_id) {
                await connection.rollback();
                return res.status(400).json({
                    message: "Invalid FPO offer: Missing FPO or lot information"
                });
            }

            // Lock and inspect the linked FPO lot
            const [lots] = await connection.query(
                `SELECT id, fpo_id, status, total_quantity
                 FROM fpo_lots
                 WHERE id = ? AND fpo_id = ?
                 FOR UPDATE`,
                [offer.fpo_lot_id, offer.fpo_id]
            );

            if (lots.length === 0) {
                await connection.rollback();
                return res.status(400).json({
                    message: "Linked FPO lot not found or does not belong to this FPO"
                });
            }

            const lot = lots[0];

            if (lot.status !== "offered") {
                await connection.rollback();
                return res.status(400).json({
                    message: `Cannot contract lot: Lot status is '${lot.status}', expected 'offered'`
                });
            }

            if (finalQuantity > Number(lot.total_quantity)) {
                await connection.rollback();
                return res.status(400).json({
                    message: `Agreed quantity (${finalQuantity}) exceeds lot total quantity (${lot.total_quantity})`
                });
            }

            // Insert FPO contract (farmer_id is NULL)
            const [contractResult] = await connection.query(
                `INSERT INTO contracts (
                    offer_id,
                    requirement_id,
                    farmer_id,
                    fpo_id,
                    fpo_lot_id,
                    seller_type,
                    buyer_id,
                    crop_name,
                    quantity,
                    unit,
                    agreed_price,
                    total_amount,
                    quality_grade,
                    delivery_location,
                    required_by,
                    status
                )
                VALUES (?, ?, NULL, ?, ?, 'fpo', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
                [
                    offer.id,
                    offer.requirement_id,
                    offer.fpo_id,
                    offer.fpo_lot_id,
                    offer.buyer_id,
                    offer.crop_name,
                    finalQuantity,
                    offer.unit,
                    finalPrice,
                    totalAmount,
                    offer.quality_grade,
                    offer.location,
                    offer.required_by
                ]
            );

            // Update FPO lot status atomically: offered -> contracted
            await connection.query(
                `UPDATE fpo_lots
                 SET status = 'contracted'
                 WHERE id = ?`,
                [lot.id]
            );

            // Update offer status
            await connection.query(
                `UPDATE offers
                 SET status = 'accepted'
                 WHERE id = ?`,
                [id]
            );

            await connection.commit();

            return res.status(200).json({
                message: "Offer accepted successfully",
                contractCreated: true,
                contractId: contractResult.insertId
            });

        } else {
            // Farmer offer (fpo_id and fpo_lot_id are NULL)
            const [contractResult] = await connection.query(
                `INSERT INTO contracts (
                    offer_id,
                    requirement_id,
                    farmer_id,
                    fpo_id,
                    fpo_lot_id,
                    seller_type,
                    buyer_id,
                    crop_name,
                    quantity,
                    unit,
                    agreed_price,
                    total_amount,
                    quality_grade,
                    delivery_location,
                    required_by,
                    status
                )
                VALUES (?, ?, ?, NULL, NULL, 'farmer', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
                [
                    offer.id,
                    offer.requirement_id,
                    offer.farmer_id,
                    offer.buyer_id,
                    offer.crop_name,
                    finalQuantity,
                    offer.unit,
                    finalPrice,
                    totalAmount,
                    offer.quality_grade,
                    offer.location,
                    offer.required_by
                ]
            );

            // Update offer status
            await connection.query(
                `UPDATE offers
                 SET status = 'accepted'
                 WHERE id = ?`,
                [id]
            );

            await connection.commit();

            return res.status(200).json({
                message: "Offer accepted successfully",
                contractCreated: true,
                contractId: contractResult.insertId
            });
        }

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });

    } finally {
        connection.release();
    }
};

export const getMyOffers = async (req, res) => {
    try {
        const userId = req.user.id;

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

        // Get farmer's offers
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
                buyer_requirements.required_by,
                buyer_requirements.buyer_id,

                users.name AS buyer_name,

                (SELECT COUNT(*) FROM offer_negotiations WHERE offer_id = offers.id) AS negotiation_count,
                (SELECT sender_role FROM offer_negotiations WHERE offer_id = offers.id ORDER BY created_at DESC, id DESC LIMIT 1) AS latest_sender_role,
                (SELECT price FROM offer_negotiations WHERE offer_id = offers.id ORDER BY created_at DESC, id DESC LIMIT 1) AS latest_counter_price,
                (SELECT quantity FROM offer_negotiations WHERE offer_id = offers.id ORDER BY created_at DESC, id DESC LIMIT 1) AS latest_counter_quantity,
                (SELECT message FROM offer_negotiations WHERE offer_id = offers.id ORDER BY created_at DESC, id DESC LIMIT 1) AS latest_counter_message,
                (SELECT created_at FROM offer_negotiations WHERE offer_id = offers.id ORDER BY created_at DESC, id DESC LIMIT 1) AS latest_counter_date

             FROM offers

             INNER JOIN buyer_requirements
                ON offers.requirement_id = buyer_requirements.id

             INNER JOIN users
                ON buyer_requirements.buyer_id = users.id

             WHERE offers.farmer_id = ?

             ORDER BY offers.created_at DESC`,
            [farmerId]
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