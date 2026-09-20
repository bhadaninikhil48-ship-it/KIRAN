


import db from "../config/db.js";

const BASE_URL =
    "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";

const DISTRICT_API =
    "https://aniket-thapa.github.io/india-pincode-api/states";


// ==========================================
// ALL STATES
// ==========================================

const states = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal"
];


// ==========================================
// SETTINGS
// ==========================================

const RETRY_COUNT = 2;
const RETRY_WAIT = 10000;

// ==========================================
// GLOBAL DATA.GOV.IN API COOLDOWN
// ==========================================

let apiCooldownUntil = 0;

export const isApiCooldownActive = () => {
    return Date.now() < apiCooldownUntil;
};

const getRemainingCooldown = () => {
    return Math.max(
        0,
        apiCooldownUntil - Date.now()
    );
};

const startApiCooldown = (seconds) => {

    apiCooldownUntil =
        Date.now() + (seconds * 1000);

    console.log("");
    console.log("======================================");
    console.log("DATA.GOV.IN API COOLDOWN STARTED");
    console.log(`Waiting → ${seconds} seconds`);
    console.log("All live price API calls are paused.");
    console.log("======================================");
};



const REQUIRED_STABLE_CHECKS = 3;

const VERIFICATION_WAIT =
    10 * 60 * 1000;

const NIGHT_REFRESH_HOUR = 2;

const NEW_DAY_CHECK_INTERVAL =
    30 * 60 * 1000;


// ==========================================
// WAIT
// ==========================================

const wait = (ms) => {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
};


// ==========================================
// DATE HELPERS
// ==========================================

const parseArrivalDate = (dateString) => {

    if (!dateString) {
        return null;
    }

    const [day, month, year] =
        dateString.split("/");

    if (!day || !month || !year) {
        return null;
    }

    return `${year}-${month}-${day}`;
};


const getTodayIST = () => {

    const now = new Date();

    const istDate =
        new Intl.DateTimeFormat(
            "en-CA",
            {
                timeZone: "Asia/Kolkata",
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }
        ).format(now);

    return istDate;
};


const getCurrentHourIST = () => {

    const now = new Date();

    const hour =
        new Intl.DateTimeFormat(
            "en-IN",
            {
                timeZone: "Asia/Kolkata",
                hour: "2-digit",
                hour12: false
            }
        ).format(now);

    return Number(hour);
};


// ==========================================
// STATE SLUG
// ==========================================

const getStateSlug = (state) => {

    return state
        .toLowerCase()
        .replace(/\s+/g, "-");
};


// ==========================================
// FETCH WITH RETRY
// ==========================================

