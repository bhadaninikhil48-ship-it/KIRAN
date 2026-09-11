import { useState } from "react";

function Offers() {

    const [status, setStatus] = useState("Pending");

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    My Offers
                </h1>

                <p className="mt-2 text-gray-500">
                    Track your offers and buyer responses.
                </p>
            </div>

            {/* Offer Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">
                            FreshMart
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Tomato • 800 kg • Grade A
                        </p>
                    </div>

                    <span
                        className={`px-3 py-1 rounded-full text-sm ${status === "Accepted"
                            ? "bg-green-100 text-green-700"
                            : status === "Rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                    >
                        {status}
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-5">
                    <div>
                        <p className="text-xs text-gray-500">
                            Offered Price
                        </p>
                        <p className="font-semibold">
                            ₹2,520/q
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500">
                            Quantity
                        </p>
                        <p className="font-semibold">
                            800 kg
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500">
                            Sent
                        </p>
                        <p className="font-semibold">
                            Today
                        </p>
                    </div>
                </div>
            </div>
            {status === "Pending" && (
                <button
                    onClick={() => setStatus("Accepted")}
                    className="mt-5 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                >
                    Accept Offer
                </button>
            )}
        </div>
    );
}

export default Offers;