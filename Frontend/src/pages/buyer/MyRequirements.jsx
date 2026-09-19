import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";

function MyRequirements() {

    const { token } = useContext(AuthContext);

    const [requirements, setRequirements] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {

        const fetchRequirements = async () => {

            try {

                const response = await fetch(
                    "http://localhost:5000/api/buyer/requirements/my",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (response.ok) {
                    setRequirements(data.requirements);
                } else {
                    setError(data.message);
                }

            } catch (error) {

                console.error(error);
                setError("Unable to fetch requirements");

            }
        };

        if (token) {
            fetchRequirements();
        }

    }, [token]);

    return (
        <div className="min-h-screen bg-gray-50 p-6">

            <div className="mx-auto max-w-6xl">

                {/* Heading */}
                <div className="mb-8">

                    <h1 className="text-3xl font-bold text-gray-800">
                        My Requirements
                    </h1>

                    <p className="mt-1 text-gray-500">
                        View the produce requirements you have posted.
                    </p>

                </div>


                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
                        {error}
                    </div>
                )}


                {/* Empty State */}
                {requirements.length === 0 && !error ? (

                    <div className="rounded-xl bg-white p-8 text-center shadow">

                        <p className="text-gray-500">
                            You have not created any requirements yet.
                        </p>

                    </div>

                ) : (

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                        {requirements.map((requirement) => (

                            <div
                                key={requirement.id}
                                className="rounded-xl bg-white p-5 shadow"
                            >

                                {/* Header */}
                                <div className="mb-4 flex items-start justify-between">

                                    <div>

                                        <h2 className="text-xl font-bold text-gray-800">
                                            {requirement.crop_name}
                                        </h2>

                                        <p className="text-sm text-gray-500">
                                            {requirement.location || "Location not specified"}
                                        </p>

                                    </div>

                                    <span
                                        className={`rounded-full px-3 py-1 text-sm font-medium ${
                                            requirement.status === "open"
                                                ? "bg-green-100 text-green-700"
                                                : requirement.status === "fulfilled"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : "bg-red-100 text-red-700"
                                        }`}
                                    >
                                        {requirement.status}
                                    </span>

                                </div>


                                {/* Requirement Details */}
                                <div className="grid grid-cols-2 gap-3">

                                    <div className="rounded-lg bg-gray-50 p-3">

                                        <p className="text-xs text-gray-500">
                                            Quantity
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
                                            Maximum Price
                                        </p>

                                        <p className="mt-1 font-semibold text-green-600">
                                            {requirement.max_price
                                                ? `₹${requirement.max_price}`
                                                : "Not specified"}
                                        </p>

                                    </div>


                                    <div className="rounded-lg bg-gray-50 p-3">

                                        <p className="text-xs text-gray-500">
                                            Required By
                                        </p>

                                        <p className="mt-1 font-semibold text-gray-800">
                                            {requirement.required_by
                                                ? requirement.required_by.split("T")[0]
                                                : "Not specified"}
                                        </p>

                                    </div>

                                </div>


                                {/* Created Date */}
                                <div className="mt-4 border-t pt-4">

                                    <p className="text-xs text-gray-500">
                                        Created
                                    </p>

                                    <p className="mt-1 text-sm text-gray-700">
                                        {requirement.created_at
                                            ? requirement.created_at.split("T")[0]
                                            : ""}
                                    </p>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </div>
    );
}

export default MyRequirements;