const fetchWithRetry = async (
    url,
    label,
    maxAttempts = 3
) => {

    const isPriceApi =
        url.startsWith(BASE_URL);

    for (
        let attempt = 1;
        attempt <= maxAttempts;
        attempt++
    ) {

        // ==================================
        // GLOBAL COOLDOWN CHECK
        // ==================================

        if (isPriceApi) {

            const remaining =
                getRemainingCooldown();

            if (remaining > 0) {

                console.log("");
                console.log(
                    `API cooldown active → ${Math.ceil(
                        remaining / 1000
                    )}s remaining`
                );

                await wait(remaining);
            }
        }

        try {

            const response =
                await fetch(url);

            // ==================================
            // SUCCESS
            // ==================================

            if (response.ok) {

                if (
                    isPriceApi &&
                    apiCooldownUntil > Date.now()
                ) {

                    apiCooldownUntil = 0;

                    console.log(
                        "DATA.GOV.IN API COOLDOWN ENDED"
                    );
                }

                return response;
            }

            // ==================================
            // 429 RATE LIMIT
            // ==================================

            if (
                response.status === 429 &&
                isPriceApi
            ) {

                console.log("");
                console.log(
                    `429 → ${label}`
                );

                const retryAfter =
                    response.headers.get(
                        "retry-after"
                    );

                let cooldownSeconds;

                if (retryAfter) {

                    const retryValue =
                        Number(retryAfter);

                    cooldownSeconds =
                        Number.isFinite(retryValue) &&
                            retryValue > 0
                            ? retryValue
                            : 60;

                } else {

                    cooldownSeconds = 60;
                }

                startApiCooldown(
                    cooldownSeconds
                );

                console.log(
                    "Same request will be retried after cooldown."
                );

                await wait(
                    cooldownSeconds * 1000
                );

                continue;
            }

            // ==================================
            // TEMPORARY SERVER ERRORS
            // ==================================

            if (
                isPriceApi &&
                (
                    response.status === 408 ||
                    response.status === 500 ||
                    response.status === 502 ||
                    response.status === 503 ||
                    response.status === 504
                )
            ) {

                console.log("");
                console.log(
                    `Temporary API error ${response.status} → ${label}`
                );

                const cooldownSeconds = 60;

                startApiCooldown(
                    cooldownSeconds
                );

                await wait(
                    cooldownSeconds * 1000
                );

                continue;
            }

            // ==================================
            // OTHER HTTP ERROR
            // ==================================

            throw new Error(
                `API ${response.status}`
            );

        } catch (error) {

            console.error(
                `${label} → attempt ${attempt}/${maxAttempts} failed:`,
                error.message
            );

            // ==================================
            // NETWORK / TIMEOUT / FETCH FAILED
            // ==================================

            if (
                isPriceApi &&
                (
                    error.name === "AbortError" ||
                    error.message === "fetch failed" ||
                    error.message.includes(
                        "ECONNRESET"
                    ) ||
                    error.message.includes(
                        "ETIMEDOUT"
                    ) ||
                    error.message.includes(
                        "ENOTFOUND"
                    )
                )
            ) {

                const cooldownSeconds = 60;

                console.log("");
                console.log(
                    "DATA.GOV.IN API NETWORK FAILURE"
                );

                console.log(
                    `Global cooldown → ${cooldownSeconds} seconds`
                );

                startApiCooldown(
                    cooldownSeconds
                );

                if (
                    attempt < maxAttempts
                ) {

                    await wait(
                        cooldownSeconds * 1000
                    );

                    continue;
                }
            }

            // ==================================
            // NORMAL RETRY
            // ==================================

            if (
                attempt < maxAttempts
            ) {

                const waitTime =
                    attempt === 1
                        ? RETRY_WAIT
                        : RETRY_WAIT * 2;

                console.log(
                    `Waiting ${waitTime / 1000}s before retry ${attempt + 1}/${maxAttempts}`
                );

                await wait(waitTime);

            } else {

                throw error;
            }
        }
    }

    throw new Error(
        `Maximum attempts reached → ${label}`
    );
};



// ==========================================
// SAVE SINGLE RECORD
// ==========================================

const saveRecord = async (record) => {

    let arrivalDate = null;


    if (record.arrival_date) {

        arrivalDate =
            parseArrivalDate(
                record.arrival_date
            );
    }


    if (!arrivalDate) {
        return "failed";
    }


    try {

        const [result] =
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


        if (result.affectedRows === 1) {
            return "inserted";
        }

        if (result.affectedRows === 2) {
            return "updated";
        }

        return "unchanged";

    } catch (error) {

        console.error(
            "Database save error:",
            error.message
        );

        return "failed";
    }
};


// ==========================================
// SAVE RECORDS
// ==========================================

const saveRecords = async (records) => {

    let inserted = 0;
    let updated = 0;
    let unchanged = 0;
    let failed = 0;


    for (const record of records) {

        const result =
            await saveRecord(record);


        if (result === "inserted") {
            inserted++;
        }

        else if (result === "updated") {
            updated++;
        }

        else if (result === "unchanged") {
            unchanged++;
        }

        else {
            failed++;
        }
    }


    return {
        inserted,
        updated,
        unchanged,
        failed
    };
};


// ==========================================
// GET DISTRICTS
// ==========================================

const getDistricts = async (state) => {

    try {

        const stateSlug =
            getStateSlug(state);


        const url =
            `${DISTRICT_API}/${stateSlug}.json`;


        console.log(
            `Checking districts → ${state}`
        );


        const response =
            await fetchWithRetry(
                url,
                `District list → ${state}`
            );


        const data =
            await response.json();


        return data.districts || [];

    } catch (error) {

        console.error(
            `District list failed → ${state}:`,
            error.message
        );

        throw error;
    }
};


