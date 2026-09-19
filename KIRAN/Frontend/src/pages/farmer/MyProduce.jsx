import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";

function MyProduce() {

    const { token } = useContext(AuthContext);

    const [produce, setProduce] = useState([]);
    const [error, setError] = useState("");
    const [editingId, setEditingId] = useState(null);

    const [editForm, setEditForm] = useState({
        crop_name: "",
        quantity: "",
        unit: "kg",
        quality_grade: "",
        expected_harvest_date: "",
        available_from: "",
        location: ""
    });

    const handleEditClick = (item) => {
        setEditingId(item.id);

        setEditForm({
            crop_name: item.crop_name,
            quantity: item.quantity,
            unit: item.unit,
            quality_grade: item.quality_grade || "",
            expected_harvest_date: item.expected_harvest_date
                ? item.expected_harvest_date.split("T")[0]
                : "",
            available_from: item.available_from
                ? item.available_from.split("T")[0]
                : "",
            location: item.location || ""
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(
                `http://localhost:5000/api/produce/${editingId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(editForm)
                }
            );


            const data = await response.json();

            if (response.ok) {
                setProduce((prevProduce) =>
                    prevProduce.map((item) =>
                        item.id === editingId
                            ? { ...item, ...editForm }
                            : item
                    )
                );

                setEditingId(null);
                setError("");
            } else {
                setError(data.message);
            }

        } catch (error) {
            console.error(error);
            setError("Unable to update produce");
        }
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this produce?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:5000/api/produce/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {
                setProduce((prevProduce) =>
                    prevProduce.filter((item) => item.id !== id)
                );

                setError("");
            } else {
                setError(data.message);
            }

        } catch (error) {
            console.error(error);
            setError("Unable to delete produce");
        }
    };

    useEffect(() => {

        const fetchProduce = async () => {

            try {

                const response = await fetch(
                    "http://localhost:5000/api/produce/my",
                    {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (response.ok) {
                    setProduce(data.produce);
                } else {
                    setError(data.message);
                }

            } catch (error) {
                console.error(error);
                setError("Unable to fetch produce");
            }
        };

        if (token) {
            fetchProduce();
        }

    }, [token]);

    return (
        <div className="min-h-screen bg-gray-50 p-6">

            <div className="mx-auto max-w-5xl">

                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">
                        My Produce
                    </h1>

                    <p className="mt-1 text-gray-500">
                        Manage the crops you have listed on KIRAN.
                    </p>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
                        {error}
                    </div>
                )}

                {produce.length === 0 ? (
                    <div className="rounded-xl bg-white p-8 text-center shadow">
                        <p className="text-gray-500">
                            No produce added yet.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                        {produce.map((item) => (
                            <div
                                key={item.id}
                                className="rounded-xl bg-white p-5 shadow"
                            >

                                <div className="mb-4 flex items-start justify-between">

                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800">
                                            {item.crop_name}
                                        </h2>

                                        <p className="text-sm text-gray-500">
                                            {item.location || "Location not specified"}
                                        </p>
                                    </div>

                                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                                        {item.status}
                                    </span>

                                </div>

                                <div className="space-y-2 text-gray-600">

                                    <p>
                                        <span className="font-medium">
                                            Quantity:
                                        </span>{" "}
                                        {item.quantity} {item.unit}
                                    </p>

                                    <p>
                                        <span className="font-medium">
                                            Quality:
                                        </span>{" "}
                                        {item.quality_grade || "Not specified"}
                                    </p>

                                    <p>
                                        <span className="font-medium">
                                            Harvest:
                                        </span>{" "}
                                        {item.expected_harvest_date
                                            ? item.expected_harvest_date.split("T")[0]
                                            : "Not specified"}
                                    </p>

                                    <p>
                                        <span className="font-medium">
                                            Available:
                                        </span>{" "}
                                        {item.available_from
                                            ? item.available_from.split("T")[0]
                                            : "Not specified"}
                                    </p>

                                </div>

                                <div className="mt-5 flex gap-3">

                                    <button
                                        onClick={() => handleEditClick(item)}
                                        className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
                                    >
                                        Delete
                                    </button>

                                </div>

                                {editingId === item.id && (
                                    <form
                                        onSubmit={handleUpdate}
                                        className="mt-5 space-y-4 border-t pt-5"
                                    >

                                        <input
                                            type="text"
                                            name="crop_name"
                                            value={editForm.crop_name}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    [e.target.name]: e.target.value
                                                })
                                            }
                                            className="w-full rounded-lg border p-3"
                                        />

                                        <input
                                            type="number"
                                            name="quantity"
                                            value={editForm.quantity}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    [e.target.name]: e.target.value
                                                })
                                            }
                                            className="w-full rounded-lg border p-3"
                                        />

                                        <select
                                            name="unit"
                                            value={editForm.unit}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    [e.target.name]: e.target.value
                                                })
                                            }
                                            className="w-full rounded-lg border bg-white p-3"
                                        >
                                            <option value="kg">Kg</option>
                                            <option value="quintal">Quintal</option>
                                        </select>

                                        <input
                                            type="text"
                                            name="quality_grade"
                                            value={editForm.quality_grade}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    [e.target.name]: e.target.value
                                                })
                                            }
                                            placeholder="Quality Grade"
                                            className="w-full rounded-lg border p-3"
                                        />

                                        <input
                                            type="date"
                                            name="expected_harvest_date"
                                            value={editForm.expected_harvest_date}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    [e.target.name]: e.target.value
                                                })
                                            }
                                            className="w-full rounded-lg border p-3"
                                        />

                                        <input
                                            type="date"
                                            name="available_from"
                                            value={editForm.available_from}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    [e.target.name]: e.target.value
                                                })
                                            }
                                            className="w-full rounded-lg border p-3"
                                        />

                                        <input
                                            type="text"
                                            name="location"
                                            value={editForm.location}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    [e.target.name]: e.target.value
                                                })
                                            }
                                            placeholder="Location"
                                            className="w-full rounded-lg border p-3"
                                        />

                                        <div className="flex gap-3">

                                            <button
                                                type="submit"
                                                className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
                                            >
                                                Save Changes
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setEditingId(null)}
                                                className="rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-300"
                                            >
                                                Cancel
                                            </button>

                                        </div>

                                    </form>
                                )}

                            </div>
                        ))}
                    </div>
                )}

            </div>

        </div>
    );
}

export default MyProduce;