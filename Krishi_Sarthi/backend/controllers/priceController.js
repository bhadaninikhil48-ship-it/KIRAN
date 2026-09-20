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










// ye code uska hai jab 429 error aane par price bhi affect ho rha hai
// iske next wala me 429 error aane par price collected db se show hoga 










// import db from "../config/db.js";




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

//         // --------------------------------
//         // SAVE PRICE DATA INTO DATABASE
//         // --------------------------------

//         for (const record of allRecords) {

//             // Convert DD/MM/YYYY → YYYY-MM-DD
//             let arrivalDate = null;

//             if (record.arrival_date) {
//                 const [day, month, year] =
//                     record.arrival_date.split("/");

//                 arrivalDate = `${year}-${month}-${day}`;
//             }

//             await db.execute(
//                 `
//                 INSERT IGNORE INTO market_price_history
//                 (
//                     state,
//                     district,
//                     market,
//                     commodity,
//                     variety,
//                     grade,
//                     min_price,
//                     max_price,
//                     modal_price,
//                     arrival_date
//                 )
//                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//                 `,
//                 [
//                     record.state || "",
//                     record.district || "",
//                     record.market || "",
//                     record.commodity || "",
//                     record.variety || "",
//                     record.grade || "",
//                     record.min_price || null,
//                     record.max_price || null,
//                     record.modal_price || null,
//                     arrivalDate
//                 ]
//             );
//         }

//         console.log(
//             `${allRecords.length} price records saved to database`
//         );

//         // --------------------------------
//         // SEND DATA TO FRONTEND
//         // --------------------------------

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

// export const getPriceHistory = async (req, res) => {
//     try {

//         const {
//             state,
//             district,
//             market,
//             commodity,
//             variety,
//             grade
//         } = req.query;

//         if (
//             !state ||
//             !district ||
//             !market ||
//             !commodity ||
//             !variety ||
//             !grade
//         ) {
//             return res.status(400).json({
//                 error:
//                     "State, district, market, commodity, variety and grade are required"
//             });
//         }

//         const [rows] = await db.execute(
//             `
//             SELECT
//                 arrival_date,
//                 ROUND(AVG(modal_price), 2) AS modal_price
//             FROM market_price_history
//             WHERE state = ?
//               AND district = ?
//               AND market = ?
//               AND commodity = ?
//               AND variety = ?
//               AND grade = ?
//               AND arrival_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
//             GROUP BY arrival_date
//             ORDER BY arrival_date ASC
//             `,
//             [
//                 state,
//                 district,
//                 market,
//                 commodity,
//                 variety,
//                 grade
//             ]
//         );

//         res.json({
//             records: rows
//         });

//     } catch (error) {

//         console.error(
//             "Price history error:",
//             error
//         );

//         res.status(500).json({
//             error: "Unable to fetch price history"
//         });
//     }
// };

















// 429 error aane par price db se lega 








import db from "../config/db.js";
import { isApiCooldownActive } from "../jobs/priceJob.js";


// ==========================================
// GET PRICES
// ==========================================

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
            return res.status(400).send(
                "Please provide state"
            );
        }


        // STATE FORMAT
        state = state
            .toLowerCase()
            .replace(
                /\b\w/g,
                char => char.toUpperCase()
            );


        // ==========================================
        // DATABASE FALLBACK FUNCTION
        // ==========================================

        const getLatestDbPrices = async () => {

            try {

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
                        DATE_FORMAT(
                            arrival_date,
                            '%d/%m/%Y'
                        ) AS arrival_date
                    FROM market_price_history
                    WHERE state = ?
                `;


                const params = [state];


                if (district) {

                    query += `
                        AND district = ?
                    `;

                    params.push(district);
                }


                if (market) {

                    query += `
                        AND market = ?
                    `;

                    params.push(market);
                }


                if (variety) {

                    query += `
                        AND variety = ?
                    `;

                    params.push(variety);
                }


                if (grade) {

                    query += `
                        AND grade = ?
                    `;

                    params.push(grade);
                }


                query += `
                    ORDER BY
                        arrival_date DESC,
                        id DESC
                    LIMIT 10
                `;


                const [rows] =
                    await db.execute(
                        query,
                        params
                    );


                return rows;

            } catch (error) {

                console.error(
                    "Database fallback error:",
                    error
                );

                return [];
            }
        };


        // ==========================================
        // CHECK GLOBAL API COOLDOWN
        // ==========================================

        if (isApiCooldownActive()) {

            console.log(
                "API cooldown active → using database"
            );


            const dbRecords =
                await getLatestDbPrices();


            return res.json({
                records: dbRecords,
                source: "database"
            });
        }


        // ==========================================
        // LIVE PRICE API URL
        // ==========================================

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
                `&filters%5Bdistrict%5D=${encodeURIComponent(
                    district
                )}`;
        }


        // MARKET FILTER
        if (market) {

            url +=
                `&filters%5Bmarket%5D=${encodeURIComponent(
                    market
                )}`;
        }


        // VARIETY FILTER
        if (variety) {

            url +=
                `&filters%5Bvariety%5D=${encodeURIComponent(
                    variety
                )}`;
        }


        // GRADE FILTER
        if (grade) {

            url +=
                `&filters%5Bgrade%5D=${encodeURIComponent(
                    grade
                )}`;
        }


        console.log(
            "PRICE API URL =",
            url
        );


        // ==========================================
        // CALL LIVE API
        // ==========================================

        try {

            const response =
                await fetch(url);


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
            // SAVE LIVE PRICE DATA
            // ==========================================

            for (const record of allRecords) {

                let arrivalDate = null;


                if (record.arrival_date) {

                    const [
                        day,
                        month,
                        year
                    ] =
                        record.arrival_date
                            .split("/");


                    arrivalDate =
                        `${year}-${month}-${day}`;
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


            // ==========================================
            // SEND LIVE DATA
            // ==========================================

            return res.json({
                records: allRecords,
                source: "live"
            });


        } catch (apiError) {

            // ==========================================
            // LIVE API FAILED → DATABASE FALLBACK
            // ==========================================

            console.log(
                "Live Price API failed:",
                apiError.message
            );


            console.log(
                "Using latest database prices..."
            );


            const dbRecords =
                await getLatestDbPrices();


            if (dbRecords.length > 0) {

                return res.json({
                    records: dbRecords,
                    source: "database"
                });
            }


            // ==========================================
            // NO LIVE + NO DATABASE DATA
            // ==========================================

            return res.status(503).json({
                error:
                    "Live price service unavailable and no saved price data found.",
                records: []
            });
        }


    } catch (err) {

        console.log(
            "Price Controller Error:",
            err
        );


        res.status(500).send(
            "Price service error"
        );
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