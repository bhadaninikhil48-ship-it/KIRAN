import cron from "node-cron";
import db from "../config/db.js";

const fetchAndSavePrices = async () => {
    try {

        console.log("Starting daily price collection...");

        const limit = 100;
        let offset = 0;
        let totalSaved = 0;

        while (true) {

            const url =
                `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070` +
                `?api-key=${process.env.MY_KEY}` +
                `&format=json` +
                `&offset=${offset}` +
                `&limit=${limit}`;

            console.log(
                `Fetching records: offset=${offset}, limit=${limit}`
            );

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(
                    `Price API failed: ${response.status}`
                );
            }

            const data = await response.json();

            const records = data.records || [];

            if (records.length === 0) {
                break;
            }

            for (const record of records) {

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

            totalSaved += records.length;

            offset += limit;

            console.log(
                `${records.length} price records processed`
            );

            if (records.length < limit) {
                break;
            }
        }

        console.log(
            `${totalSaved} price records processed by daily job`
        );

    } catch (error) {

        console.error(
            "Daily price collection failed:",
            error
        );
    }
};


// Runs every day at 12:00 AM
cron.schedule("0 0 * * *", fetchAndSavePrices);

export default fetchAndSavePrices;