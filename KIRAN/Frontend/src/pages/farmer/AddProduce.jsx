import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

function AddProduce() {
    const { token } = useContext(AuthContext);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        crop_name: "",
        quantity: "",
        unit: "kg",
        quality_grade: "",
        expected_harvest_date: "",
        available_from: "",
        location: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:5000/api/produce", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                setError("");

                setFormData({
                    crop_name: "",
                    quantity: "",
                    unit: "kg",
                    quality_grade: "",
                    expected_harvest_date: "",
                    available_from: "",
                    location: ""
                });
            } else {
                setError(data.message);
                setMessage("");
            }

        } catch (error) {
            console.error(error);
        }
    };

   return (
    <div className="min-h-screen bg-gray-50 p-6">

        <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow">

            <h1 className="mb-2 text-2xl font-bold text-gray-800">
                Add Produce
            </h1>

            <p className="mb-6 text-gray-500">
                Add your crop details to find better market opportunities.
            </p>

            {message && (
                <div className="mb-4 rounded-lg bg-green-100 p-3 text-green-700">
                    {message}
                </div>
            )}

            {error && (
                <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

                <div>
                    <label className="mb-1 block font-medium text-gray-700">
                        Crop Name
                    </label>

                    <input
                        type="text"
                        name="crop_name"
                        placeholder="e.g. Tomato"
                        value={formData.crop_name}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-green-500"
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    <div>
                        <label className="mb-1 block font-medium text-gray-700">
                            Quantity
                        </label>

                        <input
                            type="number"
                            name="quantity"
                            placeholder="e.g. 800"
                            value={formData.quantity}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-green-500"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block font-medium text-gray-700">
                            Unit
                        </label>

                        <select
                            name="unit"
                            value={formData.unit}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-green-500"
                        >
                            <option value="kg">Kg</option>
                            <option value="quintal">Quintal</option>
                        </select>
                    </div>

                </div>

                <div>
                    <label className="mb-1 block font-medium text-gray-700">
                        Quality Grade
                    </label>

                    <input
                        type="text"
                        name="quality_grade"
                        placeholder="e.g. Grade A"
                        value={formData.quality_grade}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-green-500"
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    <div>
                        <label className="mb-1 block font-medium text-gray-700">
                            Expected Harvest Date
                        </label>

                        <input
                            type="date"
                            name="expected_harvest_date"
                            value={formData.expected_harvest_date}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-green-500"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block font-medium text-gray-700">
                            Available From
                        </label>

                        <input
                            type="date"
                            name="available_from"
                            value={formData.available_from}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-green-500"
                        />
                    </div>

                </div>

                <div>
                    <label className="mb-1 block font-medium text-gray-700">
                        Location
                    </label>

                    <input
                        type="text"
                        name="location"
                        placeholder="e.g. Indore, Madhya Pradesh"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-green-500"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full rounded-lg bg-green-600 p-3 font-semibold text-white transition hover:bg-green-700"
                >
                    Add Produce
                </button>

            </form>

        </div>

    </div>
);
}

export default AddProduce;