// ==========================================
// CHECK STATE DATA
// ==========================================

const checkStateData = async (state) => {

    try {

        const url =
            `${BASE_URL}` +
            `?api-key=${process.env.MY_KEY}` +
            `&format=json` +
            `&offset=0` +
            `&limit=1` +
            `&filters%5Bstate.keyword%5D=${encodeURIComponent(state)}`;


        console.log(
            `Checking state → ${state}`
        );


        const response =
            await fetchWithRetry(
                url,
                `State check → ${state}`
            );


        const data =
            await response.json();


        return {
            success: true,
            hasData:
                data.records &&
                data.records.length > 0
        };

    } catch (error) {

        console.error(
            `State check failed → ${state}:`,
            error.message
        );


        return {
            success: false,
            hasData: false
        };
    }
};


// ==========================================
// FETCH DISTRICT DATA
// ==========================================

const fetchDistrictData = async (
    state,
    district
) => {

    const limit = 100;

    let offset = 0;

    let totalRecords = 0;

    let inserted = 0;
    let updated = 0;
    let unchanged = 0;
    let failed = 0;


    while (true) {

        const url =
            `${BASE_URL}` +
            `?api-key=${process.env.MY_KEY}` +
            `&format=json` +
            `&offset=${offset}` +
            `&limit=${limit}` +
            `&filters%5Bstate.keyword%5D=${encodeURIComponent(state)}` +
            `&filters%5Bdistrict%5D=${encodeURIComponent(district)}`;


        try {

            console.log(
                `Fetching → ${state} → ${district} → offset ${offset}`
            );


            const response =
                await fetchWithRetry(
                    url,
                    `${state} → ${district}`
                );


            const data =
                await response.json();


            const records =
                data.records || [];


            if (records.length === 0) {
                break;
            }


            const result =
                await saveRecords(records);


            inserted += result.inserted;
            updated += result.updated;
            unchanged += result.unchanged;
            failed += result.failed;


            totalRecords += records.length;


            console.log(
                `${state} → ${district} → ${records.length} records received`
            );


            offset += limit;


            if (records.length < limit) {
                break;
            }

        } catch (error) {

            console.error(
                `District failed → ${state} → ${district}:`,
                error.message
            );


            return {
                success: false,
                totalRecords,
                inserted,
                updated,
                unchanged,
                failed
            };
        }
    }


    return {
        success: true,
        totalRecords,
        inserted,
        updated,
        unchanged,
        failed
    };
};


// ==========================================
// FULL COLLECTION
// ==========================================

const runFullCollection = async (label) => {

    console.log("");
    console.log("======================================");
    console.log(`FULL COLLECTION → ${label}`);
    console.log("======================================");


    let totalRecords = 0;

    let inserted = 0;
    let updated = 0;
    let unchanged = 0;
    let failed = 0;

    const failedDistricts = [];


    for (const state of states) {

        console.log("");
        console.log(
            `========== STATE: ${state} ==========`
        );


        // STEP 1
        // Check state

        const stateCheck =
            await checkStateData(state);


        if (!stateCheck.success) {

            console.log(
                `State check failed → ${state}`
            );

            failedDistricts.push(
                `${state} → STATE CHECK`
            );

            continue;
        }


        if (!stateCheck.hasData) {

            console.log(
                `No data available → ${state}`
            );

            console.log(
                `Skipping all districts of ${state}`
            );

            continue;
        }


        // STEP 2
        // Get districts

        let districts;

        try {

            districts =
                await getDistricts(state);

        } catch (error) {

            failedDistricts.push(
                `${state} → DISTRICT LIST`
            );

            continue;
        }


        if (districts.length === 0) {

            console.log(
                `No districts found → ${state}`
            );

            failedDistricts.push(
                `${state} → DISTRICT LIST`
            );

            continue;
        }


        console.log(
            `${districts.length} districts found → ${state}`
        );


        // STEP 3
        // Districts sequentially

        for (const district of districts) {

            const result =
                await fetchDistrictData(
                    state,
                    district.name
                );


            totalRecords +=
                result.totalRecords;

            inserted +=
                result.inserted;

            updated +=
                result.updated;

            unchanged +=
                result.unchanged;

            failed +=
                result.failed;


            if (!result.success) {

                failedDistricts.push(
                    `${state} → ${district.name}`
                );

            } else {

                console.log(
                    `Completed → ${state} → ${district.name}`
                );
            }
        }


        console.log(
            `========== ${state} COMPLETE ==========`
        );
    }


    console.log("");
    console.log("======================================");
    console.log(
        `COLLECTION COMPLETE → ${totalRecords} records received`
    );
    console.log(
        `Inserted → ${inserted}`
    );
    console.log(
        `Updated → ${updated}`
    );
    console.log(
        `Unchanged → ${unchanged}`
    );
    console.log(
        `Failed DB saves → ${failed}`
    );
    console.log("======================================");


    if (failedDistricts.length > 0) {

        console.log("");
        console.log(
            "FAILED DISTRICTS:"
        );

        failedDistricts.forEach(item => {
            console.log(`→ ${item}`);
        });

        console.log("");
    }


    return {
        success:
            failedDistricts.length === 0,

        totalRecords,
        inserted,
        updated,
        unchanged,
        failed,
        failedDistricts
    };
};


