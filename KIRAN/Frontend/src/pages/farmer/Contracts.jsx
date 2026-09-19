import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";

function Contracts() {

    const { token } = useContext(AuthContext);

    const [contracts, setContracts] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {

        const fetchContracts = async () => {

            try {

                const response = await fetch(
                    "http://localhost:5000/api/contracts/farmer",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (response.ok) {
                    setContracts(data.contracts);
                } else {
                    setError(data.message);
                }

            } catch (error) {

                console.error(error);
                setError("Unable to fetch contracts");

            }
        };

        if (token) {
            fetchContracts();
        }

    }, [token]);

    return (
        <div className="min-h-screen bg-gray-50 p-6">

            <div className="mx-auto max-w-6xl">

                <div className="mb-8">

                    <h1 className="text-3xl font-bold text-gray-800">
                        My Contracts
                    </h1>

                    <p className="mt-1 text-gray-500">
                        View your accepted deals and contracts.
                    </p>

                </div>

                {error && (
                    <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
                        {error}
                    </div>
                )}

                {contracts.length === 0 && !error ? (

                    <div className="rounded-xl bg-white p-8 text-center shadow">

                        <p className="text-gray-500">
                            No contracts found.
                        </p>

                    </div>

                ) : (

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                        {contracts.map((contract) => (

                            <div
                                key={contract.id}
                                className="rounded-xl bg-white p-5 shadow"
                            >

                                <div className="mb-4 flex items-start justify-between">

                                    <div>

                                        <h2 className="text-xl font-bold text-gray-800">
                                            {contract.crop_name}
                                        </h2>

                                        <p className="text-sm text-gray-500">
                                            Contract #{contract.id}
                                        </p>

                                    </div>

                                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                                        {contract.status}
                                    </span>

                                </div>

                                <div className="grid grid-cols-2 gap-3">

                                    <div className="rounded-lg bg-gray-50 p-3">

                                        <p className="text-xs text-gray-500">
                                            Buyer
                                        </p>

                                        <p className="mt-1 font-semibold text-gray-800">
                                            {contract.buyer_name}
                                        </p>

                                    </div>

                                    <div className="rounded-lg bg-gray-50 p-3">

                                        <p className="text-xs text-gray-500">
                                            Quantity
                                        </p>

                                        <p className="mt-1 font-semibold text-gray-800">
                                            {contract.quantity} {contract.unit}
                                        </p>

                                    </div>

                                    <div className="rounded-lg bg-green-50 p-3">

                                        <p className="text-xs text-gray-500">
                                            Agreed Price
                                        </p>

                                        <p className="mt-1 font-semibold text-green-600">
                                            ₹{contract.agreed_price}
                                        </p>

                                    </div>

                                    <div className="rounded-lg bg-gray-50 p-3">

                                        <p className="text-xs text-gray-500">
                                            Total Amount
                                        </p>

                                        <p className="mt-1 font-semibold text-gray-800">
                                            ₹{contract.total_amount}
                                        </p>

                                    </div>

                                    <div className="rounded-lg bg-gray-50 p-3">

                                        <p className="text-xs text-gray-500">
                                            Quality
                                        </p>

                                        <p className="mt-1 font-semibold text-gray-800">
                                            {contract.quality_grade || "Not specified"}
                                        </p>

                                    </div>

                                    <div className="rounded-lg bg-gray-50 p-3">

                                        <p className="text-xs text-gray-500">
                                            Delivery Location
                                        </p>

                                        <p className="mt-1 font-semibold text-gray-800">
                                            {contract.delivery_location || "Not specified"}
                                        </p>

                                    </div>

                                </div>

                                <div className="mt-4 border-t pt-4">

                                    <p className="text-sm text-gray-500">
                                        Required By
                                    </p>

                                    <p className="mt-1 font-medium text-gray-800">
                                        {new Date(contract.required_by).toLocaleDateString()}
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

export default Contracts;