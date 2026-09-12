import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  Info,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { Card, CardHeader } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { EmptyState } from "../components/ui/EmptyState";
import { LoadingState } from "../components/ui/LoadingState";
import { animateStagger } from "../utils/animations";

const allMandiData = [
  {
    id: 1,
    commodity: "Tomato",
    market: "Nashik APMC",
    state: "Maharashtra",
    minPrice: 2400,
    maxPrice: 2850,
    modalPrice: 2700,
    arrival: "380 Tonnes",
    distance: 18,
    transportCost: 120,
    storageCost: 50,
    trend: "+8%",
    isUp: true,
  },
  {
    id: 2,
    commodity: "Tomato",
    market: "Pune APMC",
    state: "Maharashtra",
    minPrice: 2500,
    maxPrice: 3000,
    modalPrice: 2820,
    arrival: "290 Tonnes",
    distance: 210,
    transportCost: 650,
    storageCost: 50,
    trend: "+12%",
    isUp: true,
  },
  {
    id: 3,
    commodity: "Tomato",
    market: "Mumbai APMC (Vashi)",
    state: "Maharashtra",
    minPrice: 2600,
    maxPrice: 3200,
    modalPrice: 2950,
    arrival: "520 Tonnes",
    distance: 170,
    transportCost: 550,
    storageCost: 80,
    trend: "+5%",
    isUp: true,
  },
  {
    id: 4,
    commodity: "Tomato",
    market: "Indore APMC (Choithram)",
    state: "Madhya Pradesh",
    minPrice: 2450,
    maxPrice: 2880,
    modalPrice: 2750,
    arrival: "410 Tonnes",
    distance: 24,
    transportCost: 140,
    storageCost: 40,
    trend: "+7%",
    isUp: true,
  },
  {
    id: 5,
    commodity: "Tomato",
    market: "Bhopal Karond APMC",
    state: "Madhya Pradesh",
    minPrice: 2300,
    maxPrice: 2650,
    modalPrice: 2520,
    arrival: "180 Tonnes",
    distance: 195,
    transportCost: 580,
    storageCost: 40,
    trend: "-2%",
    isUp: false,
  },
  {
    id: 6,
    commodity: "Onion",
    market: "Lasalgaon APMC",
    state: "Maharashtra",
    minPrice: 1600,
    maxPrice: 2100,
    modalPrice: 1850,
    arrival: "850 Tonnes",
    distance: 35,
    transportCost: 180,
    storageCost: 60,
    trend: "+4%",
    isUp: true,
  },
  {
    id: 7,
    commodity: "Potato",
    market: "Agra APMC",
    state: "Uttar Pradesh",
    minPrice: 1200,
    maxPrice: 1550,
    modalPrice: 1420,
    arrival: "700 Tonnes",
    distance: 420,
    transportCost: 850,
    storageCost: 70,
    trend: "+1%",
    isUp: true,
  },
  {
    id: 8,
    commodity: "Wheat",
    market: "Indore Chhawani APMC",
    state: "Madhya Pradesh",
    minPrice: 2275,
    maxPrice: 2450,
    modalPrice: 2380,
    arrival: "620 Tonnes",
    distance: 16,
    transportCost: 110,
    storageCost: 30,
    trend: "+3%",
    isUp: true,
  },
];