// ==========================================
// GET API LATEST DATE
// ==========================================

const getApiLatestDate = async () => {

    try {

        const url =
            `${BASE_URL}` +
            `?api-key=${process.env.MY_KEY}` +
            `&format=json` +
            `&offset=0` +
            `&limit=10`;


        const response =
            await fetchWithRetry(
                url,
                "API latest date check"
            );


        const data =
            await response.json();


        const records =
            data.records || [];


        if (records.length === 0) {
            return null;
        }


        const dates =
            records
                .map(record =>
                    parseArrivalDate(
                        record.arrival_date
                    )
                )
                .filter(Boolean);


        if (dates.length === 0) {
            return null;
        }


        return dates.sort().at(-1);

    } catch (error) {

        console.error(
            "API latest date failed:",
            error.message
        );

        return null;
    }
};


// ==========================================
// GET API RECORD COUNT
// ==========================================
// ==========================================
// GET TODAY API RECORD COUNT
// ==========================================

const getTodayApiRecordCount = async () => {

    try {

        const today = getTodayIST();

        // API arrival_date format → DD/MM/YYYY
        const [year, month, day] =
            today.split("-");

        const apiDate =
            `${day}/${month}/${year}`;


        const url =
            `${BASE_URL}` +
            `?api-key=${process.env.MY_KEY}` +
            `&format=json` +
            `&offset=0` +
            `&limit=1` +
            `&filters%5Barrival_date%5D=${encodeURIComponent(apiDate)}`;


        const response =
            await fetchWithRetry(
                url,
                "Today's API record count check"
            );


        const data =
            await response.json();


        return Number(
            data.total || 0
        );

    } catch (error) {

        console.error(
            "Today's API record count failed:",
            error.message
        );

        return null;
    }
};


// ==========================================
// GET DB RECORD COUNT
// ==========================================

const getDbRecordCount = async (date) => {

    try {

        const [rows] =
            await db.execute(
                `
                SELECT COUNT(*) AS total
                FROM market_price_history
                WHERE arrival_date = ?
                `,
                [date]
            );


        return Number(
            rows[0]?.total || 0
        );

    } catch (error) {

        console.error(
            "DB record count failed:",
            error.message
        );

        return null;
    }
};
// ==========================================
// START COLLECTOR
// ==========================================

