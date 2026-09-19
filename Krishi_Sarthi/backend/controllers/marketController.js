import db from "../config/db.js";

export const getMarketPrices = async (req, res) => {
    try {

        const [prices] = await db.query(
            `SELECT *
             FROM market_prices
             ORDER BY price_date DESC, market_name ASC`
        );

        res.status(200).json({
            prices
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

export const compareMarketPrices = async (req, res) => {
    try {
        const { crop } = req.query;

        if (!crop) {
            return res.status(400).json({
                message: "Crop is required"
            });
        }

        const [markets] = await db.query(
            `SELECT
                market_name,
                district,
                state,
                crop_name,
                min_price,
                max_price,
                modal_price,
                arrival_quantity,
                arrival_unit,
                price_date
             FROM market_prices
             WHERE crop_name = ?
             ORDER BY modal_price DESC`,
            [crop]
        );

        res.status(200).json({
            markets
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


export const getBestSellingOpportunity = async (req, res) => {
    try {

        const { crop } = req.query;

        if (!crop) {
            return res.status(400).json({
                message: "Crop is required"
            });
        }

        const [markets] = await db.query(
            `SELECT
                market_name,
                district,
                state,
                crop_name,
                modal_price,
                arrival_quantity,
                arrival_unit,
                price_date
             FROM market_prices
             WHERE crop_name = ?
             ORDER BY modal_price DESC
             LIMIT 1`,
            [crop]
        );

        if (markets.length === 0) {
            return res.status(404).json({
                message: "No market data found for this crop"
            });
        }

        res.status(200).json({
            opportunity: markets[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};