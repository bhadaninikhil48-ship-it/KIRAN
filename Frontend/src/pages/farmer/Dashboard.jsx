import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";


function Dashboard() {

    const { token, user } = useContext(AuthContext);

    const [stats, setStats] = useState({
        total: 0,
        available: 0,
        sold: 0
    });

    const [error, setError] = useState("");

    useEffect(() => {

        const fetchStats = async () => {

            try {

                const response = await fetch(
                    "http://localhost:5000/api/produce/stats",
                    {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (response.ok) {
                    setStats(data);
                } else {
                    setError(data.message);
                }

            } catch (error) {
                console.error(error);
                setError("Unable to fetch dashboard statistics");
            }
        };

        if (token) {
            fetchStats();
        }

    }, [token]);

    return (
        <div className="min-h-screen bg-gray-50 p-6">

            <div className="mx-auto max-w-6xl">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Welcome, {user?.name}
                    </h1>

                    <p className="mt-1 text-gray-500">
                        Manage your produce and discover better selling opportunities.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 rounded-lg bg-red-100 p-3 text-red-700">
                        {error}
                    </div>
                )}

                {/* Statistics */}

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">

                    <div className="rounded-xl bg-white p-6 shadow">
                        <p className="text-sm text-gray-500">
                            Total Produce
                        </p>

                        <h2 className="mt-2 text-3xl font-bold text-gray-800">
                            {stats.total}
                        </h2>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow">
                        <p className="text-sm text-gray-500">
                            Available Produce
                        </p>

                        <h2 className="mt-2 text-3xl font-bold text-green-600">
                            {stats.available}
                        </h2>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow">
                        <p className="text-sm text-gray-500">
                            Sold Produce
                        </p>

                        <h2 className="mt-2 text-3xl font-bold text-blue-600">
                            {stats.sold}
                        </h2>
                    </div>

                </div>

                {/* Quick Actions */}

                <div className="mt-8">

                    <h2 className="mb-4 text-xl font-bold text-gray-800">
                        Quick Actions
                    </h2>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                        <a
                            href="/farmer/add-produce"
                            className="rounded-xl bg-green-600 p-5 text-white shadow transition hover:bg-green-700"
                        >
                            <h3 className="text-lg font-semibold">
                                Add Produce
                            </h3>

                            <p className="mt-1 text-sm text-green-100">
                                List your crops on KIRAN
                            </p>
                        </a>

                        <a
                            href="/farmer/my-produce"
                            className="rounded-xl bg-white p-5 shadow transition hover:bg-gray-100"
                        >
                            <h3 className="text-lg font-semibold text-gray-800">
                                My Produce
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                View and manage your listings
                            </p>
                        </a>

                        <a
                            href="/farmer/profit-calculator"
                            className="rounded-xl bg-white p-5 shadow transition hover:shadow-md"
                        >
                            <h3 className="font-semibold text-gray-800">
                                Smart Profit Calculator
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Calculate your actual profit after market and transport costs.
                            </p>
                        </a>

                        <a
                            href="/farmer/best-opportunity"
                            className="rounded-xl bg-white p-5 shadow transition hover:shadow-md"
                        >
                            <h3 className="font-semibold text-gray-800">
                                Best Selling Opportunity
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Find the market offering the best available price.
                            </p>
                        </a>

                        <a
                            href="/farmer/find-buyers"
                            className="rounded-xl bg-white p-5 shadow transition hover:shadow-md"
                        >
                            <h3 className="font-semibold text-gray-800">
                                Find Buyers
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Discover buyers looking for your produce.
                            </p>
                        </a>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Dashboard;