const startCollector = async () => {

    console.log("");
    console.log("######################################");
    console.log("PRICE COLLECTOR STARTED");
    console.log("######################################");

    console.log(
        "Background collection window → 11 PM to 1 AM"
    );


    while (true) {

        const now = new Date();

        const hour =
            Number(
                new Intl.DateTimeFormat(
                    "en-IN",
                    {
                        timeZone: "Asia/Kolkata",
                        hour: "2-digit",
                        hour12: false
                    }
                ).format(now)
            );


        // ======================================
        // COLLECTION WINDOW
        // 11 PM → 1 AM
        // ======================================

        const isCollectionWindow =
            hour >= 23 || hour < 1;


        // ======================================
        // OUTSIDE COLLECTION WINDOW
        // ======================================

        if (!isCollectionWindow) {

            console.log("");
            console.log(
                "Collector sleeping..."
            );

            console.log(
                "Next collection window → 11 PM"
            );

            // Check again after 30 minutes
            await wait(
                30 * 60 * 1000
            );

            continue;
        }


        // ======================================
        // 11 PM - 1 AM
        // CHECK FOR NEW DATA
        // ======================================

        console.log("");
        console.log("======================================");
        console.log("COLLECTION WINDOW ACTIVE");
        console.log("Checking for new data...");
        console.log("======================================");


        const today =
            getTodayIST();


        const apiCount =
            await getTodayApiRecordCount();


        if (apiCount === null) {

            console.log(
                "Unable to check today's API data."
            );

            console.log(
                "No collection started."
            );

            await wait(
                15 * 60 * 1000
            );

            continue;
        }


        const dbCount =
            await getDbRecordCount(
                today
            );


        if (dbCount === null) {

            console.log(
                "Unable to check today's DB data."
            );

            await wait(
                15 * 60 * 1000
            );

            continue;
        }


        console.log("");
        console.log(
            "========== TODAY DATA CHECK =========="
        );

        console.log(
            `API records → ${apiCount}`
        );

        console.log(
            `DB records  → ${dbCount}`
        );

        console.log(
            "======================================"
        );


        // ======================================
        // NO NEW DATA
        // ======================================

        if (apiCount <= dbCount) {

            console.log("");
            console.log(
                "NO NEW DATA AVAILABLE."
            );

            console.log(
                "Collection will NOT start."
            );

            console.log(
                "Checking again after 15 minutes..."
            );


            await wait(
                15 * 60 * 1000
            );

            continue;
        }


        // ======================================
        // NEW DATA AVAILABLE
        // ======================================

        console.log("");
        console.log(
            "======================================"
        );

        console.log(
            "NEW DATA DETECTED!"
        );

        console.log(
            `API → ${apiCount}`
        );

        console.log(
            `DB  → ${dbCount}`
        );

        console.log(
            "Starting full collection..."
        );

        console.log(
            "======================================"
        );


        // ======================================
        // FULL COLLECTION
        // ======================================

        const result =
            await runFullCollection(
                "NIGHT COLLECTION"
            );


        // ======================================
        // COLLECTION FINISHED
        // ======================================

        console.log("");
        console.log(
            "======================================"
        );

        if (result.success) {

            console.log(
                "NIGHT COLLECTION COMPLETED"
            );

            console.log(
                "Collector stopped for today."
            );

        } else {

            console.log(
                "NIGHT COLLECTION COMPLETED WITH FAILURES"
            );

            console.log(
                "Remaining work will be checked again"
            );

            console.log(
                "within the current 11 PM - 1 AM window."
            );
        }

        console.log(
            "======================================"
        );


        // ======================================
        // IF COLLECTION SUCCESSFUL
        // DON'T RUN AGAIN TODAY
        // ======================================

        if (result.success) {

            const currentTime =
                new Date();

            const currentHour =
                Number(
                    new Intl.DateTimeFormat(
                        "en-IN",
                        {
                            timeZone: "Asia/Kolkata",
                            hour: "2-digit",
                            hour12: false
                        }
                    ).format(currentTime)
                );


            if (
                currentHour >= 23 ||
                currentHour < 1
            ) {

                console.log("");
                console.log(
                    "Collection finished early."
                );

                console.log(
                    "No more background collection today."
                );

                console.log(
                    "Next cycle → Tomorrow 11 PM"
                );


                // Wait until next collection window
                await wait(
                    60 * 60 * 1000
                );

                continue;
            }
        }


        // ======================================
        // COLLECTION FAILED / INCOMPLETE
        // CHECK AGAIN AFTER 15 MINUTES
        // ======================================

        await wait(
            15 * 60 * 1000
        );
    }
};

// ==========================================
// START
// ==========================================

startCollector();