import { useState } from "react";

function SellProduce() {
  const [crop, setCrop] = useState("Tomato");
  const [quantity, setQuantity] = useState(800);
  const [grade, setGrade] = useState("Grade A");
  const [selectedBuyer, setSelectedBuyer] = useState(null);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Sell Your Produce
        </h1>

        <p className="mt-2 text-gray-500">
          Add your crop details to find the best selling options.
        </p>
      </div>

      {/* Crop Details */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-2xl">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">
          Crop & Lot Details
        </h2>

        {/* Crop */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Crop
          </label>

          <select
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option>Tomato</option>
            <option>Onion</option>
            <option>Potato</option>
            <option>Wheat</option>
          </select>
        </div>

        {/* Quantity */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity (kg)
          </label>

          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        {/* Grade */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quality / Grade
          </label>

          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option>Grade A</option>
            <option>Grade B</option>
            <option>Grade C</option>
          </select>
        </div>

        {/* Lot Preview */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700 font-medium">
            Lot Preview
          </p>

          <p className="mt-2 text-gray-800">
            {crop} • {quantity} kg • {grade}
          </p>
        </div>

        {/* FPO Aggregation */}
        <div className="mt-5 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-700">
            FPO Aggregation
          </p>

          <p className="text-sm text-gray-600 mt-1">
            Combine your produce with other farmers to create a larger lot
            and reach more buyers.
          </p>

          <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
            Join FPO Aggregation
          </button>
        </div>

        {/* Recommended Buyers */}
        <div className="mt-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Recommended Buyers
          </h2>

          <div className="space-y-3">
            <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">
                  FreshMart
                </h3>
                <p className="text-sm text-gray-500">
                  Indore • High Demand
                </p>
              </div>

              <div className="text-right">
                <p className="font-semibold text-green-600">
                  ₹2,520/q
                </p>
                <p className="text-xs text-gray-500">
                  Reliability 94%
                </p>

                <button
                  onClick={() => setSelectedBuyer("FreshMart")}
                  className="mt-2 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700"
                >
                  Send Offer
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">
                  Indore APMC
                </h3>
                <p className="text-sm text-gray-500">
                  Indore • Medium Demand
                </p>

              </div>

              <div className="text-right">
                <p className="font-semibold text-green-600">
                  ₹2,440/q
                </p>
                <p className="text-xs text-gray-500">
                  Reliability 88%
                </p>

                <button
                  onClick={() => setSelectedBuyer("Indore APMC")}
                  className="mt-2 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700"
                >
                  Send Offer
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Offer Form */}
        {selectedBuyer && (
          <div className="mt-5 bg-white border border-green-200 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-gray-800">
              Send Offer to {selectedBuyer}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity (kg)
                </label>

                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Price (₹/quintal)
                </label>

                <input
                  type="number"
                  defaultValue="2520"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <button
              onClick={() => alert("Offer submitted successfully!")}
              className="mt-5 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
            >
              Submit Offer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SellProduce;