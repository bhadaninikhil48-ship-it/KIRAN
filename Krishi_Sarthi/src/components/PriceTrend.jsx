// import {
//     LineChart,
//     Line,
//     XAxis,
//     YAxis,
//     CartesianGrid,
//     Tooltip,
//     ResponsiveContainer,
// } from "recharts";

// import "./PriceTrend.css";

// function PriceTrend() {

//     // Temporary data — later this will come from our backend
//     const data = [
//         { day: "13 Sep", price: 9330 },
//         { day: "14 Sep", price: 9410 },
//         { day: "15 Sep", price: 9360 },
//         { day: "16 Sep", price: 9520 },
//         { day: "17 Sep", price: 9580 },
//         { day: "18 Sep", price: 9680 },
//         { day: "19 Sep", price: 9750 },
//     ];

//     const currentPrice = data[data.length - 1].price;
//     const highestPrice = Math.max(...data.map(item => item.price));
//     const lowestPrice = Math.min(...data.map(item => item.price));

//     const priceChange = currentPrice - data[0].price;

//     return (
//         <div className="price-trend">

//             {/* Crop Information */}
//             <div className="price-trend-header">

//                 <h2>🌾 Ground Nut Seed</h2>

//                 <p className="market-name">
//                     Rajkot APMC
//                 </p>

//             </div>


//             {/* Current Price */}
//             <div className="current-price">

//                 <p>आज का भाव</p>

//                 <h1>
//                     ₹{currentPrice.toLocaleString("en-IN")}
//                     <span> / क्विंटल</span>
//                 </h1>

//             </div>


//             {/* 7 Day Trend */}
//             <div className="trend-section">

//                 <h3>📈 7 दिन का भाव</h3>

//                 <div className="chart-container">

//                     <ResponsiveContainer
//                         width="100%"
//                         height={280}
//                     >
//                         <LineChart data={data}>

//                             <CartesianGrid
//                                 strokeDasharray="3 3"
//                             />

//                             <XAxis
//                                 dataKey="day"
//                             />

//                             <YAxis
//                                 domain={["dataMin - 100", "dataMax + 100"]}
//                             />

//                             <Tooltip
//                                 formatter={(value) => [
//                                     `₹${value.toLocaleString("en-IN")}`,
//                                     "भाव",
//                                 ]}
//                             />

//                             <Line
//                                 type="monotone"
//                                 dataKey="price"
//                                 stroke="#16a34a"
//                                 strokeWidth={3}
//                                 dot={{
//                                     r: 5,
//                                 }}
//                                 activeDot={{
//                                     r: 7,
//                                 }}
//                             />

//                         </LineChart>
//                     </ResponsiveContainer>

//                 </div>

//             </div>


//             {/* Simple Explanation */}
//             <div className="seedhi-baat">

//                 <h3>📢 Seedhi Baat</h3>

//                 <p>
//                     Bhav pichhle 7 din me
//                 </p>

//                 <strong>
//                     ₹{priceChange.toLocaleString("en-IN")} / क्विंटल
//                     badha hai.
//                 </strong>

//             </div>


//             {/* Highest / Lowest */}
//             <div className="price-summary">

//                 <div className="price-box">

//                     <span>🔝 Sabse zyada</span>

//                     <strong>
//                         ₹{highestPrice.toLocaleString("en-IN")}
//                     </strong>

//                 </div>


//                 <div className="price-box">

//                     <span>🔻 Sabse kam</span>

//                     <strong>
//                         ₹{lowestPrice.toLocaleString("en-IN")}
//                     </strong>

//                 </div>

//             </div>

//         </div>
//     );
// }

// export default PriceTrend;

















import { useEffect, useState } from "react";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";


