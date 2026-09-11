function Opportunities() {
  return (
    <div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Best Selling Opportunities
        </h1>

        <p className="mt-2 text-gray-500">
          Compare selling options and choose the one that suits you best.
        </p>
      </div>

      {/* Opportunity Cards */}
      <div className="space-y-4">

        {/* Best Opportunity */}
        <div className="bg-white border-2 border-green-500 rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>
              <span className="text-sm font-medium text-green-700">
                #1 Best Option
              </span>

              <h2 className="text-xl font-bold text-gray-900 mt-1">
                FreshMart
              </h2>

              <p className="text-sm text-gray-500">
                Indore • Tomato
              </p>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                91/100
              </p>

              <p className="text-xs text-gray-500">
                Opportunity Score
              </p>
            </div>

          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">

            <div>
              <p className="text-xs text-gray-500">Net Realization</p>
              <p className="font-semibold">₹2,520/q</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Demand</p>
              <p className="font-semibold">High</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Reliability</p>
              <p className="font-semibold">94%</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Payment</p>
              <p className="font-semibold">3 Days</p>
            </div>

          </div>

        </div>


        {/* Second Opportunity */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>
              <span className="text-sm text-gray-500">
                #2 Option
              </span>

              <h2 className="text-xl font-bold text-gray-900 mt-1">
                Indore APMC
              </h2>

              <p className="text-sm text-gray-500">
                Indore • Tomato
              </p>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold text-gray-700">
                84/100
              </p>

              <p className="text-xs text-gray-500">
                Opportunity Score
              </p>
            </div>

          </div>

        </div>


        {/* Third Opportunity */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>
              <span className="text-sm text-gray-500">
                #3 Option
              </span>

              <h2 className="text-xl font-bold text-gray-900 mt-1">
                Local Trader
              </h2>

              <p className="text-sm text-gray-500">
                Bhopal • Tomato
              </p>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold text-gray-700">
                72/100
              </p>

              <p className="text-xs text-gray-500">
                Opportunity Score
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Opportunities;