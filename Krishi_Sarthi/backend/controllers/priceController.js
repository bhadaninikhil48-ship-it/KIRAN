// export const getPrices = async (req, res) => {
//     try {

//         // Get values from URL
//         let state = req.query.state;
//         let district = req.query.district;
//         let market = req.query.market;
//         let variety = req.query.variety;
//         let grade = req.query.grade;

//         // STATE IS REQUIRED
//         if (!state) {
//             return res.status(400).send("Please provide state");
//         }

//         // STATE FORMAT
//         state = state
//             .toLowerCase()
//             .replace(/\b\w/g, char => char.toUpperCase());

//         // BASE PRICE API URL
//         let url =
//             `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070` +
//             `?api-key=${process.env.MY_KEY}` +
//             `&format=json` +
//             `&offset=0` +
//             `&limit=10` +
//             `&filters%5Bstate.keyword%5D=${encodeURIComponent(state)}`;

//         // DISTRICT FILTER
//         if (district) {
//             url +=
//                 `&filters%5Bdistrict%5D=${encodeURIComponent(district)}`;
//         }

//         // MARKET FILTER
//         if (market) {
//             url +=
//                 `&filters%5Bmarket%5D=${encodeURIComponent(market)}`;
//         }

//         // VARIETY FILTER
//         if (variety) {
//             url +=
//                 `&filters%5Bvariety%5D=${encodeURIComponent(variety)}`;
//         }

//         // GRADE FILTER
//         if (grade) {
//             url +=
//                 `&filters%5Bgrade%5D=${encodeURIComponent(grade)}`;
//         }

//         console.log("PRICE API URL =", url);

//         // CALL PRICE API
//         const response = await fetch(url);

//         if (!response.ok) {
//             throw new Error(
//                 `Price API failed: ${response.status}`
//             );
//         }

//         const data = await response.json();

//         const allRecords = data.records || [];

//         res.json({
//             records: allRecords
//         });

//     } catch (err) {

//         console.log("Error:", err);

//         res.status(500).send("API Error");
//     }
// };


// export const getMarkets = async (req, res) => {
//     try {

//         let state = req.query.state;
//         let district = req.query.district;

//         if (!state || !district) {
//             return res.status(400).json({
//                 error: "State and district are required"
//             });
//         }

//         // STATE FORMAT
//         state = state
//             .toLowerCase()
//             .replace(/\b\w/g, char => char.toUpperCase());

//         // MARKET API URL
//         let url =
//             `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070` +
//             `?api-key=${process.env.MY_KEY}` +
//             `&format=json` +
//             `&offset=0` +
//             `&limit=1000` +
//             `&filters%5Bstate.keyword%5D=${encodeURIComponent(state)}` +
//             `&filters%5Bdistrict%5D=${encodeURIComponent(district)}`;

//         console.log("MARKET API URL =", url);

//         const response = await fetch(url);

//         if (!response.ok) {
//             throw new Error(
//                 `Market API failed: ${response.status}`
//             );
//         }

//         const data = await response.json();

//         const records = data.records || [];

//         const markets = [
//             ...new Set(
//                 records.map(record => record.market)
//             )
//         ];

//         const varieties = [
//             ...new Set(
//                 records.map(record => record.variety)
//             )
//         ];

//         const grades = [
//             ...new Set(
//                 records.map(record => record.grade)
//             )
//         ];

//         console.log("MARKETS =", markets);
//         console.log("VARIETIES =", varieties);
//         console.log("GRADES =", grades);

//         res.json({
//             markets,
//             varieties,
//             grades
//         });

//     } catch (err) {

//         console.log("Market Error:", err);

//         res.status(500).json({
//             error: "Unable to fetch markets"
//         });
//     }
// };





















import db from "../config/db.js";

