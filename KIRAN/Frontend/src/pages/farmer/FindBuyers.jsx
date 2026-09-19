import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

function FindBuyers() {

    const { token } = useContext(AuthContext);
    const navigate = useNavigate();

    const [requirements, setRequirements] = useState([]);
    const [crops, setCrops] = useState([]);
    const [selectedCrop, setSelectedCrop] = useState("all");

    const [error, setError] = useState("");

    useEffect(() => {

        const fetchRequirements = async () => {

            try {

                const response = await fetch(
                    "http://localhost:5000/api/buyer/requirements/open",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (response.ok) {

                    setRequirements(data.requirements);

                    const uniqueCrops = [
                        ...new Set(
                            data.requirements.map(
                                (item) => item.crop_name
                            )
                        )
                    ];

                    setCrops(uniqueCrops);

                } else {

                    setError(data.message);

                }

            } catch (error) {

                console.error(error);
                setError("Unable to fetch buyer requirements");

            }
        };

        if (token) {
            fetchRequirements();
        }

    }, [token]);


    const filteredRequirements =
        selectedCrop === "all"
            ? requirements
            : requirements.filter(
                (item) =>
                    item.crop_name === selectedCrop
            );


    return (
        <div className="min-h-screen bg-gray-50 p-6">

            <div className="mx-auto max-w-6xl">

                {/* Heading */}
                <div className="mb-8">

                    <h1 className="text-3xl font-bold text-gray-800">
                        Find Buyers
                    </h1>

                    <p className="mt-1 text-gray-500">
                        Discover open buyer requirements for your produce.
                    </p>

                </div>


                {/* Crop Filter */}
                <div className="mb-8 max-w-xs">

                    <label className="mb-2 block font-medium text-gray-700">
                        Filter by Crop
                    </label>

                    <select
                        value={selectedCrop}
                        onChange={(e) =>
                            setSelectedCrop(e.target.value)
                        }
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

                </div>


                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
                        {error}
                    </div>
                )}


                {/* Empty State */}
                {filteredRequirements.length === 0 ? (

                    <div className="rounded-xl bg-white p-8 text-center shadow">

                        <p className="text-gray-500">
                            No open buyer requirements found.
                        </p>

                    </div>

                ) : (

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                        {filteredRequirements.map((requirement) => (

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

                                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                                        {requirement.status}
                                    </span>

                                </div>


                                {/* Details */}
                                <div className="grid grid-cols-2 gap-3">

                                    <div className="rounded-lg bg-gray-50 p-3">

                                        <p className="text-xs text-gray-500">
                                            Quantity
                                        </p>

                                        <p className="mt-1 font-semibold text-gray-800">
                                            {requirement.quantity}{" "}
                                            {requirement.unit}
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


                                {/* Action */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate("/farmer/create-offer", {
                                            state: {
                                                requirement
                                            }
                                        })
                                    }
                                    className="mt-5 w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700"
                                >
                                    View Requirement
                                </button>

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </div>
    );
}

export default FindBuyers;