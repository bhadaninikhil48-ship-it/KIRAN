import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

function CreateRequirement() {

    const { token } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        crop_name: "",
        quantity: "",
        unit: "kg",
        quality_grade: "",
        max_price: "",
        required_by: "",
        location: ""
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

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
                "http://localhost:5000/api/buyer/requirements",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify(formData)
                }
            );

            const data = await response.json();

            if (response.ok) {

                setMessage(data.message);

                setFormData({
                    crop_name: "",
                    quantity: "",
                    unit: "kg",
                    quality_grade: "",
                    max_price: "",
                    required_by: "",
                    location: ""
                });

            } else {

                setError(data.message);

            }

        } catch (error) {

            console.error(error);
            setError("Unable to create buyer requirement");

        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">

            <div className="mx-auto max-w-3xl">

                {/* Heading */}
                <div className="mb-8">

                    <h1 className="text-3xl font-bold text-gray-800">
                        Create Buyer Requirement
                    </h1>

                    <p className="mt-1 text-gray-500">
                        Tell farmers what produce you are looking to buy.
                    </p>

                </div>


                {/* Success Message */}
                {message && (
                    <div className="mb-6 rounded-lg bg-green-100 p-4 text-green-700">
                        {message}
                    </div>
                )}


                {/* Error Message */}
                {error && (
                    <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
                        {error}
                    </div>
                )}


                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 rounded-xl bg-white p-6 shadow"
                >

                    {/* Crop */}
                    <div>

                        <label className="mb-2 block font-medium text-gray-700">
                            Crop Name
                        </label>

                        <input
                            type="text"
                            name="crop_name"
                            value={formData.crop_name}
                            onChange={handleChange}
                            placeholder="e.g. Tomato"
                            required
                            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-green-500"
                        />

                    </div>


                    {/* Quantity */}
                    <div>

                        <label className="mb-2 block font-medium text-gray-700">
                            Quantity
                        </label>

                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            placeholder="e.g. 500"
                            min="1"
                            required
                            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-green-500"
                        />

                    </div>


                    {/* Unit */}
                    <div>

                        <label className="mb-2 block font-medium text-gray-700">
                            Unit
                        </label>

                        <select
                            name="unit"
                            value={formData.unit}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-green-500"
                        >

                            <option value="kg">
                                Kilogram (kg)
                            </option>

                            <option value="quintal">
                                Quintal
                            </option>

                            <option value="tonne">
                                Tonne
                            </option>

                        </select>

                    </div>


                    {/* Quality */}
                    <div>

                        <label className="mb-2 block font-medium text-gray-700">
                            Quality Grade
                        </label>

                        <select
                            name="quality_grade"
                            value={formData.quality_grade}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-green-500"
                        >

                            <option value="">
                                Select Quality
                            </option>

                            <option value="Grade A">
                                Grade A
                            </option>

                            <option value="Grade B">
                                Grade B
                            </option>

                            <option value="Grade C">
                                Grade C
                            </option>

                        </select>

                    </div>


                    {/* Maximum Price */}
                    <div>

                        <label className="mb-2 block font-medium text-gray-700">
                            Maximum Price
                        </label>

                        <input
                            type="number"
                            name="max_price"
                            value={formData.max_price}
                            onChange={handleChange}
                            placeholder="e.g. 30"
                            min="0"
                            step="0.01"
                            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-green-500"
                        />

                    </div>


                    {/* Required By */}
                    <div>

                        <label className="mb-2 block font-medium text-gray-700">
                            Required By
                        </label>

                        <input
                            type="date"
                            name="required_by"
                            value={formData.required_by}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-green-500"
                        />

                    </div>


                    {/* Location */}
                    <div>

                        <label className="mb-2 block font-medium text-gray-700">
                            Delivery / Market Location
                        </label>

                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="e.g. Indore"
                            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-green-500"
                        />

                    </div>


                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700"
                    >
                        Create Requirement
                    </button>

                </form>

            </div>

        </div>
    );
}

export default CreateRequirement;