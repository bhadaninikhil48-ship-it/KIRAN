import { useState } from "react";

function TrustSupport() {

    const [showComplaint, setShowComplaint] = useState(false);

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Trust & Support
                </h1>

                <p className="mt-2 text-gray-500">
                    Manage ratings, complaints and transaction support.
                </p>
            </div>

            {/* Buyer Rating */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h2 className="text-lg font-semibold text-gray-800">
                    Rate Your Buyer
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                    FreshMart • Recent Transaction
                </p>

                <div className="flex gap-2 mt-4">
                    <button className="text-2xl">⭐</button>
                    <button className="text-2xl">⭐</button>
                    <button className="text-2xl">⭐</button>
                    <button className="text-2xl">⭐</button>
                    <button className="text-2xl">⭐</button>
                </div>
            </div>

            {/* Complaint */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 mt-5">
                <h2 className="text-lg font-semibold text-gray-800">
                    Need Help?
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                    Report a payment, delivery or buyer-related issue.
                </p>

                <button
                    onClick={() => setShowComplaint(true)}
                    className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
                >
                    Raise a Complaint
                </button>

                {showComplaint && (
                    <div className="mt-5 border-t border-gray-200 pt-5">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Issue Type
                        </label>

                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                            <option>Payment Issue</option>
                            <option>Delivery Issue</option>
                            <option>Buyer Issue</option>
                            <option>Other</option>
                        </select>

                        <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">
                            Description
                        </label>

                        <textarea
                            rows="4"
                            placeholder="Describe your issue..."
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />

                        <button
                            onClick={() => alert("Complaint submitted successfully!")}
                            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
                        >
                            Submit Complaint
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TrustSupport;