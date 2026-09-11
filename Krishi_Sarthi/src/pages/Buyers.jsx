import { useState } from "react";

function Buyers() {

    const [selectedBuyer, setSelectedBuyer] = useState(null);

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Find Buyers
                </h1>

                <p className="mt-2 text-gray-500">
                    Find reliable buyers for your produce.
                </p>
            </div>

            {/* Buyers */}
            <div className="space-y-4">

                {/* Buyer 1 */}
                <div className="bg-white border border-green-500 rounded-xl p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                FreshMart
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">
                                Indore • Tomato Buyer
                            </p>
                        </div>

                        <span className="text-green-600 font-semibold">
                            94% Reliable
                        </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-5">
                        <div>
                            <p className="text-xs text-gray-500">
                                Demand
                            </p>
                            <p className="font-semibold">
                                High
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">
                                Payment
                            </p>
                            <p className="font-semibold">
                                3 Days
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">
                                Expected Price
                            </p>
                            <p className="font-semibold text-green-600">
                                ₹2,520/q
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setSelectedBuyer("FreshMart")}
                        className="mt-5 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                    >
                        Contact Buyer
                    </button>
                </div>

                {/* Buyer 2 */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Local Trader
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">
                                Bhopal • Tomato Buyer
                            </p>
                        </div>

                        <span className="text-gray-600 font-semibold">
                            68% Reliable
                        </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-5">
                        <div>
                            <p className="text-xs text-gray-500">
                                Demand
                            </p>
                            <p className="font-semibold">
                                Low
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">
                                Payment
                            </p>
                            <p className="font-semibold">
                                7–10 Days
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">
                                Expected Price
                            </p>
                            <p className="font-semibold">
                                ₹2,280/q
                            </p>
                        </div>
                    </div>

                    <button className="mt-5 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-900">
                        Contact Buyer
                    </button>
                </div>

                {selectedBuyer && (
                    <div className="mt-5 bg-white border border-green-200 rounded-xl p-5">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Send Offer to {selectedBuyer}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quantity (kg)
                                </label>

                                <input
                                    type="number"
                                    defaultValue="800"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Price (₹/quintal)
                                </label>

                                <input
                                    type="number"
                                    defaultValue="2520"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>
                        </div>

                        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="font-medium text-yellow-800">
                                ⚠ MSP Gap Alert
                            </p>

                            <p className="text-sm text-yellow-700 mt-1">
                                Compare the buyer's offer with the applicable MSP before accepting the deal.
                            </p>

                            <p className="text-sm font-semibold text-gray-800 mt-2">
                                Example: Offer ₹2,400/q • Applicable MSP ₹2,500/q
                            </p>

                            <p className="text-sm text-red-600 mt-1">
                                Farmer may receive ₹100/q less than MSP.
                            </p>
                        </div>

                        {/* Flexible Delivery */}
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Preferred Delivery Date
                            </label>

                            <input
                                type="date"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />

                            <p className="text-xs text-gray-500 mt-1">
                                Buyer and farmer can mutually agree on the final delivery date.
                            </p>
                        </div>

                        <button
                            onClick={() => alert("Offer sent successfully!")}
                            className="mt-5 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
                        >
                            Send Offer
                        </button>


                    </div>
                )}

            </div>
        </div>
    );
}

export default Buyers;