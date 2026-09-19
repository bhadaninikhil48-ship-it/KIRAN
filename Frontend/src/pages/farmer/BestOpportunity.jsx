import { useEffect, useState } from "react";

function BestOpportunity() {

    const [marketPrices, setMarketPrices] = useState([]);
    const [selectedCrop, setSelectedCrop] = useState("");
    const [opportunity, setOpportunity] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {

        const fetchMarketPrices = async () => {

            try {

                const response = await fetch(
                    "http://localhost:5000/api/market/prices"
                );

                const data = await response.json();

                if (response.ok) {
                    setMarketPrices(data.prices);
                } else {
                    setError(data.message);
                }

            } catch (error) {

                console.error(error);
                setError("Unable to fetch market data");

            }
        };

        fetchMarketPrices();

    }, []);

    const crops = [
        ...new Set(
            marketPrices.map((item) => item.crop_name)
        )
    ];

    const findOpportunity = async () => {

        if (!selectedCrop) {
            setError("Please select a crop");
            setOpportunity(null);
            return;
        }

        try {

            setError("");

            const response = await fetch(
                `http://localhost:5000/api/market/best-opportunity?crop=${encodeURIComponent(selectedCrop)}`
            );

            const data = await response.json();

            if (response.ok) {

                setOpportunity(data.opportunity);

            } else {

                setOpportunity(null);
                setError(data.message);

            }

        } catch (error) {

            console.error(error);

            setOpportunity(null);
            setError("Unable to find best opportunity");

        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">

            <div className="mx-auto max-w-4xl">

                {/* Heading */}
                <div className="mb-8">

                    <h1 className="text-3xl font-bold text-gray-800">
                        Best Selling Opportunity
                    </h1>

                    <p className="mt-1 text-gray-500">
                        Find the market offering the highest available price.
                    </p>

                </div>


                {/* Crop Selection */}
                <div className="rounded-xl bg-white p-6 shadow">

                    <label className="mb-2 block font-medium text-gray-700">
                        Select Crop
                    </label>

                    <select
                        value={selectedCrop}
                        onChange={(e) => {
                            setSelectedCrop(e.target.value);
                            setOpportunity(null);
                            setError("");
                        }}
                        className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-green-500"
                    >

                        <option value="">
                            Select Crop
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
                        onClick={findOpportunity}
                        className="mt-4 w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700"
                    >
                        Find Best Opportunity
                    </button>

                </div>


                {/* Error */}
                {error && (
                    <div className="mt-6 rounded-lg bg-red-100 p-4 text-red-700">
                        {error}
                    </div>
                )}


                {/* Opportunity Result */}
                {opportunity && (

                    <div className="mt-8 rounded-xl bg-white p-6 shadow">

                        <div className="mb-6">

                            <p className="text-sm font-medium text-green-600">
                                Recommended Market
                            </p>

                            <h2 className="mt-1 text-2xl font-bold text-gray-800">
                                {opportunity.market_name}
                            </h2>

                            <p className="text-gray-500">
                                {opportunity.district}, {opportunity.state}
                            </p>

                        </div>


                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                            {/* Price */}
                            <div className="rounded-lg bg-green-50 p-4">

                                <p className="text-sm text-gray-500">
                                    Modal Price
                                </p>

                                <p className="mt-1 text-2xl font-bold text-green-600">
                                    ₹{opportunity.modal_price}
                                </p>

                                <p className="text-xs text-gray-500">
                                    per {opportunity.arrival_unit}
                                </p>

                            </div>


                            {/* Arrival */}
                            <div className="rounded-lg bg-gray-50 p-4">

                                <p className="text-sm text-gray-500">
                                    Market Arrival
                                </p>

                                <p className="mt-1 text-xl font-bold text-gray-800">
                                    {opportunity.arrival_quantity}
                                </p>

                                <p className="text-xs text-gray-500">
                                    {opportunity.arrival_unit}
                                </p>

                            </div>


                            {/* Date */}
                            <div className="rounded-lg bg-gray-50 p-4">

                                <p className="text-sm text-gray-500">
                                    Price Date
                                </p>

                                <p className="mt-1 text-xl font-bold text-gray-800">
                                    {opportunity.price_date}
                                </p>

                            </div>

                        </div>

                    </div>

                )}

            </div>

        </div>
    );
}

export default BestOpportunity;