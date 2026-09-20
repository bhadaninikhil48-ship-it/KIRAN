
// 429 error aane par price db se lega 








import db from "../config/db.js";
import { isApiCooldownActive } from "../jobs/priceJob.js";


// ==========================================
// GET PRICES
// ==========================================

export const getPrices = async (req, res) => {
    try {
        let {
            state,
            district,
            market,
            variety,
            grade
        } = req.query;

        if (!state) {
            return res.status(400).json({
                error: "State is required"
            });
        }

        state = state
            .toLowerCase()
            .replace(/\b\w/g, char => char.toUpperCase());

        // ==========================================
        // DATABASE FALLBACK
        // ==========================================

        const getLatestDbPrices = async () => {
            let query = `
                SELECT
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
                FROM market_price_history
                WHERE state = ?
            `;

            const params = [state];

            if (district) {
                query += ` AND district = ?`;
                params.push(district);
            }

            if (market) {
                query += ` AND market = ?`;
                params.push(market);
            }

            if (variety) {
                query += ` AND variety = ?`;
                params.push(variety);
            }

            if (grade) {
                query += ` AND grade = ?`;
                params.push(grade);
            }

            query += `
                ORDER BY arrival_date DESC, id DESC
                LIMIT 10
            `;

            const [rows] = await db.execute(
                query,
                params
            );

            return rows;
        };

        // ==========================================
        // API COOLDOWN
        // ==========================================

        if (isApiCooldownActive()) {

            console.log(
                "API cooldown active → Using latest database prices..."
            );

            const dbRecords =
                await getLatestDbPrices();

            return res.json({
                records: dbRecords,
                source: "database"
            });
        }

        // ==========================================
        // LIVE API
        // ==========================================

        let url =
            `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070` +
            `?api-key=${process.env.MY_KEY}` +
            `&format=json` +
            `&offset=0` +
            `&limit=10` +
            `&filters%5Bstate.keyword%5D=${encodeURIComponent(state)}`;

        if (district) {
            url +=
                `&filters%5Bdistrict%5D=${encodeURIComponent(district)}`;
        }

        if (market) {
            url +=
                `&filters%5Bmarket%5D=${encodeURIComponent(market)}`;
        }

        if (variety) {
            url +=
                `&filters%5Bvariety%5D=${encodeURIComponent(variety)}`;
        }

        if (grade) {
            url +=
                `&filters%5Bgrade%5D=${encodeURIComponent(grade)}`;
        }

        console.log("PRICE API URL =", url);

        // ==========================================
        // TIMEOUT PROTECTION
        // ==========================================

        const controller =
            new AbortController();

        const timeout =
            setTimeout(() => {
                controller.abort();
            }, 10000);

        let response;

        try {
            response = await fetch(
                url,
                {
                    signal: controller.signal
                }
            );
        } finally {
            clearTimeout(timeout);
        }

        if (!response.ok) {
            throw new Error(
                `Price API failed: ${response.status}`
            );
        }

        const data =
            await response.json();

        const allRecords =
            data.records || [];

        // ==========================================
        // SAVE LIVE DATA TO DATABASE
        // ==========================================

        for (const record of allRecords) {

            let arrivalDate = null;

            if (record.arrival_date) {

                const [
                    day,
                    month,
                    year
                ] =
                    record.arrival_date.split("/");

                arrivalDate =
                    `${year}-${month}-${day}`;
            }

            await db.execute(
                `
                INSERT INTO market_price_history
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

                ON DUPLICATE KEY UPDATE
                    min_price = VALUES(min_price),
                    max_price = VALUES(max_price),
                    modal_price = VALUES(modal_price)
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

        // ==========================================
        // LIVE API SUCCESS
        // ==========================================

        return res.json({
            records: allRecords,
            source: "live"
        });

    } catch (error) {

        console.error(
            "Live Price API failed:",
            error.message
        );

        // ==========================================
        // API FAILED → DATABASE FALLBACK
        // ==========================================

        try {

            let {
                state,
                district,
                market,
                variety,
                grade
            } = req.query;

            state = state
                .toLowerCase()
                .replace(/\b\w/g, char => char.toUpperCase());

            let query = `
                SELECT
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
                FROM market_price_history
                WHERE state = ?
            `;

            const params = [state];

            if (district) {
                query += ` AND district = ?`;
                params.push(district);
            }

            if (market) {
                query += ` AND market = ?`;
                params.push(market);
            }

            if (variety) {
                query += ` AND variety = ?`;
                params.push(variety);
            }

            if (grade) {
                query += ` AND grade = ?`;
                params.push(grade);
            }

            query += `
                ORDER BY arrival_date DESC, id DESC
                LIMIT 10
            `;

            const [dbRecords] =
                await db.execute(
                    query,
                    params
                );

            if (dbRecords.length > 0) {

                console.log(
                    "API unavailable → Using latest database prices..."
                );

                return res.json({
                    records: dbRecords,
                    source: "database"
                });
            }

            // ======================================
            // NO API + NO DATABASE DATA
            // ======================================

            return res.status(503).json({
                error:
                    "Live market price unavailable and no historical data found",
                records: [],
                source: "unavailable"
            });

        } catch (dbError) {

            console.error(
                "Database fallback failed:",
                dbError.message
            );

            return res.status(503).json({
                error:
                    "Market price service is temporarily unavailable",
                records: [],
                source: "unavailable"
            });
        }
    }
};

// ==========================================
// GET MARKETS
// ==========================================

export const getMarkets = async (req, res) => {

    try {

        let state = req.query.state;
        let district = req.query.district;


        if (!state || !district) {

            return res.status(400).json({
                error: "State and district are required"
            });
        }


        // ==========================================
        // STATE FORMAT
        // ==========================================

        state = state
            .toLowerCase()
            .replace(
                /\b\w/g,
                char => char.toUpperCase()
            );


        // ==========================================
        // GET MARKETS FROM DATABASE
        // ==========================================

        const getMarketsFromDatabase = async () => {

            const [rows] =
                await db.execute(
                    `
                    SELECT DISTINCT
                        market,
                        variety,
                        grade
                    FROM market_price_history
                    WHERE state = ?
                      AND district = ?
                      AND market <> ''
                    ORDER BY market ASC
                    `,
                    [
                        state,
                        district
                    ]
                );


            const markets = [
                ...new Set(
                    rows
                        .map(row => row.market)
                        .filter(Boolean)
                )
            ];


            const varieties = [
                ...new Set(
                    rows
                        .map(row => row.variety)
                        .filter(Boolean)
                )
            ];


            const grades = [
                ...new Set(
                    rows
                        .map(row => row.grade)
                        .filter(Boolean)
                )
            ];


            return {
                markets,
                varieties,
                grades
            };
        };


        // ==========================================
        // COOLDOWN ACTIVE
        // → DB ONLY
        // ==========================================

        if (isApiCooldownActive()) {

            console.log(
                "API cooldown active → using database markets"
            );


            const dbData =
                await getMarketsFromDatabase();


            return res.json({
                ...dbData,
                source: "database"
            });
        }


        // ==========================================
        // COOLDOWN NOT ACTIVE
        // → DB + LIVE API
        // ==========================================

        const dbData =
            await getMarketsFromDatabase();


        let liveMarkets = [];
        let liveVarieties = [];
        let liveGrades = [];


        try {

            const url =
                `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070` +
                `?api-key=${process.env.MY_KEY}` +
                `&format=json` +
                `&offset=0` +
                `&limit=1000` +
                `&filters%5Bstate.keyword%5D=${encodeURIComponent(state)}` +
                `&filters%5Bdistrict%5D=${encodeURIComponent(district)}`;


            console.log(
                "MARKET API URL =",
                url
            );


            const response =
                await fetch(url);


            if (!response.ok) {

                throw new Error(
                    `Market API failed: ${response.status}`
                );
            }


            const data =
                await response.json();


            const records =
                data.records || [];


            liveMarkets = [
                ...new Set(
                    records
                        .map(record => record.market)
                        .filter(Boolean)
                )
            ];


            liveVarieties = [
                ...new Set(
                    records
                        .map(record => record.variety)
                        .filter(Boolean)
                )
            ];


            liveGrades = [
                ...new Set(
                    records
                        .map(record => record.grade)
                        .filter(Boolean)
                )
            ];


        } catch (apiError) {

            console.log(
                "Market API failed:",
                apiError.message
            );

            console.log(
                "Using database data only."
            );
        }


        // ==========================================
        // COMBINE DB + LIVE DATA
        // ==========================================

        const markets = [
            ...new Set([
                ...dbData.markets,
                ...liveMarkets
            ])
        ];


        const varieties = [
            ...new Set([
                ...dbData.varieties,
                ...liveVarieties
            ])
        ];


        const grades = [
            ...new Set([
                ...dbData.grades,
                ...liveGrades
            ])
        ];


        console.log(
            "FINAL MARKETS =",
            markets
        );


        console.log(
            "FINAL VARIETIES =",
            varieties
        );


        console.log(
            "FINAL GRADES =",
            grades
        );


        // ==========================================
        // SEND FINAL DATA
        // ==========================================

        res.json({
            markets,
            varieties,
            grades,
            source: "database + live"
        });


    } catch (err) {

        console.log(
            "Market Error:",
            err
        );


        res.status(500).json({
            error: "Unable to fetch markets"
        });
    }
};

// ==========================================
// GET PRICE HISTORY
// ==========================================

export const getPriceHistory = async (req, res) => {

    try {

        const {
            state,
            district,
            market,
            commodity,
            variety,
            grade
        } = req.query;


        if (
            !state ||
            !district ||
            !market ||
            !commodity ||
            !variety ||
            !grade
        ) {

            return res.status(400).json({
                error:
                    "State, district, market, commodity, variety and grade are required"
            });
        }


        const [rows] =
            await db.execute(
                `
                SELECT
                    arrival_date,
                    ROUND(
                        AVG(modal_price),
                        2
                    ) AS modal_price
                FROM market_price_history
                WHERE state = ?
                  AND district = ?
                  AND market = ?
                  AND commodity = ?
                  AND variety = ?
                  AND grade = ?
                  AND arrival_date >= DATE_SUB(
                      CURDATE(),
                      INTERVAL 6 DAY
                  )
                GROUP BY arrival_date
                ORDER BY arrival_date ASC
                `,
                [
                    state,
                    district,
                    market,
                    commodity,
                    variety,
                    grade
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
            error:
                "Unable to fetch price history"
        });
    }
};