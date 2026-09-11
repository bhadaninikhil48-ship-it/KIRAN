import { Bell, UserCircle } from "lucide-react";
import { useState } from "react";

function Navbar() {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      
      {/* Page Title */}
      <h2 className="text-base sm:text-lg font-semibold text-gray-800">
        Farmer Dashboard
      </h2>

      {/* Right Side */}
      <div className="flex items-center gap-3 sm:gap-5">

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="text-gray-600 hover:text-green-700 p-1"
          >
            <Bell size={21} />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-[calc(100vw-32px)] max-w-80 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-50">
              <h3 className="font-semibold text-gray-800">
                Notifications
              </h3>

              <div className="mt-3 space-y-3">
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-700">
                    New Buyer Interest
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    FreshMart is interested in your tomato lot.
                  </p>
                </div>

                <div className="bg-yellow-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-yellow-700">
                    Payment Pending
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    ₹20,160 payment is pending for your transaction.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <div className="flex items-center gap-2">
          <UserCircle
            size={30}
            className="text-green-700"
          />

          <span className="hidden sm:inline text-sm font-medium text-gray-700">
            Farmer
          </span>
        </div>

      </div>
    </header>
  );
}

export default Navbar;