// import db from "../config/db.js";

// const BASE_URL =
//     "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";

// const DISTRICT_API =
//     "https://aniket-thapa.github.io/india-pincode-api/states";


// // All states
// const states = [
//     "Andhra Pradesh",
//     "Arunachal Pradesh",
//     "Assam",
//     "Bihar",
//     "Chhattisgarh",
//     "Goa",
//     "Gujarat",
//     "Haryana",
//     "Himachal Pradesh",
//     "Jharkhand",
//     "Karnataka",
//     "Kerala",
//     "Madhya Pradesh",
//     "Maharashtra",
//     "Manipur",
//     "Meghalaya",
//     "Mizoram",
//     "Nagaland",
//     "Odisha",
//     "Punjab",
//     "Rajasthan",
//     "Sikkim",
//     "Tamil Nadu",
//     "Telangana",
//     "Tripura",
//     "Uttar Pradesh",
//     "Uttarakhand",
//     "West Bengal"
// ];


// // -----------------------------------------
// // WAIT FUNCTION
// // -----------------------------------------

// const wait = (ms) => {
//     return new Promise(resolve => {
//         setTimeout(resolve, ms);
//     });
// };


// // -----------------------------------------
// // API FETCH WITH RETRY
// // -----------------------------------------

// const fetchWithRetry = async (
//     url,
//     label,
//     maxRetries = 4
// ) => {

//     for (let attempt = 1; attempt <= maxRetries; attempt++) {

//         try {

//             const response = await fetch(url);

//             // Success
//             if (response.ok) {
//                 return response;
//             }


//             // Rate limit
//             if (response.status === 429) {

//                 let retryAfter =
//                     response.headers.get("retry-after");

//                 let delay;

//                 if (retryAfter) {

//                     delay =
//                         Number(retryAfter) * 1000;

//                 } else {

//                     // 10s → 20s → 40s → 60s
//                     delay =
//                         Math.min(
//                             10000 * Math.pow(2, attempt - 1),
//                             60000
//                         );
//                 }

//                 console.log(
//                     `429 → ${label}`
//                 );

//                 console.log(
//                     `Waiting ${delay / 1000}s before retry ${attempt}/${maxRetries}`
//                 );

//                 await wait(delay);

//                 continue;
//             }


//             // Other HTTP error
//             throw new Error(
//                 `API ${response.status}`
//             );

//         } catch (error) {

//             console.error(
//                 `${label} → attempt ${attempt}/${maxRetries} failed:`,
//                 error.message
//             );

//             if (attempt < maxRetries) {

//                 const delay =
//                     Math.min(
//                         5000 * attempt,
//                         30000
//                     );

//                 await wait(delay);

//             } else {

//                 throw error;
//             }
//         }
//     }

//     throw new Error(
//         `Maximum retries reached → ${label}`
//     );
// };


// // -----------------------------------------
// // STATE SLUG
// // -----------------------------------------

// const getStateSlug = (state) => {

//     return state
//         .toLowerCase()
//         .replace(/\s+/g, "-");
// };


// // -----------------------------------------
// // SAVE RECORDS
// // -----------------------------------------

// const saveRecords = async (records) => {

//     let saved = 0;

//     for (const record of records) {

//         let arrivalDate = null;

//         if (record.arrival_date) {

//             const [day, month, year] =
//                 record.arrival_date.split("/");

//             arrivalDate =
//                 `${year}-${month}-${day}`;
//         }

//         try {

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

//             saved++;

//         } catch (error) {

//             console.error(
//                 "Database save error:",
//                 error.message
//             );
//         }
//     }

//     return saved;
// };


// // -----------------------------------------
// // FETCH DISTRICT DATA
// // -----------------------------------------

// const fetchDistrictData = async (
//     state,
//     district
// ) => {

//     const limit = 100;

//     let offset = 0;
//     let totalRecords = 0;


//     while (true) {

//         const url =
//             `${BASE_URL}` +
//             `?api-key=${process.env.MY_KEY}` +
//             `&format=json` +
//             `&offset=${offset}` +
//             `&limit=${limit}` +
//             `&filters%5Bstate.keyword%5D=${encodeURIComponent(state)}` +
//             `&filters%5Bdistrict%5D=${encodeURIComponent(district)}`;