export function MarketIntelligence() {
  const [searchQuery, setSearchQuery] = useState("");
  const [cropFilter, setCropFilter] = useState("All");
  const [marketFilter, setMarketFilter] = useState("All");
  const [sortBy, setSortBy] = useState("modalPriceDesc");
  const [quantity, setQuantity] = useState(8); // quintals
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      animateStagger(containerRef.current.querySelectorAll(".stagger-box"), {
        delay: 0.05,
      });
    }
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 600);
  };

  // Filtered and sorted data
  const filteredData = useMemo(() => {
    return allMandiData
      .filter((item) => {
        const matchesSearch =
          item.market.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.commodity.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.state.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCrop =
          cropFilter === "All" || item.commodity.toLowerCase() === cropFilter.toLowerCase();

        const matchesMarket =
          marketFilter === "All" || item.market.toLowerCase().includes(marketFilter.toLowerCase());

        return matchesSearch && matchesCrop && matchesMarket;
      })
      .sort((a, b) => {
        if (sortBy === "modalPriceDesc") return b.modalPrice - a.modalPrice;
        if (sortBy === "modalPriceAsc") return a.modalPrice - b.modalPrice;
        if (sortBy === "distanceAsc") return a.distance - b.distance;
        if (sortBy === "netRealization") {
          const netA = a.modalPrice - a.transportCost - a.storageCost;
          const netB = b.modalPrice - b.transportCost - b.storageCost;
          return netB - netA;
        }
        return 0;
      });
  }, [searchQuery, cropFilter, marketFilter, sortBy]);

  // Selected reference mandi for calculation: Nashik APMC or first available
  const refMandi = filteredData[0] || allMandiData[0];
  const estNetPerQuintal = refMandi.modalPrice - refMandi.transportCost - refMandi.storageCost;
  const estTotalNet = estNetPerQuintal * quantity;

  return (
    <div ref={containerRef} className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="stagger-box flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Market Intelligence & Mandi Analytics
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Real-time APMC price benchmarks, arrival volumes, and logistics-adjusted net realizations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={RefreshCw}
            loading={isLoading}
            onClick={handleRefresh}
          >
            Sync APMC Feeds
          </Button>
        </div>
      </div>

      {/* Top 3 Benchmark Cards */}
      <div className="stagger-box grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <Card className="hover:border-emerald-300">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase">
                Nashik APMC • Maharashtra
              </span>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mt-1">
                Tomato Modal Rate
              </h3>
            </div>
            <Badge variant="emerald" dot>↑ 8%</Badge>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              ₹2,700
            </span>
            <span className="text-xs text-gray-500">/ quintal</span>
          </div>
          <p className="text-xs text-emerald-700 font-medium mt-2">
            Net Realization: ₹2,530/q (Short haul 18 km)
          </p>
        </Card>

        <Card className="hover:border-emerald-300">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase">
                Pune APMC • Maharashtra
              </span>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mt-1">
                Tomato Modal Rate
              </h3>
            </div>
            <Badge variant="emerald" dot>↑ 12%</Badge>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              ₹2,820
            </span>
            <span className="text-xs text-gray-500">/ quintal</span>
          </div>
          <p className="text-xs text-gray-500 font-medium mt-2">
            High nominal price, but high transit (210 km)
          </p>
        </Card>

        <Card className="hover:border-emerald-300">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase">
                Mumbai APMC • Vashi
              </span>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mt-1">
                Tomato Modal Rate
              </h3>
            </div>
            <Badge variant="emerald" dot>↑ 5%</Badge>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              ₹2,950
            </span>
            <span className="text-xs text-gray-500">/ quintal</span>
          </div>
          <p className="text-xs text-gray-500 font-medium mt-2">
            Peak wholesale demand, heavy mandi arrival
          </p>
        </Card>
      </div>

      {/* 7-Day Local Market Trend Chart */}
      <Card className="stagger-box border-gray-200/90">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 mb-4 border-b border-gray-100">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">
              7-Day Price Movement & Volume Velocity
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">
              Tomato (Grade A) modal price movement in Indore & Nashik mandi corridor
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-emerald-600" />
              Modal Price Trend
            </span>
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              High Market Momentum
            </span>
          </div>
        </div>

        {/* Responsive Bar Chart Visualization */}
        <div className="pt-2">
          <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 sm:h-52 px-2">
            {[
              { day: "4 Sep", price: "₹2,480", height: "55%", color: "bg-emerald-200" },
              { day: "5 Sep", price: "₹2,520", height: "62%", color: "bg-emerald-300" },
              { day: "6 Sep", price: "₹2,590", height: "68%", color: "bg-emerald-400" },
              { day: "7 Sep", price: "₹2,650", height: "76%", color: "bg-emerald-500" },
              { day: "8 Sep", price: "₹2,720", height: "86%", color: "bg-emerald-600" },
              { day: "9 Sep", price: "₹2,680", height: "79%", color: "bg-emerald-500" },
              { day: "Today", price: "₹2,750", height: "94%", color: "bg-emerald-700", active: true },
            ].map((bar, idx) => (
              <div key={idx} className="flex flex-col items-center h-full justify-end group">
                <span className="text-[10px] sm:text-xs font-bold text-gray-600 mb-1.5 opacity-80 group-hover:opacity-100 group-hover:text-emerald-700 transition-colors">
                  {bar.price}
                </span>
                <div
                  style={{ height: bar.height }}
                  className={`w-full max-w-[48px] ${bar.color} rounded-t-lg transition-all duration-300 group-hover:brightness-110 shadow-2xs ${
                    bar.active ? "ring-2 ring-emerald-500 ring-offset-1" : ""
                  }`}
                />
                <span className={`text-[11px] sm:text-xs mt-2 font-medium ${
                  bar.active ? "font-bold text-emerald-800" : "text-gray-500"
                }`}>
                  {bar.day}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Filter and Search Bar */}
      <Card className="stagger-box p-3 sm:p-4 border-gray-200/90">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            placeholder="Search commodity, mandi, state..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
          />

          <Select
            value={cropFilter}
            onChange={(e) => setCropFilter(e.target.value)}
          >
            <option value="All">All Commodities</option>
            <option value="Tomato">Tomato (टमाटर)</option>
            <option value="Onion">Onion (प्याज)</option>
            <option value="Potato">Potato (आलू)</option>
            <option value="Wheat">Wheat (गेहूं)</option>
          </Select>

          <Select
            value={marketFilter}
            onChange={(e) => setMarketFilter(e.target.value)}
          >
            <option value="All">All Mandis & Clusters</option>
            <option value="Nashik">Nashik Region</option>
            <option value="Indore">Indore Region</option>
            <option value="Pune">Pune Region</option>
            <option value="Mumbai">Mumbai / Vashi</option>
            <option value="Bhopal">Bhopal Region</option>
          </Select>

          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="modalPriceDesc">Sort: Highest Price First</option>
            <option value="modalPriceAsc">Sort: Lowest Price First</option>
            <option value="distanceAsc">Sort: Nearest Mandi First</option>
            <option value="netRealization">Sort: Best Net Realization</option>
          </Select>
        </div>
      </Card>

      {/* Mandi Intelligence Table & Mobile Cards */}
      <div className="stagger-box">
        {isLoading ? (
          <LoadingState message="Fetching real-time APMC Mandi feeds..." />
        ) : filteredData.length === 0 ? (
          <EmptyState
            title="No Mandi Price Records Found"
            description="No markets match your search criteria. Try adjusting the crop or market filters."
            actionLabel="Reset All Filters"
            onAction={() => {
              setSearchQuery("");
              setCropFilter("All");
              setMarketFilter("All");
              setSortBy("modalPriceDesc");
            }}
          />
        ) : (
          <>
            {/* Desktop / Tablet Table View (hidden on mobile) */}
            <div className="hidden md:block bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/80 border-b border-gray-200 text-xs text-gray-500 uppercase font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Commodity & Mandi</th>
                      <th className="py-3.5 px-4">Min Price</th>
                      <th className="py-3.5 px-4">Max Price</th>
                      <th className="py-3.5 px-4 font-bold text-gray-900">Modal Price</th>
                      <th className="py-3.5 px-4">Arrival</th>
                      <th className="py-3.5 px-4">Distance</th>
                      <th className="py-3.5 px-4">Est. Net Realization</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredData.map((row) => {
                      const net = row.modalPrice - row.transportCost - row.storageCost;
                      return (
                        <tr
                          key={row.id}
                          className="hover:bg-gray-50/70 transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-gray-900">
                              {row.market}
                            </div>
                            <span className="text-xs text-gray-500">
                              {row.commodity} • {row.state}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-gray-600 font-medium">
                            ₹{row.minPrice}/q
                          </td>
                          <td className="py-3.5 px-4 text-gray-600 font-medium">
                            ₹{row.maxPrice}/q
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 font-bold text-gray-900 text-base">
                              ₹{row.modalPrice}
                              <span className="text-xs font-semibold text-emerald-600">
                                {row.trend}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-gray-600">
                            {row.arrival}
                          </td>
                          <td className="py-3.5 px-4 text-gray-600">
                            {row.distance} km
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-extrabold text-emerald-700 text-base">
                              ₹{net}/q
                            </div>
                            <span className="text-[11px] text-gray-400">
                              -₹{row.transportCost + row.storageCost} costs
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card List View (visible on < md) */}
            <div className="md:hidden space-y-3">
              {filteredData.map((row) => {
                const net = row.modalPrice - row.transportCost - row.storageCost;
                return (
                  <Card key={row.id} className="p-4 border-gray-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900 text-base">
                          {row.market}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {row.commodity} • {row.state} • {row.distance} km away
                        </p>
                      </div>
                      <Badge variant="emerald">{row.trend}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100 text-xs">
                      <div>
                        <span className="text-gray-400 block">Modal Price</span>
                        <span className="font-bold text-gray-900 text-sm">
                          ₹{row.modalPrice} / quintal
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Net Realization</span>
                        <span className="font-bold text-emerald-700 text-sm">
                          ₹{net} / quintal
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Range (Min - Max)</span>
                        <span className="font-medium text-gray-700">
                          ₹{row.minPrice} - ₹{row.maxPrice}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Arrival Volume</span>
                        <span className="font-medium text-gray-700">
                          {row.arrival}
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Net Realization Interactive Calculator */}
      <Card className="stagger-box border-gray-200/90">
        <CardHeader
          title="Net Realization Formula Calculator"
          subtitle="Net Realization = Mandi Modal Price − (Transport Overhead + Cold Storage / Handling)"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                Your Produce Quantity to Liquidate (Quintals)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full accent-emerald-600 h-2 bg-gray-200 rounded-lg cursor-pointer"
                />
                <span className="w-16 text-center font-bold text-emerald-700 text-base bg-emerald-50 py-1 rounded-lg border border-emerald-200">
                  {quantity} q
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Drag slider or adjust volume to project total pocket realization.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs bg-gray-50 p-3 rounded-xl border border-gray-200">
              <div>
                <span className="text-gray-400 block">Selected Mandi</span>
                <span className="font-bold text-gray-800">{refMandi.market}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Transport</span>
                <span className="font-bold text-gray-800">₹{refMandi.transportCost}/q</span>
              </div>
              <div>
                <span className="text-gray-400 block">Storage</span>
                <span className="font-bold text-gray-800">₹{refMandi.storageCost}/q</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-white p-5 rounded-2xl border border-emerald-200">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Projected Net Earnings (Pocket Value)
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-emerald-700">
                ₹{estTotalNet.toLocaleString()}
              </span>
              <span className="text-xs text-gray-500 font-medium">
                ({quantity} quintals)
              </span>
            </div>

            <p className="text-xs text-emerald-800 mt-2">
              Effective Net Rate: <strong>₹{estNetPerQuintal.toLocaleString()} / quintal</strong>
            </p>

            <p className="text-[11px] text-gray-400 mt-3 pt-3 border-t border-emerald-100 flex items-center gap-1">
              <Info size={13} className="text-emerald-600 flex-shrink-0" />
              Formula eliminates false high-mandi illusions by deducting real transit fuel & APMC cess.
            </p>
          </div>
        </div>
      </Card>

      {/* Recommended Option Card */}
      <div className="stagger-box bg-gradient-to-r from-emerald-700 to-emerald-800 text-white rounded-2xl p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-xs uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 border border-emerald-400/40 inline-flex items-center gap-1">
              <CheckCircle2 size={13} /> Algorithm Top Recommendation
            </span>
            <h3 className="text-xl sm:text-2xl font-bold">
              Nashik APMC Corridor
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl">
              Despite Mumbai's nominal ₹2,950/q, Nashik APMC yields ₹2,530/q net due to minimal ₹120/q transport cost (saving ₹430/q in diesel).
            </p>
          </div>

          <div className="flex items-center gap-4 bg-emerald-900/50 p-4 rounded-xl border border-emerald-600/50 flex-shrink-0">
            <div>
              <span className="text-[11px] text-emerald-200 block">Net Realization</span>
              <span className="text-2xl font-black text-white">₹2,530/q</span>
            </div>
            <div className="h-8 w-px bg-emerald-600/60" />
            <div>
              <span className="text-[11px] text-emerald-200 block">Distance</span>
              <span className="text-base font-bold text-white">18 km</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MarketIntelligence;