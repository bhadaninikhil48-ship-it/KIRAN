import { useState, useEffect } from "react";

function ProfitCalculator() {

    const [formData, setFormData] = useState({
        crop: "",
        quantity: "",
        marketId: "",
        transportCost: "",
        handlingCost: ""
    });

    const [result, setResult] = useState(null);
    const [marketPrices, setMarketPrices] = useState([]);

    useEffect(() => {

        const fetchMarketPrices = async () => {

            try {

                const response = await fetch(
                    "http://localhost:5000/api/market/prices"
                );

                const data = await response.json();

                if (response.ok) {
                    setMarketPrices(data.prices);
                }

            } catch (error) {
                console.error(error);
            }
        };

        fetchMarketPrices();

    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const calculateProfit = (e) => {

        e.preventDefault();

        const quantity = Number(formData.quantity);
        const transportCost = Number(formData.transportCost);
        const handlingCost = Number(formData.handlingCost);

        const selectedMarket = marketPrices.find(
            (market) => market.id === Number(formData.marketId)
        );

        if (!selectedMarket) {
            return;
        }

        // Modal price is stored per quintal.
        // 1 quintal = 100 kg.
        const sellingPricePerKg =
            Number(selectedMarket.modal_price) / 100;

        const grossRevenue = quantity * sellingPricePerKg;

        const totalCost =
            transportCost + handlingCost;

        const netRealization =
            grossRevenue - totalCost;

        setResult({
            grossRevenue,
            totalCost,
            netRealization,
            sellingPricePerKg,
            marketName: selectedMarket.market_name
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">

            <div className="mx-auto max-w-4xl">

                {/* Heading */}
                <div className="mb-8">

                    <h1 className="text-3xl font-bold text-gray-800">
                        Smart Profit Calculator
                    </h1>

                    <p className="mt-1 text-gray-500">
                        Calculate your actual profit after market and transport costs.
                    </p>

                </div>


                {/* Calculator Form */}
                <div className="rounded-xl bg-white p-6 shadow">

                    <form
                        onSubmit={calculateProfit}
                        className="space-y-5"
                    >

                        {/* Crop */}
                        <div>

                            <label className="mb-2 block font-medium text-gray-700">
                                Crop
                            </label>

                            <select
                                name="crop"
                                value={formData.crop}
                                onChange={(e) => {
                                    setFormData({
                                        ...formData,
                                        crop: e.target.value,
                                        marketId: ""
                                    });
                                }}
                                required
                                className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-green-500"
                            >

                                <option value="">
                                    Select Crop
                                </option>

                                {[...new Set(
                                    marketPrices.map((item) => item.crop_name)
                                )].map((crop) => (
                                    <option
                                        key={crop}
                                        value={crop}
                                    >
                                        {crop}
                                    </option>
                                ))}

                            </select>

                        </div>

                        <div>

                            <label className="mb-2 block font-medium text-gray-700">
                                Select Market
                            </label>

                            <select
                                name="marketId"
                                value={formData.marketId}
                                onChange={handleChange}
                                required
                                disabled={!formData.crop}
                                className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-green-500 disabled:bg-gray-100"
                            >

                                <option value="">
                                    {formData.crop
                                        ? "Select Market"
                                        : "Select Crop First"}
                                </option>

                                {marketPrices
                                    .filter(
                                        (market) =>
                                            market.crop_name === formData.crop
                                    )
                                    .map((market) => (
                                        <option
                                            key={market.id}
                                            value={market.id}
                                        >
                                            {market.market_name} - ₹{market.modal_price}/quintal
                                        </option>
                                    ))}

                            </select>

                        </div>


                        {/* Quantity */}
                        <div>

                            <label className="mb-2 block font-medium text-gray-700">
                                Quantity (kg)
                            </label>

                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                placeholder="e.g. 800"
                                min="1"
                                required
                                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-green-500"
                            />

                        </div>


                        {/* Selling Price */}



                        {/* Transport Cost */}
                        <div>

                            <label className="mb-2 block font-medium text-gray-700">
                                Transport Cost (₹)
                            </label>

                            <input
                                type="number"
                                name="transportCost"
                                value={formData.transportCost}
                                onChange={handleChange}
                                placeholder="e.g. 3000"
                                min="0"
                                required
                                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-green-500"
                            />

                        </div>


                        {/* Handling Cost */}
                        <div>

                            <label className="mb-2 block font-medium text-gray-700">
                                Loading / Handling Cost (₹)
                            </label>

                            <input
                                type="number"
                                name="handlingCost"
                                value={formData.handlingCost}
                                onChange={handleChange}
                                placeholder="e.g. 1000"
                                min="0"
                                required
                                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-green-500"
                            />

                        </div>


                        {/* Calculate Button */}
                        <button
                            type="submit"
                            className="w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700"
                        >
                            Calculate Profit
                        </button>

                    </form>

                </div>


                {/* Result */}
                {result && (

                    <div className="mt-8 rounded-xl bg-white p-6 shadow">

                        <h2 className="mb-5 text-2xl font-bold text-gray-800">
                            Profit Summary
                        </h2>

                        <div className="mb-5 rounded-lg bg-gray-50 p-4">

                            <p className="text-sm text-gray-500">
                                Selected Market
                            </p>

                            <p className="font-semibold text-gray-800">
                                {result.marketName}
                            </p>

                            <p className="mt-3 text-sm text-gray-500">
                                Selling Price
                            </p>

                            <p className="font-semibold text-green-600">
                                ₹{result.sellingPricePerKg.toFixed(2)} / kg
                            </p>

                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                            <div className="rounded-lg bg-blue-50 p-4">

                                <p className="text-sm text-gray-500">
                                    Gross Revenue
                                </p>

                                <p className="mt-1 text-2xl font-bold text-blue-600">
                                    ₹{result.grossRevenue.toFixed(2)}
                                </p>

                            </div>


                            <div className="rounded-lg bg-red-50 p-4">

                                <p className="text-sm text-gray-500">
                                    Total Cost
                                </p>

                                <p className="mt-1 text-2xl font-bold text-red-600">
                                    ₹{result.totalCost.toFixed(2)}
                                </p>

                            </div>


                            <div className="rounded-lg bg-green-50 p-4">

                                <p className="text-sm text-gray-500">
                                    Net Realization
                                </p>

                                <p className="mt-1 text-2xl font-bold text-green-600">
                                    ₹{result.netRealization.toFixed(2)}
                                </p>

                            </div>

                        </div>

                    </div>

                )}

            </div>

        </div>
    );
}

export default ProfitCalculator;