export const getPrices = async (req, res) => {
    try {

        // Get values from URL
        let state = req.query.state;
        let district = req.query.district;
        let market = req.query.market;
        let variety = req.query.variety;
        let grade = req.query.grade;

        // STATE IS REQUIRED
        if (!state) {
            return res.status(400).send("Please provide state");
        }

        // STATE FORMAT
        state = state
            .toLowerCase()
            .replace(/\b\w/g, char => char.toUpperCase());

        // BASE PRICE API URL
        let url =
            `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070` +
            `?api-key=${process.env.MY_KEY}` +
            `&format=json` +
            `&offset=0` +
            `&limit=10` +
            `&filters%5Bstate.keyword%5D=${encodeURIComponent(state)}`;

        // DISTRICT FILTER
        if (district) {
            url +=
                `&filters%5Bdistrict%5D=${encodeURIComponent(district)}`;
        }

        // MARKET FILTER
        if (market) {
            url +=
                `&filters%5Bmarket%5D=${encodeURIComponent(market)}`;
        }

        // VARIETY FILTER
        if (variety) {
            url +=
                `&filters%5Bvariety%5D=${encodeURIComponent(variety)}`;
        }

        // GRADE FILTER
        if (grade) {
            url +=
                `&filters%5Bgrade%5D=${encodeURIComponent(grade)}`;
        }

        console.log("PRICE API URL =", url);

        // CALL PRICE API
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(
                `Price API failed: ${response.status}`
            );
        }

        const data = await response.json();

        const allRecords = data.records || [];

        // --------------------------------
        // SAVE PRICE DATA INTO DATABASE
        // --------------------------------

        for (const record of allRecords) {

            // Convert DD/MM/YYYY → YYYY-MM-DD
            let arrivalDate = null;

            if (record.arrival_date) {
                const [day, month, year] =
                    record.arrival_date.split("/");

                arrivalDate = `${year}-${month}-${day}`;
            }

            await db.execute(
                `
                INSERT IGNORE INTO market_price_history
                (
                    state,
                    district,
                    market,
                    commodity,
                    variety,
                    grade,
                    min_price,
                    max_price,
                    modal_price,
                    arrival_date
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    record.state || "",
                    record.district || "",
                    record.market || "",
                    record.commodity || "",
                    record.variety || "",
                    record.grade || "",
                    record.min_price || null,
                    record.max_price || null,
                    record.modal_price || null,
                    arrivalDate
                ]
            );
        }

        console.log(
            `${allRecords.length} price records saved to database`
        );

        // --------------------------------
        // SEND DATA TO FRONTEND
        // --------------------------------

        res.json({
            records: allRecords
        });

    } catch (err) {

        console.log("Error:", err);

        res.status(500).send("API Error");
    }
};


export const getMarkets = async (req, res) => {
    try {

        let state = req.query.state;
        let district = req.query.district;

        if (!state || !district) {
            return res.status(400).json({
                error: "State and district are required"
            });
        }

        // STATE FORMAT
        state = state
            .toLowerCase()
            .replace(/\b\w/g, char => char.toUpperCase());

        // MARKET API URL
        let url =
            `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070` +
            `?api-key=${process.env.MY_KEY}` +
            `&format=json` +
            `&offset=0` +
            `&limit=1000` +
            `&filters%5Bstate.keyword%5D=${encodeURIComponent(state)}` +
            `&filters%5Bdistrict%5D=${encodeURIComponent(district)}`;

        console.log("MARKET API URL =", url);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(
                `Market API failed: ${response.status}`
            );
        }

        const data = await response.json();

        const records = data.records || [];

        const markets = [
            ...new Set(
                records.map(record => record.market)
            )
        ];

        const varieties = [
            ...new Set(
                records.map(record => record.variety)
            )
        ];

        const grades = [
            ...new Set(
                records.map(record => record.grade)
            )
        ];

        console.log("MARKETS =", markets);
        console.log("VARIETIES =", varieties);
        console.log("GRADES =", grades);

        res.json({
            markets,
            varieties,
            grades
        });

    } catch (err) {

        console.log("Market Error:", err);

        res.status(500).json({
            error: "Unable to fetch markets"
        });
    }
};


export const getPriceHistory = async (req, res) => {
    try {

        const { state, district, market, commodity } = req.query;

        if (!state || !district || !market || !commodity) {
            return res.status(400).json({
                error: "State, district, market and commodity are required"
            });
        }

        const [rows] = await db.execute(
            `
            SELECT
                arrival_date,
                ROUND(AVG(modal_price), 2) AS modal_price
            FROM market_price_history
            WHERE state = ?
              AND district = ?
              AND market = ?
              AND commodity = ?
              AND arrival_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
            GROUP BY arrival_date
            ORDER BY arrival_date ASC
            `,
            [
                state,
                district,
                market,
                commodity
            ]
        );

        res.json({
            records: rows
        });

    } catch (error) {

        console.error(
            "Price history error:",
            error
        );

        res.status(500).json({
            error: "Unable to fetch price history"
        });
    }
};