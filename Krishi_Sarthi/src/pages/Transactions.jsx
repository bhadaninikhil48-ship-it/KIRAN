import { useState } from "react";

function Transactions() {

    const [deliveryStatus, setDeliveryStatus] = useState("Pending");
    const [paymentStatus, setPaymentStatus] = useState("Pending");
    const [showBackupBuyers, setShowBackupBuyers] = useState(false);

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Transactions
                </h1>

                <p className="mt-2 text-gray-500">
                    Track your produce delivery and payments.
                </p>
            </div>

            {/* Transaction */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">
                            FreshMart
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Tomato • 800 kg • Grade A
                        </p>
                    </div>

                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        Confirmed
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
                    <div>
                        <p className="text-xs text-gray-500">
                            Price
                        </p>
                        <p className="font-semibold">
                            ₹2,520/q
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500">
                            Total Value
                        </p>
                        <p className="font-semibold">
                            ₹20,160
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500">
                            Delivery
                        </p>
                        <p
                            className={`font-semibold ${deliveryStatus === "Delivered"
                                ? "text-green-600"
                                : deliveryStatus === "In Transit"
                                    ? "text-blue-600"
                                    : "text-yellow-600"
                                }`}
                        >
                            {deliveryStatus}
                        </p>

                        {deliveryStatus === "Pending" && (
                            <button
                                onClick={() => setDeliveryStatus("In Transit")}
                                className="mt-2 text-sm text-blue-600 hover:underline"
                            >
                                Start Delivery
                            </button>
                        )}

                        {deliveryStatus === "In Transit" && (
                            <button
                                onClick={() => setDeliveryStatus("Delivered")}
                                className="mt-2 text-sm text-green-600 hover:underline"
                            >
                                Mark Delivered
                            </button>
                        )}
                    </div>

                    <div>
                        <p className="text-xs text-gray-500">
                            Payment
                        </p>
                        <p
                            className={`font-semibold ${paymentStatus === "Received"
                                ? "text-green-600"
                                : paymentStatus === "Processing"
                                    ? "text-blue-600"
                                    : "text-yellow-600"
                                }`}
                        >
                            {paymentStatus}
                        </p>

                        {paymentStatus === "Pending" && (
                            <button
                                onClick={() => setPaymentStatus("Processing")}
                                className="mt-2 text-sm text-blue-600 hover:underline"
                            >
                                Process Payment
                            </button>
                        )}

                        {paymentStatus === "Processing" && (
                            <button
                                onClick={() => setPaymentStatus("Received")}
                                className="mt-2 text-sm text-green-600 hover:underline"
                            >
                                Confirm Payment
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Backup Buyer */}
            <div className="mt-5 bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="font-medium text-orange-800">
                    Deal Recovery
                </p>

                <p className="text-sm text-orange-700 mt-1">
                    Buyer cancels the deal? Find another suitable buyer quickly.
                </p>

                <button
                    onClick={() => setShowBackupBuyers(true)}
                    className="mt-3 bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700"
                >
                    Find Backup Buyer
                </button>
            </div>

            {showBackupBuyers && (
  <div className="mt-4 space-y-3">

    <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
      <div>
        <p className="font-semibold text-gray-800">
          Indore Fresh Buyers
        </p>
        <p className="text-sm text-gray-500">
          Tomato • High Demand
        </p>
      </div>

      <button
        onClick={() => alert("Buyer contacted successfully!")}
        className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm"
      >
        Contact
      </button>
    </div>

    <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
      <div>
        <p className="font-semibold text-gray-800">
          Bhopal Agro Traders
        </p>
        <p className="text-sm text-gray-500">
          Tomato • Medium Demand
        </p>
      </div>

      <button
        onClick={() => alert("Buyer contacted successfully!")}
        className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm"
      >
        Contact
      </button>
    </div>

  </div>
)}



        </div>
    );
}

export default Transactions;