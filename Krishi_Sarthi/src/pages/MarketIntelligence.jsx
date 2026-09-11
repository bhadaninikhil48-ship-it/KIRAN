import { useState } from "react";

function MarketIntelligence() {

    const [quantity, setQuantity] = useState(8);

  return (
    <div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Market Intelligence
        </h1>

        <p className="mt-2 text-gray-500">
          Compare current market prices for your produce.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">
            Nashik APMC
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-2">
            ₹2,700
            <span className="text-sm font-normal text-gray-500">
              {" "} / quintal
            </span>
          </h2>

          <p className="text-sm text-green-600 mt-2">
            ↑ 8%
          </p>
        </div>


        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">
            Pune APMC
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-2">
            ₹2,820
            <span className="text-sm font-normal text-gray-500">
              {" "} / quintal
            </span>
          </h2>

          <p className="text-sm text-green-600 mt-2">
            ↑ 12%
          </p>
        </div>


        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm text-gray-500">
            Mumbai APMC
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-2">
            ₹2,950
            <span className="text-sm font-normal text-gray-500">
              {" "} / quintal
            </span>
          </h2>

          <p className="text-sm text-green-600 mt-2">
            ↑ 5%
          </p>
        </div>

      </div>

      {/* Local Market Trends */}
<div className="mt-6 bg-white border border-gray-200 rounded-xl p-5">
  <h2 className="text-lg font-semibold text-gray-800">
    Local Market Trends
  </h2>

  <p className="text-sm text-gray-500 mt-1">
    Tomato price movement over the last 7 days
  </p>

  <div className="mt-6 flex items-end gap-4 h-40">
    <div className="w-10 bg-green-200 h-20 rounded-t"></div>
    <div className="w-10 bg-green-300 h-24 rounded-t"></div>
    <div className="w-10 bg-green-400 h-28 rounded-t"></div>
    <div className="w-10 bg-green-500 h-32 rounded-t"></div>
    <div className="w-10 bg-green-600 h-36 rounded-t"></div>
    <div className="w-10 bg-green-700 h-32 rounded-t"></div>
    <div className="w-10 bg-green-800 h-40 rounded-t"></div>
  </div>

  <div className="mt-3 flex justify-between text-xs text-gray-400">
    <span>4 Sep</span>
    <span>5 Sep</span>
    <span>6 Sep</span>
    <span>7 Sep</span>
    <span>8 Sep</span>
    <span>9 Sep</span>
    <span>Today</span>
  </div>
</div>

{/* Market Comparison */}
<div className="mt-6 bg-white border border-gray-200 rounded-xl p-5">

  <h2 className="text-lg font-semibold text-gray-800">
    Market Comparison
  </h2>

  <p className="text-sm text-gray-500 mt-1">
    Compare price, transport and storage costs before selling.
  </p>

  <div className="overflow-x-auto mt-5">
    <table className="w-full text-left">

      <thead>
        <tr className="border-b border-gray-200 text-sm text-gray-500">
          <th className="py-3">Market</th>
          <th className="py-3">Price / q</th>
          <th className="py-3">Distance</th>
          <th className="py-3">Transport</th>
          <th className="py-3">Storage</th>
        </tr>
      </thead>

      <tbody>

        <tr className="border-b border-gray-100">
          <td className="py-4 font-medium">Nashik APMC</td>
          <td className="py-4">₹2,700</td>
          <td className="py-4">18 km</td>
          <td className="py-4">₹120</td>
          <td className="py-4">₹50</td>
        </tr>

        <tr className="border-b border-gray-100">
          <td className="py-4 font-medium">Pune APMC</td>
          <td className="py-4">₹2,820</td>
          <td className="py-4">210 km</td>
          <td className="py-4">₹650</td>
          <td className="py-4">₹50</td>
        </tr>

        <tr>
          <td className="py-4 font-medium">Mumbai APMC</td>
          <td className="py-4">₹2,950</td>
          <td className="py-4">170 km</td>
          <td className="py-4">₹550</td>
          <td className="py-4">₹80</td>
        </tr>

      </tbody>

    </table>
  </div>

</div>

{/* Net Realization */}
<div className="mt-6 bg-white border border-gray-200 rounded-xl p-5">

  <h2 className="text-lg font-semibold text-gray-800">
    Net Realization
  </h2>

  <p className="text-sm text-gray-500 mt-1">
    See what you may actually earn after major selling costs.
  </p>

  <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">

    <div>
      <label className="text-sm text-gray-600">
        Quantity (Quintals)
      </label>

      <input
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        className="mt-2 w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-green-500"
      />
    </div>

    <div className="bg-green-50 rounded-lg p-4">
      <p className="text-sm text-gray-600">
        Estimated Net Realization
      </p>

      <h3 className="text-2xl font-bold text-green-700 mt-1">
        ₹{((2700 - 120 - 50) * quantity).toLocaleString()}
      </h3>

      <p className="text-sm text-gray-500 mt-1">
        ₹2,530 / quintal
      </p>
    </div>

  </div>

</div>

{/* Recommended Market */}
<div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-5">

  <p className="text-sm text-green-700 font-medium">
    Recommended Option
  </p>

  <h2 className="text-xl font-bold text-gray-900 mt-1">
    Nashik APMC
  </h2>

  <p className="text-sm text-gray-600 mt-2">
    Lower transport and storage costs give you a better net realization.
  </p>

  <div className="flex gap-6 mt-4 text-sm">

    <div>
      <p className="text-gray-500">Transport</p>
      <p className="font-semibold text-gray-800">₹120/q</p>
    </div>

    <div>
      <p className="text-gray-500">Storage</p>
      <p className="font-semibold text-gray-800">₹50/q</p>
    </div>

    <div>
      <p className="text-gray-500">Net Realization</p>
      <p className="font-semibold text-green-700">₹2,530/q</p>
    </div>

  </div>

</div>

    </div>
  );
}

export default MarketIntelligence;