//         try {

//             console.log(
//                 `Fetching → ${state} → ${district} → offset ${offset}`
//             );


//             const response =
//                 await fetchWithRetry(
//                     url,
//                     `${state} → ${district}`
//                 );


//             const data =
//                 await response.json();


//             const records =
//                 data.records || [];


//             if (records.length === 0) {

//                 break;
//             }


//             const saved =
//                 await saveRecords(records);


//             totalRecords += saved;


//             console.log(
//                 `${state} → ${district} → ${records.length} records received`
//             );


//             offset += limit;


//             if (records.length < limit) {

//                 break;
//             }

//         } catch (error) {

//             console.error(
//                 `District failed → ${state} → ${district}:`,
//                 error.message
//             );

//             // Important:
//             // Don't stop entire cycle.
//             break;
//         }
//     }


//     return totalRecords;
// };


// // -----------------------------------------
// // GET DISTRICTS
// // -----------------------------------------

// const getDistricts = async (state) => {

//     try {

//         const stateSlug =
//             getStateSlug(state);


//         const url =
//             `${DISTRICT_API}/${stateSlug}.json`;


//         console.log(
//             `Checking districts → ${state}`
//         );


//         const response =
//             await fetchWithRetry(
//                 url,
//                 `District list → ${state}`
//             );


//         const data =
//             await response.json();


//         return data.districts || [];

//     } catch (error) {

//         console.error(
//             `District list failed → ${state}:`,
//             error.message
//         );

//         return [];
//     }
// };


// // -----------------------------------------
// // CHECK STATE DATA
// // -----------------------------------------

// const checkStateData = async (state) => {

//     try {

//         const url =
//             `${BASE_URL}` +
//             `?api-key=${process.env.MY_KEY}` +
//             `&format=json` +
//             `&offset=0` +
//             `&limit=1` +
//             `&filters%5Bstate.keyword%5D=${encodeURIComponent(state)}`;


//         console.log(
//             `Checking state → ${state}`
//         );


//         const response =
//             await fetchWithRetry(
//                 url,
//                 `State check → ${state}`
//             );


//         const data =
//             await response.json();


//         return (
//             data.records &&
//             data.records.length > 0
//         );

//     } catch (error) {

//         console.error(
//             `State check failed → ${state}:`,
//             error.message
//         );

//         return false;
//     }
// };


// // -----------------------------------------
// // ONE COMPLETE CYCLE
// // -----------------------------------------

// const fetchAndSavePrices = async () => {

//     console.log(
//         "\n======================================"
//     );

//     console.log(
//         "STARTING NEW PRICE COLLECTION CYCLE"
//     );

//     console.log(
//         "======================================\n"
//     );


//     let totalSaved = 0;


//     for (const state of states) {

//         console.log(
//             `\n========== STATE: ${state} ==========`
//         );


//         // STEP 1
//         // Check state first

//         const stateHasData =
//             await checkStateData(state);


//         if (!stateHasData) {

//             console.log(
//                 `No data available → ${state}`
//             );

//             console.log(
//                 `Skipping all districts of ${state}`
//             );

//             continue;
//         }


//         // STEP 2
//         // Get districts

//         const districts =
//             await getDistricts(state);


//         if (districts.length === 0) {

//             console.log(
//                 `No districts found → ${state}`
//             );

//             continue;
//         }


//         console.log(
//             `${districts.length} districts found → ${state}`
//         );


//         // STEP 3
//         // Process districts sequentially

//         for (const district of districts) {

//             const saved =
//                 await fetchDistrictData(
//                     state,
//                     district.name
//                 );


//             totalSaved += saved;


//             console.log(
//                 `Completed → ${state} → ${district.name}`
//             );
//         }


//         console.log(
//             `========== ${state} COMPLETE ==========`
//         );
//     }


//     console.log(
//         "\n======================================"
//     );

//     console.log(
//         `CYCLE COMPLETE → ${totalSaved} records processed`
//     );

//     console.log(
//         "Waiting 60 seconds before next cycle..."
//     );

