import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";

function Offers() {

    const { token } = useContext(AuthContext);

    const [offers, setOffers] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {

        const fetchOffers = async () => {

            try {

                const response = await fetch(
                    "http://localhost:5000/api/offers/buyer",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (response.ok) {
                    setOffers(data.offers);
                } else {
                    setError(data.message);
                }

            } catch (error) {

                console.error(error);
                setError("Unable to fetch offers");

            }
        };

        if (token) {
            fetchOffers();
        }

    }, [token]);

    const handleStatusUpdate = async (offerId, status) => {
    try {
        const response = await fetch(
            `http://localhost:5000/api/offers/${offerId}/status`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            setError(data.message);
            return;
        }

        setOffers((prevOffers) =>
            prevOffers.map((offer) =>
                offer.id === offerId
                    ? { ...offer, status }
                    : offer
            )
        );

    } catch (error) {
        console.error(error);
        setError("Unable to update offer status");
    }
};

    return (
        <div className="min-h-screen bg-gray-50 p-6">

            <div className="mx-auto max-w-6xl">

                {/* Heading */}
                <div className="mb-8">

                    <h1 className="text-3xl font-bold text-gray-800">
                        Offers Received
                    </h1>

                    <p className="mt-1 text-gray-500">
                        Review offers submitted by farmers.
                    </p>

                </div>


                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
                        {error}
                    </div>
                )}


                {/* Empty State */}
                {offers.length === 0 && !error ? (

                    <div className="rounded-xl bg-white p-8 text-center shadow">

                        <p className="text-gray-500">
                            No offers received yet.
                        </p>

                    </div>

                ) : (

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                        {offers.map((offer) => (

                            <div
                                key={offer.id}
                                className="rounded-xl bg-white p-5 shadow"
                            >

                                {/* Header */}
                                <div className="mb-4 flex items-start justify-between">

                                    <div>

                                        <h2 className="text-xl font-bold text-gray-800">
                                            {offer.crop_name}
                                        </h2>

                                        <p className="text-sm text-gray-500">
                                            Farmer: {offer.farmer_name}
                                        </p>

                                    </div>

                                    <span
                                        className={`rounded-full px-3 py-1 text-sm font-medium ${
                                            offer.status === "pending"
                                                ? "bg-yellow-100 text-yellow-700"
                                                : offer.status === "accepted"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                        }`}
                                    >
                                        {offer.status}
                                    </span>

                                </div>


                                {/* Offer Details */}
                                <div className="grid grid-cols-2 gap-3">

                                    <div className="rounded-lg bg-gray-50 p-3">

                                        <p className="text-xs text-gray-500">
                                            Offered Quantity
                                        </p>

                                        <p className="mt-1 font-semibold text-gray-800">
                                            {offer.quantity} {offer.unit}
                                        </p>

                                    </div>


                                    <div className="rounded-lg bg-green-50 p-3">

                                        <p className="text-xs text-gray-500">
                                            Offer Price
                                        </p>

                                        <p className="mt-1 font-semibold text-green-600">
                                            ₹{offer.offer_price}
                                        </p>

                                    </div>


                                    <div className="rounded-lg bg-gray-50 p-3">

                                        <p className="text-xs text-gray-500">
                                            Your Maximum Price
                                        </p>

                                        <p className="mt-1 font-semibold text-gray-800">
                                            {offer.max_price
                                                ? `₹${offer.max_price}`
                                                : "Not specified"}
                                        </p>

                                    </div>


                                    <div className="rounded-lg bg-gray-50 p-3">

                                        <p className="text-xs text-gray-500">
                                            Quality
                                        </p>

                                        <p className="mt-1 font-semibold text-gray-800">
                                            {offer.quality_grade || "Any"}
                                        </p>

                                    </div>

                                </div>


                                {/* Farmer Message */}
                                {offer.message && (

                                    <div className="mt-4 rounded-lg bg-blue-50 p-4">

                                        <p className="text-xs text-gray-500">
                                            Farmer Message
                                        </p>

                                        <p className="mt-1 text-sm text-gray-700">
                                            {offer.message}
                                        </p>

                                    </div>

                                )}


                                {/* Location */}
                                <div className="mt-4 border-t pt-4">

                                    <p className="text-sm text-gray-500">
                                        Location
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-gray-800">
                                        {offer.location || "Not specified"}
                                    </p>

                                </div>


                                {/* Actions */}
                                {offer.status === "pending" && (

                                    <div className="mt-5 flex gap-3">

                                        <button
                                            type="button"
                                            onClick={() => handleStatusUpdate(offer.id, "accepted")}
                                            className="flex-1 rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
                                        >
                                            Accept
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleStatusUpdate(offer.id, "rejected")}
                                            className="flex-1 rounded-lg bg-red-100 px-4 py-2 font-medium text-red-700 hover:bg-red-200"
                                        >
                                            Reject
                                        </button>

                                    </div>

                                )}

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </div>
    );
}

export default Offers;