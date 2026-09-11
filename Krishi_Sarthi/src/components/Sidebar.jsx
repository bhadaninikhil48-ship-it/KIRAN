import {
    LayoutDashboard,
    ShoppingBasket,
    Store,
    Users,
    FileText,
    ReceiptText,
    ShieldCheck,
} from "lucide-react";

import { NavLink } from "react-router-dom";

function Sidebar() {
    return (
        <aside className="w-64 md:w-64 min-h-screen bg-white border-r border-gray-200 p-3 md:p-5">

            {/* Logo */}
            <h1 className="text-xl md:text-2xl font-bold text-green-700 mb-6 md:mb-8 text-center md:text-left">
                <span className="md:hidden">KS</span>
                <span className="hidden md:inline">KrishiSarthi</span>
            </h1>

            <nav className="space-y-2">

                {/* Dashboard */}
                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        `flex items-center gap-3 p-3 rounded-lg ${
                            isActive
                                ? "bg-green-100 text-green-700"
                                : "text-gray-600 hover:bg-green-50 hover:text-green-700"
                        }`
                    }
                >
                    <LayoutDashboard size={20} />
                    <span className="hidden md:inline">Dashboard</span>
                </NavLink>

                {/* Sell Produce */}
                <NavLink
                    to="/sell"
                    className={({ isActive }) =>
                        `flex items-center gap-3 p-3 rounded-lg ${
                            isActive
                                ? "bg-green-100 text-green-700"
                                : "text-gray-600 hover:bg-green-50 hover:text-green-700"
                        }`
                    }
                >
                    <ShoppingBasket size={20} />
                    <span className="hidden md:inline">Sell Produce</span>
                </NavLink>

                {/* Markets */}
                <NavLink
                    to="/markets"
                    className={({ isActive }) =>
                        `flex items-center gap-3 p-3 rounded-lg ${
                            isActive
                                ? "bg-green-100 text-green-700"
                                : "text-gray-600 hover:bg-gray-100"
                        }`
                    }
                >
                    <Store size={20} />
                    <span className="hidden md:inline">Markets</span>
                </NavLink>

                {/* Buyers */}
                <NavLink
                    to="/buyers"
                    className={({ isActive }) =>
                        `flex items-center gap-3 p-3 rounded-lg ${
                            isActive
                                ? "bg-green-100 text-green-700"
                                : "text-gray-600 hover:bg-gray-100"
                        }`
                    }
                >
                    <Users size={20} />
                    <span className="hidden md:inline">Buyers</span>
                </NavLink>

                {/* Offers */}
                <NavLink
                    to="/offers"
                    className={({ isActive }) =>
                        `flex items-center gap-3 p-3 rounded-lg ${
                            isActive
                                ? "bg-green-100 text-green-700"
                                : "text-gray-600 hover:bg-gray-100"
                        }`
                    }
                >
                    <FileText size={20} />
                    <span className="hidden md:inline">Offers</span>
                </NavLink>

                {/* Transactions */}
                <NavLink
                    to="/transactions"
                    className={({ isActive }) =>
                        `flex items-center gap-3 p-3 rounded-lg ${
                            isActive
                                ? "bg-green-100 text-green-700"
                                : "text-gray-600 hover:bg-gray-100"
                        }`
                    }
                >
                    <ReceiptText size={20} />
                    <span className="hidden md:inline">Transactions</span>
                </NavLink>

                {/* Trust & Support */}
                <NavLink
                    to="/support"
                    className={({ isActive }) =>
                        `flex items-center gap-3 p-3 rounded-lg ${
                            isActive
                                ? "bg-green-100 text-green-700"
                                : "text-gray-600 hover:bg-gray-100"
                        }`
                    }
                >
                    <ShieldCheck size={20} />
                    <span className="hidden md:inline">Trust & Support</span>
                </NavLink>

            </nav>
        </aside>
    );
}

export default Sidebar;