//     console.log(
//         "======================================\n"
//     );


//     // Small cooldown before next cycle
//     await wait(60000);


//     // Start next cycle
//     fetchAndSavePrices();
// };


// // -----------------------------------------
// // START COLLECTOR
// // -----------------------------------------

// fetchAndSavePrices();


// export default fetchAndSavePrices;














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


                // API ke Retry-After header ko
                // priority denge
                const retryAfter =
                    response.headers.get(
                        "retry-after"
                    );


                let cooldownSeconds;


                if (retryAfter) {

                    const retryValue =
                        Number(retryAfter);


                    cooldownSeconds =
                        Number.isFinite(
                            retryValue
                        ) &&
                            retryValue > 0
                            ? retryValue
                            : 60;

                } else {

                    // Fallback cooldown
                    cooldownSeconds = 60;
                }


                startApiCooldown(
                    cooldownSeconds
                );


                console.log("");
                console.log(
                    `429 received for → ${label}`
                );

                console.log(
                    "Same request will be retried after cooldown."
                );


                // ==================================
                // IMPORTANT:
                // SAME URL / SAME DISTRICT RETRY
                // ==================================

                await wait(
                    cooldownSeconds * 1000
                );


                // Cooldown khatam hone ke baad
                // SAME attempt/request dobara
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


            // 429 ko upar already handle kiya hai.
            // Yahan sirf normal errors ke retry honge.

            if (attempt < maxAttempts) {

                const waitTime =
                    attempt === 1
                        ? 10000
                        : 20000;


                console.log(
                    `Waiting ${waitTime / 1000}s before retry ${attempt}/${maxAttempts}`
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

const getApiRecordCount = async () => {

    try {

        const url =
            `${BASE_URL}` +
            `?api-key=${process.env.MY_KEY}` +
            `&format=json` +
            `&offset=0` +
            `&limit=1`;


        const response =
            await fetchWithRetry(
                url,
                "API record count check"
            );


        const data =
            await response.json();


        return Number(
            data.total || 0
        );

    } catch (error) {

        console.error(
            "API record count failed:",
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


    let collectedDate = null;

    let baselineApiCount = null;

    let stableChecks = 0;

    let dayCollectionComplete = false;

    let lastNightRefreshDate = null;


    while (true) {

        // ======================================
        // 1. CURRENT API DATE
        // ======================================

        const apiDate =
            await getApiLatestDate();


        if (!apiDate) {

            console.log("");
            console.log(
                "API date unavailable."
            );

            console.log(
                `Retrying after ${NEW_DAY_CHECK_INTERVAL / 60000
                } minutes.`
            );


            await wait(
                NEW_DAY_CHECK_INTERVAL
            );

            continue;
        }


        console.log("");
        console.log(
            `API latest date → ${apiDate}`
        );


        // ======================================
        // 2. FIRST RUN
        // ======================================

        if (!collectedDate) {

            collectedDate = apiDate;


            console.log("");
            console.log(
                `Starting collection for → ${collectedDate}`
            );


            const result =
                await runFullCollection(
                    "FIRST FULL"
                );


            if (!result.success) {

                console.log("");
                console.log(
                    "FIRST COLLECTION INCOMPLETE"
                );

                console.log(
                    "Some districts failed."
                );

                console.log(
                    "Retrying after 10 minutes..."
                );


                await wait(
                    VERIFICATION_WAIT
                );

                continue;
            }


            baselineApiCount =
                await getApiRecordCount();


            if (
                baselineApiCount === null
            ) {

                console.log(
                    "Unable to get API record count."
                );


                await wait(
                    VERIFICATION_WAIT
                );

                continue;
            }


            const dbCount =
                await getDbRecordCount(
                    collectedDate
                );


            console.log("");
            console.log(
                "========== INITIAL COUNT =========="
            );

            console.log(
                `API records → ${baselineApiCount}`
            );

            console.log(
                `DB records  → ${dbCount}`
            );

            console.log(
                "==================================="
            );


            if (
                dbCount === null ||
                dbCount < baselineApiCount
            ) {

                console.log("");
                console.log(
                    "DB count is less than API count."
                );

                console.log(
                    "Collection is NOT complete."
                );

                continue;
            }


            stableChecks = 0;

            dayCollectionComplete = false;

            continue;
        }


        // ======================================
        // 3. NEW DAY
        // ======================================

        if (
            apiDate > collectedDate
        ) {

            console.log("");
            console.log(
                "======================================"
            );

            console.log(
                `NEW DAY DETECTED → ${apiDate}`
            );

            console.log(
                "======================================"
            );


            collectedDate = apiDate;

            baselineApiCount = null;

            stableChecks = 0;

            dayCollectionComplete = false;


            const result =
                await runFullCollection(
                    "NEW DAY FULL"
                );


            if (!result.success) {

                console.log(
                    "NEW DAY COLLECTION INCOMPLETE"
                );


                await wait(
                    VERIFICATION_WAIT
                );

                continue;
            }


            baselineApiCount =
                await getApiRecordCount();


            if (
                baselineApiCount === null
            ) {

                await wait(
                    VERIFICATION_WAIT
                );

                continue;
            }


            const dbCount =
                await getDbRecordCount(
                    collectedDate
                );


            console.log("");
            console.log(
                "========== NEW DAY COUNT =========="
            );

            console.log(
                `API records → ${baselineApiCount}`
            );

            console.log(
                `DB records  → ${dbCount}`
            );

            console.log(
                "==================================="
            );


            if (
                dbCount === null ||
                dbCount < baselineApiCount
            ) {

                console.log(
                    "DB count is less than API count."
                );

                console.log(
                    "Collection is incomplete."
                );

                continue;
            }


            continue;
        }


        // ======================================
        // 4. CURRENT DAY NOT COMPLETE
        // ======================================

        if (
            apiDate === collectedDate &&
            !dayCollectionComplete
        ) {

            console.log("");
            console.log(
                "--------------------------------------"
            );

            console.log(
                `VERIFICATION CHECK → ${stableChecks + 1
                }/${REQUIRED_STABLE_CHECKS}`
            );

            console.log(
                `Date → ${collectedDate}`
            );

            console.log(
                "--------------------------------------"
            );


            const currentApiCount =
                await getApiRecordCount();


            if (
                currentApiCount === null
            ) {

                console.log(
                    "Unable to get current API count."
                );


                await wait(
                    VERIFICATION_WAIT
                );

                continue;
            }


            const currentDbCount =
                await getDbRecordCount(
                    collectedDate
                );


            if (
                currentDbCount === null
            ) {

                console.log(
                    "Unable to get DB count."
                );


                await wait(
                    VERIFICATION_WAIT
                );

                continue;
            }


            console.log("");

            console.log(
                `Previous API count → ${baselineApiCount}`
            );

            console.log(
                `Current API count  → ${currentApiCount}`
            );

            console.log(
                `Current DB count   → ${currentDbCount}`
            );


            // ==================================
            // CASE 1:
            // NEW DATA
            // ==================================

            if (
                currentApiCount >
                baselineApiCount
            ) {

                console.log("");
                console.log(
                    "NEW DATA DETECTED!"
                );

                console.log(
                    `${baselineApiCount} → ${currentApiCount}`
                );

                console.log(
                    "Running full collection..."
                );


                const result =
                    await runFullCollection(
                        "NEW DATA COLLECTION"
                    );


                if (!result.success) {

                    console.log(
                        "Collection incomplete."
                    );


                    await wait(
                        VERIFICATION_WAIT
                    );

                    continue;
                }


                baselineApiCount =
                    currentApiCount;

                stableChecks = 0;


                console.log(
                    `New baseline → ${baselineApiCount}`
                );

                console.log(
                    "Stable counter reset → 0"
                );


                await wait(
                    VERIFICATION_WAIT
                );

                continue;
            }


            // ==================================
            // CASE 2:
            // DB DATA MISSING
            // ==================================

            if (
                currentDbCount <
                currentApiCount
            ) {

                console.log("");
                console.log(
                    "DATABASE DATA MISSING!"
                );

                console.log(
                    `API → ${currentApiCount}`
                );

                console.log(
                    `DB  → ${currentDbCount}`
                );

                console.log(
                    "Running recovery collection..."
                );


                const result =
                    await runFullCollection(
                        "DATABASE RECOVERY"
                    );


                if (!result.success) {

                    console.log(
                        "Recovery incomplete."
                    );


                    await wait(
                        VERIFICATION_WAIT
                    );

                    continue;
                }


                stableChecks = 0;


                console.log(
                    "Missing data restored/checked."
                );

                console.log(
                    "Stable counter reset → 0"
                );


                await wait(
                    VERIFICATION_WAIT
                );

                continue;
            }


            // ==================================
            // CASE 3:
            // COUNT SAME
            // ==================================

            if (
                currentApiCount ===
                baselineApiCount &&
                currentDbCount >=
                currentApiCount
            ) {

                const result =
                    await runFullCollection(
                        "STABILITY CHECK"
                    );


                if (!result.success) {

                    console.log(
                        "Stability check incomplete."
                    );

                    stableChecks = 0;


                    await wait(
                        VERIFICATION_WAIT
                    );

                    continue;
                }


                const finalDbCount =
                    await getDbRecordCount(
                        collectedDate
                    );


                if (
                    finalDbCount === null
                ) {

                    await wait(
                        VERIFICATION_WAIT
                    );

                    continue;
                }


                if (
                    finalDbCount >=
                    currentApiCount
                ) {

                    stableChecks++;


                    console.log("");

                    console.log(
                        `STABLE CHECK → ${stableChecks
                        }/${REQUIRED_STABLE_CHECKS}`
                    );


                    if (
                        stableChecks >=
                        REQUIRED_STABLE_CHECKS
                    ) {

                        dayCollectionComplete =
                            true;


                        console.log("");

                        console.log(
                            "======================================"
                        );

                        console.log(
                            "TODAY'S DATA CONFIRMED STABLE"
                        );

                        console.log(
                            "3 CONSECUTIVE CHECKS PASSED"
                        );

                        console.log(
                            `FINAL COUNT → ${finalDbCount}`
                        );

                        console.log(
                            "FULL COLLECTION STOPPED FOR TODAY"
                        );

                        console.log(
                            "======================================"
                        );
                    }

                } else {

                    console.log(
                        "DB count dropped."
                    );

                    stableChecks = 0;

                    console.log(
                        "Stable counter reset → 0"
                    );
                }


                if (
                    !dayCollectionComplete
                ) {

                    await wait(
                        VERIFICATION_WAIT
                    );
                }


                continue;
            }
        }


        // ======================================
        // 5. TODAY COMPLETE
        // ======================================

        if (
            apiDate === collectedDate &&
            dayCollectionComplete
        ) {

            console.log("");
            console.log(
                `Today's collection already complete → ${collectedDate}`
            );

            console.log(
                "Collector is in WAITING MODE."
            );

            console.log(
                "No full collection needed."
            );


            const currentHour =
                getCurrentHourIST();

            const today =
                getTodayIST();


            // ==================================
            // NIGHT REFRESH
            // ==================================

            if (
                currentHour >=
                NIGHT_REFRESH_HOUR &&
                lastNightRefreshDate !== today
            ) {

                console.log("");

                console.log(
                    "======================================"
                );

                console.log(
                    "NIGHT REFRESH STARTED"
                );

                console.log(
                    `Date → ${today}`
                );

                console.log(
                    "======================================"
                );


                const result =
                    await runFullCollection(
                        "NIGHT REFRESH"
                    );


                if (result.success) {

                    console.log(
                        "Night refresh completed successfully."
                    );

                } else {

                    console.log(
                        "Night refresh completed with failures."
                    );
                }


                lastNightRefreshDate =
                    today;


                console.log(
                    "Night refresh finished."
                );

                console.log(
                    "Returning to WAITING MODE."
                );


                await wait(
                    NEW_DAY_CHECK_INTERVAL
                );

                continue;
            }


            console.log(
                `Next API date check in ${NEW_DAY_CHECK_INTERVAL / 60000
                } minutes.`
            );


            await wait(
                NEW_DAY_CHECK_INTERVAL
            );

            continue;
        }
    }
};


// ==========================================
// START
// ==========================================

startCollector();