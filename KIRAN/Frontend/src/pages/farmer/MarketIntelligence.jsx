import { useEffect, useState } from "react";

function MarketIntelligence() {

    const [prices, setPrices] = useState([]);
    const [error, setError] = useState("");
    const [selectedCrop, setSelectedCrop] = useState("all");

    const [comparison, setComparison] = useState([]);
    const [comparisonError, setComparisonError] = useState("");

    useEffect(() => {

        const fetchMarketPrices = async () => {

            try {

                const response = await fetch(
                    "http://localhost:5000/api/market/prices"
                );

                const data = await response.json();

                if (response.ok) {
                    setPrices(data.prices);
                } else {
                    setError(data.message);
                }

            } catch (error) {
                console.error(error);
                setError("Unable to fetch market prices");
            }
        };

        fetchMarketPrices();

    }, []);

    // Get unique crop names
    const crops = [...new Set(
        prices.map((item) => item.crop_name)
    )];

    // Filter market cards according to selected crop
    const filteredPrices =
        selectedCrop === "all"
            ? prices
            : prices.filter(
                (item) => item.crop_name === selectedCrop
            );

    // Compare selected crop across markets
    const handleCompare = async () => {

        if (selectedCrop === "all") {
            setComparisonError("Please select a crop first");
            setComparison([]);
            return;
        }

        try {

            const response = await fetch(
                `http://localhost:5000/api/market/compare?crop=${encodeURIComponent(selectedCrop)}`
            );

            const data = await response.json();

            if (response.ok) {

                setComparison(data.markets);
                setComparisonError("");

            } else {

                setComparisonError(data.message);
                setComparison([]);

            }

        } catch (error) {

            console.error(error);

            setComparisonError("Unable to compare markets");
            setComparison([]);

        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">

            <div className="mx-auto max-w-6xl">

                {/* Heading */}
                <div className="mb-8">

                    <h1 className="text-3xl font-bold text-gray-800">
                        Market Intelligence
                    </h1>

                    <p className="mt-1 text-gray-500">
                        Compare crop prices across nearby markets.
                    </p>

                </div>


                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-lg bg-red-100 p-3 text-red-700">
                        {error}
                    </div>
                )}


                {/* Crop Filter */}
                <div className="mb-8 max-w-xs">

                    <label className="mb-2 block font-medium text-gray-700">
                        Select Crop
                    </label>

                    <select
                        value={selectedCrop}
                        onChange={(e) => {
                            setSelectedCrop(e.target.value);
                            setComparison([]);
                            setComparisonError("");
                        }}
                        className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-green-500"
                    >

                        <option value="all">
                            All Crops
                        </option>

                        {crops.map((crop) => (
                            <option
                                key={crop}
                                value={crop}
                            >
                                {crop}
                            </option>
                        ))}

                    </select>

                    <button
                        onClick={handleCompare}
                        className="mt-3 w-full rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
                    >
                        Compare Markets
                    </button>

                </div>


                {/* Comparison Error */}
                {comparisonError && (
                    <div className="mb-6 rounded-lg bg-yellow-100 p-3 text-yellow-800">
                        {comparisonError}
                    </div>
                )}


                {/* Market Comparison */}
                {comparison.length > 0 && (

                    <div className="mb-10">

                        <div className="mb-4">

                            <h2 className="text-2xl font-bold text-gray-800">
                                Market Comparison
                            </h2>

                            <p className="text-sm text-gray-500">
                                {selectedCrop} price comparison across markets
                            </p>

                        </div>


                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

                            {comparison.map((market, index) => (

                                <div
                                    key={`${market.market_name}-${index}`}
                                    className="rounded-xl bg-white p-5 shadow"
                                >

                                    <div className="mb-4">

                                        <h3 className="text-xl font-bold text-gray-800">
                                            {market.market_name}
                                        </h3>

                                        <p className="text-sm text-gray-500">
                                            {market.district}, {market.state}
                                        </p>

                                    </div>


                                    <div className="rounded-lg bg-green-50 p-4">

                                        <p className="text-sm text-gray-500">
                                            Modal Price
                                        </p>

                                        <p className="mt-1 text-2xl font-bold text-green-600">
                                            ₹{market.modal_price}
                                        </p>

                                        <p className="text-xs text-gray-500">
                                            per {market.arrival_unit}
                                        </p>

                                    </div>


                                    <div className="mt-4 grid grid-cols-2 gap-3">

                                        <div className="rounded-lg bg-gray-50 p-3">

                                            <p className="text-xs text-gray-500">
                                                Min Price
                                            </p>

                                            <p className="mt-1 font-semibold text-gray-800">
                                                ₹{market.min_price}
                                            </p>

                                        </div>


                                        <div className="rounded-lg bg-gray-50 p-3">

                                            <p className="text-xs text-gray-500">
                                                Max Price
                                            </p>

                                            <p className="mt-1 font-semibold text-gray-800">
                                                ₹{market.max_price}
                                            </p>

                                        </div>

                                    </div>


                                    <div className="mt-4 border-t pt-4">

                                        <p className="text-sm text-gray-500">
                                            Market Arrival
                                        </p>

                                        <p className="mt-1 font-medium text-gray-800">
                                            {market.arrival_quantity}{" "}
                                            {market.arrival_unit}
                                        </p>

                                    </div>

                                </div>

                            ))}

                        </div>

                    </div>

                )}


                {/* Existing Market Cards */}
                {prices.length === 0 ? (

                    <div className="rounded-xl bg-white p-8 text-center shadow">

                        <p className="text-gray-500">
                            No market data available.
                        </p>

                    </div>

                ) : filteredPrices.length === 0 ? (

                    <div className="rounded-xl bg-white p-8 text-center shadow">

                        <p className="text-gray-500">
                            No market data available for {selectedCrop}.
                        </p>

                    </div>

                ) : (

                    <div>

                        <h2 className="mb-4 text-2xl font-bold text-gray-800">
                            Market Prices
                        </h2>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                            {filteredPrices.map((item) => (

                                <div
                                    key={item.id}
                                    className="rounded-xl bg-white p-5 shadow"
                                >

                                    {/* Card Header */}
                                    <div className="mb-4 flex items-start justify-between">

                                        <div>

                                            <h2 className="text-xl font-bold text-gray-800">
                                                {item.crop_name}
                                            </h2>

                                            <p className="text-sm text-gray-500">
                                                {item.market_name}
                                            </p>

                                        </div>

                                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                                            {item.price_date}
                                        </span>

                                    </div>


                                    {/* Prices */}
                                    <div className="grid grid-cols-3 gap-3">

                                        <div className="rounded-lg bg-gray-50 p-3">

                                            <p className="text-xs text-gray-500">
                                                Min Price
                                            </p>

                                            <p className="mt-1 font-semibold text-gray-800">
                                                ₹{item.min_price}
                                            </p>

                                        </div>


                                        <div className="rounded-lg bg-gray-50 p-3">

                                            <p className="text-xs text-gray-500">
                                                Modal Price
                                            </p>

                                            <p className="mt-1 font-semibold text-green-600">
                                                ₹{item.modal_price}
                                            </p>

                                        </div>


                                        <div className="rounded-lg bg-gray-50 p-3">

                                            <p className="text-xs text-gray-500">
                                                Max Price
                                            </p>

                                            <p className="mt-1 font-semibold text-gray-800">
                                                ₹{item.max_price}
                                            </p>

                                        </div>

                                    </div>


                                    {/* Market Arrival */}
                                    <div className="mt-4 border-t pt-4">

                                        <p className="text-sm text-gray-500">
                                            Market Arrival
                                        </p>

                                        <p className="mt-1 font-medium text-gray-800">
                                            {item.arrival_quantity}{" "}
                                            {item.arrival_unit}
                                        </p>

                                    </div>

                                </div>

                            ))}

                        </div>

                    </div>

                )}

            </div>

        </div>
    );
}

export default MarketIntelligence;