import "./PriceTrend.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
function PriceTrend({
    state = "Gujarat",
    district = "Rajkot",
    market = "Rajkot APMC",
    commodity = "Ground Nut Seed",
    variety = "",
    grade = "",
}) {



    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const fetchPriceHistory = async () => {

            try {

                setLoading(true);

                const url =
                    `${API_BASE_URL}/price/history` +
                    `?state=${encodeURIComponent(state)}` +
                    `&district=${encodeURIComponent(district)}` +
                    `&market=${encodeURIComponent(market)}` +
                    `&commodity=${encodeURIComponent(commodity)}` +
                    `&variety=${encodeURIComponent(variety)}` +
                    `&grade=${encodeURIComponent(grade)}`;


                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error("Failed to fetch price history");
                }

                const result = await response.json();

                console.log("PRICE HISTORY =", result);

                const formattedData = (result.records || []).map(record => ({
                    day: new Date(record.arrival_date).toLocaleDateString(
                        "en-IN",
                        {
                            day: "numeric",
                            month: "short",
                        }
                    ),
                    price: Number(record.modal_price),
                }));

                setData(formattedData);

            } catch (error) {

                console.error(
                    "Price history error =",
                    error
                );

                setData([]);

            } finally {

                setLoading(false);

            }
        };

        fetchPriceHistory();

    }, [state, district, market, commodity, variety, grade]);


    if (loading) {
        return (
            <div className="price-trend">
                <p>भाव की जानकारी लोड हो रही है...</p>
            </div>
        );
    }


    if (data.length === 0) {
        return (
            <div className="price-trend">

                <div className="price-trend-header">
                    <h2>🌾 {commodity}</h2>

                    <p className="market-name">
                        {market}
                    </p>
                </div>

                <div className="seedhi-baat">
                    <h3>📢 Seedhi Baat</h3>

                    <p>
                        इस फसल के पिछले 7 दिनों का भाव
                        अभी उपलब्ध नहीं है।
                    </p>
                </div>

            </div>
        );
    }


    const currentPrice =
        data[data.length - 1].price;

    const highestPrice =
        Math.max(...data.map(item => item.price));

    const lowestPrice =
        Math.min(...data.map(item => item.price));

    const priceChange =
        currentPrice - data[0].price;


    return (
        <div className="price-trend">

            <div className="price-trend-header">

                <h2>
                    🌾 {commodity}
                </h2>

                <p className="market-name">
                    {market}
                </p>

            </div>


            <div className="current-price">

                <p>आज का भाव</p>

                <h1>
                    ₹{currentPrice.toLocaleString("en-IN")}
                    <span> / क्विंटल</span>
                </h1>

            </div>


            <div className="trend-section">

                <h3>
                    📈 7 दिन का भाव
                </h3>

                <div className="chart-container">

                    <ResponsiveContainer
                        width="100%"
                        height={280}
                    >

                        <LineChart data={data}>

                            <CartesianGrid
                                strokeDasharray="3 3"
                            />

                            <XAxis
                                dataKey="day"
                            />

                            <YAxis
                                domain={[
                                    "dataMin - 100",
                                    "dataMax + 100"
                                ]}
                            />

                            <Tooltip
                                formatter={(value) => [
                                    `₹${Number(value).toLocaleString("en-IN")}`,
                                    "भाव",
                                ]}
                            />

                            <Line
                                type="monotone"
                                dataKey="price"
                                stroke="#16a34a"
                                strokeWidth={3}
                                dot={{ r: 5 }}
                                activeDot={{ r: 7 }}
                            />

                        </LineChart>

                    </ResponsiveContainer>

                </div>

            </div>


            <div className="seedhi-baat">

                <h3>
                    📢 Seedhi Baat
                </h3>

                {priceChange > 0 && (
                    <>
                        <p>
                            Bhav pichhle 7 din me
                        </p>

                        <strong>
                            ↗ ₹{priceChange.toLocaleString("en-IN")}
                            {" "} / क्विंटल badha hai.
                        </strong>
                    </>
                )}

                {priceChange < 0 && (
                    <>
                        <p>
                            Bhav pichhle 7 din me
                        </p>

                        <strong>
                            ↘ ₹{Math.abs(priceChange).toLocaleString("en-IN")}
                            {" "} / क्विंटल ghata hai.
                        </strong>
                    </>
                )}

                {priceChange === 0 && (
                    <strong>
                        → Bhav pichhle 7 din me lagbhag same raha hai.
                    </strong>
                )}

            </div>


            <div className="price-summary">

                <div className="price-box">

                    <span>
                        🔝 Sabse zyada
                    </span>

                    <strong>
                        ₹{highestPrice.toLocaleString("en-IN")}
                    </strong>

                </div>


                <div className="price-box">

                    <span>
                        🔻 Sabse kam
                    </span>

                    <strong>
                        ₹{lowestPrice.toLocaleString("en-IN")}
                    </strong>

                </div>

            </div>

        </div>
    );
}

export default PriceTrend;

