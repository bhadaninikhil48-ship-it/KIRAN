import db from "../config/db.js";

/**
 * Submit a negotiation counter-offer / message on a pending marketplace offer.
 * Reuses existing offer_negotiations table.
 * Supports Farmer, FPO, and Buyer participants with strict server-side role resolution.
 * POST /api/negotiations
 */
export const createNegotiation = async (req, res) => {
    try {
        const userId = req.user.id;
        const { offerId, price, quantity, message } = req.body;

        const numPrice = parseFloat(price);
        const numQuantity = parseFloat(quantity);

        if (!offerId || isNaN(numPrice) || numPrice <= 0 || isNaN(numQuantity) || numQuantity <= 0) {
            return res.status(400).json({
                message: "Offer ID, positive price and positive quantity are required"
            });
        }

        // Query the offer without restrictive inner joins so both farmer and FPO offers are returned
        const [offers] = await db.query(
            `SELECT
                offers.id,
                offers.status,
                offers.seller_type,
                offers.farmer_id,
                offers.fpo_id,
                offers.fpo_lot_id,
                offers.offer_price,
                offers.quantity,
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

        if (offer.status !== "pending") {
            return res.status(400).json({
                message: "Negotiation is only available for pending offers"
            });
        }

        // Server-side sender role & ownership determination (client cannot spoof sender_role)
        let senderRole;

        if (req.user.role === "buyer") {
            if (offer.buyer_id !== userId) {
                return res.status(403).json({
                    message: "You are not authorized to negotiate this offer"
                });
            }
            senderRole = "buyer";
        } else if (req.user.role === "farmer") {
            const [farmerRows] = await db.query(
                "SELECT id FROM farmer_profiles WHERE user_id = ?",
                [userId]
            );

            if (
                farmerRows.length === 0 ||
                offer.seller_type !== "farmer" ||
                farmerRows[0].id !== offer.farmer_id
            ) {
                return res.status(403).json({
                    message: "You are not authorized to negotiate this offer"
                });
            }
            senderRole = "farmer";
        } else if (req.user.role === "fpo") {
            const [fpoRows] = await db.query(
                "SELECT id FROM fpo_profiles WHERE user_id = ?",
                [userId]
            );

            if (
                fpoRows.length === 0 ||
                offer.seller_type !== "fpo" ||
                fpoRows[0].id !== offer.fpo_id
            ) {
                return res.status(403).json({
                    message: "You are not authorized to negotiate this offer"
                });
            }
            senderRole = "fpo";
        } else {
            return res.status(403).json({
                message: "You are not authorized to negotiate this offer"
            });
        }

        // If FPO offer, verify proposed counter quantity does not exceed the FPO lot's capacity
        if (offer.seller_type === "fpo" && offer.fpo_lot_id) {
            const [lotRows] = await db.query(
                "SELECT total_quantity, unit FROM fpo_lots WHERE id = ?",
                [offer.fpo_lot_id]
            );
            if (lotRows.length > 0) {
                const lotTotal = parseFloat(lotRows[0].total_quantity);
                if (numQuantity > lotTotal + 0.001) {
                    return res.status(400).json({
                        message: `Negotiated quantity (${numQuantity}) cannot exceed the FPO lot's total quantity (${lotTotal} ${lotRows[0].unit})`
                    });
                }
            }
        }

        const [insertResult] = await db.query(
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
                numPrice,
                numQuantity,
                message ? message.trim() : null
            ]
        );

        res.status(201).json({
            message: "Negotiation submitted successfully",
            negotiation: {
                id: insertResult.insertId,
                offer_id: offerId,
                sender_id: userId,
                sender_role: senderRole,
                price: numPrice,
                quantity: numQuantity,
                message: message ? message.trim() : null
            }
        });

    } catch (error) {
        console.error("Error in createNegotiation:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
};

/**
 * Retrieve negotiation thread history for an offer with latest negotiated terms.
 * Accessible only to the owning buyer, farmer, or FPO.
 * GET /api/negotiations/:offerId
 */
export const getNegotiationHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { offerId } = req.params;

        const [offers] = await db.query(
            `SELECT
                offers.id,
                offers.status,
                offers.seller_type,
                offers.farmer_id,
                offers.fpo_id,
                offers.offer_price,
                offers.quantity,
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
        } else if (req.user.role === "farmer") {
            const [farmerRows] = await db.query(
                "SELECT id FROM farmer_profiles WHERE user_id = ?",
                [userId]
            );
            if (
                farmerRows.length > 0 &&
                offer.seller_type === "farmer" &&
                farmerRows[0].id === offer.farmer_id
            ) {
                authorized = true;
            }
        } else if (req.user.role === "fpo") {
            const [fpoRows] = await db.query(
                "SELECT id FROM fpo_profiles WHERE user_id = ?",
                [userId]
            );
            if (
                fpoRows.length > 0 &&
                offer.seller_type === "fpo" &&
                fpoRows[0].id === offer.fpo_id
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
             ORDER BY created_at ASC, id ASC`,
            [offerId]
        );

        // Determine latest terms from most recent negotiation message (or original offer if no messages)
        const latestMessage = negotiations.length > 0 ? negotiations[negotiations.length - 1] : null;
        const latestTerms = latestMessage
            ? {
                price: parseFloat(latestMessage.price),
                quantity: parseFloat(latestMessage.quantity),
                sender_role: latestMessage.sender_role,
                sender_id: latestMessage.sender_id,
                last_updated: latestMessage.created_at
              }
            : {
                price: parseFloat(offer.offer_price),
                quantity: parseFloat(offer.quantity),
                sender_role: offer.seller_type,
                sender_id: null,
                last_updated: null
              };

        res.status(200).json({
            negotiations,
            latest_terms: latestTerms,
            original_terms: {
                price: parseFloat(offer.offer_price),
                quantity: parseFloat(offer.quantity)
            },
            offer: {
                id: offer.id,
                status: offer.status,
                seller_type: offer.seller_type
            }
        });

    } catch (error) {
        console.error("Error in getNegotiationHistory:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
};