
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
    try {

        // Get values from URL
        let state = req.query.state;
        let district = req.query.district;
        let market = req.query.market;
        let variety = req.query.variety;
        let grade = req.query.grade;
        // --------------------------------
        // STATE IS REQUIRED
        // --------------------------------

        if (!state) {
            return res.status(400).send("Please provide state");
        }

        // --------------------------------
        // STATE FORMAT
        // --------------------------------
        // Example:
        // madhya pradesh → Madhya Pradesh
        // bihar → Bihar

        state = state
            .toLowerCase()
            .replace(/\b\w/g, char => char.toUpperCase());

        // --------------------------------
        // BASE PRICE API URL
        // --------------------------------

        let url =
            `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070` +
            `?api-key=${process.env.MY_KEY}` +
            `&format=json` +
            `&offset=0` +
            `&limit=10` +
            `&filters%5Bstate.keyword%5D=${encodeURIComponent(state)}`;

        // --------------------------------
        // DISTRICT IS OPTIONAL
        // --------------------------------
        // If user selected a district,
        // add district filter.
        //
        // If user did NOT select district,
        // only state filter will be used.

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

        // --------------------------------
        // CALL PRICE API
        // --------------------------------

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(
                `Price API failed: ${response.status}`
            );
        }

        const data = await response.json();

        let allRecords = data.records || [];

        res.json({
            records: allRecords
        });

    } catch (err) {
        console.log("Error:", err);
        res.status(500).send("API Error");

    }
});

router.get("/markets", async (req, res) => {
    try {

        let state = req.query.state;
        let district = req.query.district;

        if (!state || !district) {
            return res.status(400).json({
                error: "State and district are required"
            });
        }

        state = state
            .toLowerCase()
            .replace(/\b\w/g, char => char.toUpperCase());

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
            throw new Error(`Market API failed: ${response.status}`);
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
});


module.exports = router;