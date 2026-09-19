import { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

function CreateOffer() {

    const { token } = useContext(AuthContext);

    const location = useLocation();
    const navigate = useNavigate();

    const requirement = location.state?.requirement;

    const [formData, setFormData] = useState({
        offer_price: "",
        quantity: "",
        message: ""
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    if (!requirement) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">

                <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 text-center shadow">

                    <h1 className="text-2xl font-bold text-gray-800">
                        Requirement Not Found
                    </h1>

                    <p className="mt-2 text-gray-500">
                        Please select a buyer requirement first.
                    </p>

                    <button
                        onClick={() => navigate("/farmer/find-buyers")}
                        className="mt-5 rounded-lg bg-green-600 px-5 py-2 font-medium text-white hover:bg-green-700"
                    >
                        Back to Find Buyers
                    </button>

                </div>

            </div>
        );
    }

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");

        try {

            const response = await fetch(
                "http://localhost:5000/api/offers",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        requirement_id: requirement.id,
                        offer_price: formData.offer_price,
                        quantity: formData.quantity,
                        message: formData.message
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {

                setMessage(data.message);

                setFormData({
                    offer_price: "",
                    quantity: "",
                    message: ""
                });

            } else {

                setError(data.message);

            }

        } catch (error) {

            console.error(error);
            setError("Unable to create offer");

        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">

            <div className="mx-auto max-w-3xl">

                {/* Heading */}
                <div className="mb-8">

                    <h1 className="text-3xl font-bold text-gray-800">
                        Make an Offer
                    </h1>

                    <p className="mt-1 text-gray-500">
                        Respond to the buyer's requirement.
                    </p>

                </div>


                {/* Buyer Requirement */}
                <div className="mb-6 rounded-xl bg-white p-6 shadow">

                    <p className="text-sm font-medium text-green-600">
                        Buyer Requirement
                    </p>

                    <h2 className="mt-1 text-2xl font-bold text-gray-800">
                        {requirement.crop_name}
                    </h2>

                    <div className="mt-4 grid grid-cols-2 gap-3">

                        <div className="rounded-lg bg-gray-50 p-3">

                            <p className="text-xs text-gray-500">
                                Required Quantity
                            </p>

                            <p className="mt-1 font-semibold text-gray-800">
                                {requirement.quantity} {requirement.unit}
                            </p>

                        </div>


                        <div className="rounded-lg bg-gray-50 p-3">

                            <p className="text-xs text-gray-500">
                                Quality
                            </p>

                            <p className="mt-1 font-semibold text-gray-800">
                                {requirement.quality_grade || "Any"}
                            </p>

                        </div>


                        <div className="rounded-lg bg-gray-50 p-3">

                            <p className="text-xs text-gray-500">
                                Buyer's Maximum Price
                            </p>

                            <p className="mt-1 font-semibold text-green-600">
                                {requirement.max_price
                                    ? `₹${requirement.max_price}`
                                    : "Not specified"}
                            </p>

                        </div>


                        <div className="rounded-lg bg-gray-50 p-3">

                            <p className="text-xs text-gray-500">
                                Location
                            </p>

                            <p className="mt-1 font-semibold text-gray-800">
                                {requirement.location || "Not specified"}
                            </p>

                        </div>

                    </div>

                </div>


                {/* Messages */}
                {message && (
                    <div className="mb-6 rounded-lg bg-green-100 p-4 text-green-700">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
                        {error}
                    </div>
                )}


                {/* Offer Form */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 rounded-xl bg-white p-6 shadow"
                >

                    {/* Offer Price */}
                    <div>

                        <label className="mb-2 block font-medium text-gray-700">
                            Your Offer Price (₹)
                        </label>

                        <input
                            type="number"
                            name="offer_price"
                            value={formData.offer_price}
                            onChange={handleChange}
                            placeholder="e.g. 29"
                            min="0"
                            step="0.01"
                            required
                            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-green-500"
                        />

                    </div>


                    {/* Quantity */}
                    <div>

                        <label className="mb-2 block font-medium text-gray-700">
                            Quantity You Can Supply ({requirement.unit})
                        </label>

                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            placeholder={`e.g. ${requirement.quantity}`}
                            min="1"
                            required
                            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-green-500"
                        />

                    </div>


                    {/* Message */}
                    <div>

                        <label className="mb-2 block font-medium text-gray-700">
                            Message
                        </label>

                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Add a message for the buyer..."
                            rows="4"
                            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-green-500"
                        />

                    </div>


                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700"
                    >
                        Submit Offer
                    </button>

                </form>

            </div>

        </div>
    );
}

export default CreateOffer;