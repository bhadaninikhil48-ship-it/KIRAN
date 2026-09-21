import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  Info,
  RefreshCw,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Store,
  ArrowUpDown,
  Filter,
  Calendar,
  X,
  ChevronRight,
  BarChart3,
  Sliders,
  DollarSign,
  Package,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

import { Card, CardHeader } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { EmptyState } from "../components/ui/EmptyState";
import { LoadingState } from "../components/ui/LoadingState";
import { CropImage } from "../components/ui/CropImage";
import { animateStagger } from "../utils/animations";

import PriceTrend from "../components/PriceTrend";

const allMandiData = [
  {
    id: 1,
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
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function MarketIntelligence() {
  const [searchQuery, setSearchQuery] = useState("");
  const [cropFilter, setCropFilter] = useState("All");
  const [marketFilter, setMarketFilter] = useState("All");
  const [sortBy, setSortBy] = useState("modalPriceDesc");
  const [quantity, setQuantity] = useState(8); // quintals
  const [isLoading, setIsLoading] = useState(false);
  const [apiData, setApiData] = useState([]);
  const [selectedState, setSelectedState] = useState("Bihar");
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [markets, setMarkets] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState("");
  const [dataDate, setDataDate] = useState("");
  const [selectedTrendRow, setSelectedTrendRow] = useState(null);

  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      animateStagger(containerRef.current.querySelectorAll(".stagger-box"), {
        delay: 0.05,
      });
    }
  }, []);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        let url = `${API_BASE_URL}/price?state=${encodeURIComponent(selectedState)}`;

        if (selectedDistrict) {
          url += `&district=${encodeURIComponent(selectedDistrict)}`;
        }

        if (selectedMarket) {
          url += `&market=${encodeURIComponent(selectedMarket)}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch market data");
        }

        const data = await response.json();
        setApiData(data.records || []);

        const date = data.records?.[0]?.arrival_date || "";
        setDataDate(date);
      } catch (error) {
        console.error("Market API Error =", error);
      }
    };

    fetchMarketData();
  }, [selectedState, selectedDistrict, selectedMarket]);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const stateName = selectedState.toLowerCase().replace(/\s+/g, "-");

        const response = await fetch(
          `https://aniket-thapa.github.io/india-pincode-api/states/${stateName}.json`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch districts");
        }

        const data = await response.json();
        setDistricts(data.districts || []);
        setSelectedDistrict("");
      } catch (error) {
        console.error("District API Error =", error);
        setDistricts([]);
        setSelectedDistrict("");
      }
    };

    fetchDistricts();
  }, [selectedState]);

  useEffect(() => {
    const fetchMarkets = async () => {
      if (!selectedDistrict) {
        setMarkets([]);
        setSelectedMarket("");
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/price/markets?state=${encodeURIComponent(
            selectedState
          )}&district=${encodeURIComponent(selectedDistrict)}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch markets");
        }

        const data = await response.json();
        setMarkets(data.markets || []);
        setSelectedMarket("");
      } catch (error) {
        console.error("Market API Error =", error);
        setMarkets([]);
        setSelectedMarket("");
      }
    };

    fetchMarkets();
  }, [selectedState, selectedDistrict]);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 600);
  };

  // Filtered and sorted real API data
  const filteredData = useMemo(() => {
    return apiData
      .map((item, index) => ({
        id: index,
        state: item.state,
        district: item.district,
        market: item.market,
        commodity: item.commodity,
        variety: item.variety,
        grade: item.grade,
        arrivalDate: item.arrival_date,

        minPrice: Number(item.min_price),
        maxPrice: Number(item.max_price),
        modalPrice: Number(item.modal_price),

        // These will be connected later
        distance: null,
        transportCost: null,
        storageCost: null,
        trend: null,
      }))
      .filter((item) => {
        const matchesSearch =
          item.market?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.commodity?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.state?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCrop =
          cropFilter === "All" ||
          item.commodity?.toLowerCase() === cropFilter.toLowerCase();

        const matchesMarket =
          marketFilter === "All" ||
          item.market?.toLowerCase().includes(marketFilter.toLowerCase());

        return matchesSearch && matchesCrop && matchesMarket;
      })
      .sort((a, b) => {
        if (sortBy === "modalPriceDesc") {
          return b.modalPrice - a.modalPrice;
        }

        if (sortBy === "modalPriceAsc") {
          return a.modalPrice - b.modalPrice;
        }

        return 0;
      });
  }, [apiData, searchQuery, cropFilter, marketFilter, sortBy]);

  // Selected reference mandi for calculation
  const refMandi = filteredData[0] || allMandiData[0];

  const estNetPerQuintal =
    refMandi.modalPrice -
    (refMandi.transportCost || 0) -
    (refMandi.storageCost || 0);

  const estTotalNet = estNetPerQuintal * quantity;

  // Real-time summary statistics derived from filteredData
  const summaryStats = useMemo(() => {
    if (filteredData.length === 0) return null;
    const modalPrices = filteredData.map((d) => d.modalPrice).filter((p) => !isNaN(p) && p > 0);
    const minPrices = filteredData.map((d) => d.minPrice).filter((p) => !isNaN(p) && p > 0);
    const maxPrices = filteredData.map((d) => d.maxPrice).filter((p) => !isNaN(p) && p > 0);

    const highestModal = modalPrices.length > 0 ? Math.max(...modalPrices) : 0;
    const lowestMin = minPrices.length > 0 ? Math.min(...minPrices) : 0;
    const highestMax = maxPrices.length > 0 ? Math.max(...maxPrices) : 0;
    const avgModal =
      modalPrices.length > 0
        ? Math.round(modalPrices.reduce((a, b) => a + b, 0) / modalPrices.length)
        : 0;

    return {
      highestModal,
      lowestMin,
      highestMax,
      avgModal,
      totalCount: filteredData.length,
    };
  }, [filteredData]);

  // Helper for price spread bar position
  const getPriceSpreadPct = (min, modal, max) => {
    if (!max || !min || max <= min) return 50;
    const pct = ((modal - min) / (max - min)) * 100;
    return Math.max(8, Math.min(92, pct));
  };

  return (
    <div ref={containerRef} className="space-y-6 sm:space-y-8 min-w-0">
      {/* 1. Page Header */}
      <div className="stagger-box bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200/60 shadow-2xs">
              <Store size={22} />
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  Market Intelligence & Mandi Analytics
                </h1>

                {dataDate ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Feed Date: {dataDate}
                  </span>
                ) : (
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                    Live Mandi Synchronization
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-gray-500 max-w-2xl font-normal leading-relaxed">
                Real-time APMC price benchmarks, arrival volumes, and logistics-adjusted net realizations across national mandis.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
            <Button
              size="sm"
              variant="outline"
              icon={RefreshCw}
              loading={isLoading}
              onClick={handleRefresh}
              className="font-medium text-gray-700"
            >
              Sync APMC Feeds
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Top Summary KPI Bar (when filteredData exists) */}
      {summaryStats && (
        <div className="stagger-box grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Top Mandi Modal Rate */}
          <Card className="border-gray-200/90 hover:border-emerald-300 hover:shadow-xs transition-all p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Top Mandi Rate
                </p>
                <div className="flex items-baseline gap-1 mt-1">
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                    ₹{summaryStats.highestModal.toLocaleString()}
                  </h3>
                  <span className="text-xs font-medium text-gray-400">/q</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <TrendingUp size={20} />
              </div>
            </div>
            <p className="text-xs text-emerald-700 mt-3 pt-3 border-t border-gray-100 font-medium">
              Highest modal rate in active view
            </p>
          </Card>

          {/* Card 2: Floor / Minimum Benchmark */}
          <Card className="border-gray-200/90 hover:border-emerald-300 hover:shadow-xs transition-all p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Floor Benchmark
                </p>
                <div className="flex items-baseline gap-1 mt-1">
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                    ₹{summaryStats.lowestMin.toLocaleString()}
                  </h3>
                  <span className="text-xs font-medium text-gray-400">/q</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <BarChart3 size={20} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100 font-medium">
              Lowest recorded minimum price
            </p>
          </Card>

          {/* Card 3: Average Benchmark Rate */}
          <Card className="border-gray-200/90 hover:border-emerald-300 hover:shadow-xs transition-all p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Average Modal Price
                </p>
                <div className="flex items-baseline gap-1 mt-1">
                  <h3 className="text-2xl sm:text-3xl font-bold text-emerald-700 tracking-tight">
                    ₹{summaryStats.avgModal.toLocaleString()}
                  </h3>
                  <span className="text-xs font-medium text-gray-400">/q</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <DollarSign size={20} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100 font-medium">
              Average across {summaryStats.totalCount} active centers
            </p>
          </Card>

          {/* Card 4: Active Mandi Centers */}
          <Card className="border-gray-200/90 hover:border-emerald-300 hover:shadow-xs transition-all p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Reporting Mandis
                </p>
                <div className="flex items-baseline gap-1 mt-1">
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                    {summaryStats.totalCount}
                  </h3>
                  <span className="text-xs font-medium text-gray-400">Centers</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <MapPin size={20} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100 font-medium truncate">
              In {selectedState} {selectedDistrict ? `• ${selectedDistrict}` : ""}
            </p>
          </Card>
        </div>
      )}

      {/* 3. Filter and Search Bar */}
      <Card className="stagger-box p-4 sm:p-5 border-gray-200/90 shadow-xs">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-emerald-600" />
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Mandi Location & Commodity Filter
              </span>
            </div>

            {(searchQuery || selectedDistrict || selectedMarket || sortBy !== "modalPriceDesc") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDistrict("");
                  setSelectedMarket("");
                  setCropFilter("All");
                  setMarketFilter("All");
                  setSortBy("modalPriceDesc");
                }}
                className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer hover:underline"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* State Filter */}
            <Select
              label="State"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
            >
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Arunachal Pradesh">Arunachal Pradesh</option>
              <option value="Assam">Assam</option>
              <option value="Bihar">Bihar</option>
              <option value="Chhattisgarh">Chhattisgarh</option>
              <option value="Goa">Goa</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Haryana">Haryana</option>
              <option value="Himachal Pradesh">Himachal Pradesh</option>
              <option value="Jharkhand">Jharkhand</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Kerala">Kerala</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Manipur">Manipur</option>
              <option value="Meghalaya">Meghalaya</option>
              <option value="Mizoram">Mizoram</option>
              <option value="Nagaland">Nagaland</option>
              <option value="Odisha">Odisha</option>
              <option value="Punjab">Punjab</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Sikkim">Sikkim</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Telangana">Telangana</option>
              <option value="Tripura">Tripura</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Uttarakhand">Uttarakhand</option>
              <option value="West Bengal">West Bengal</option>
            </Select>

            {/* District Filter */}
            <Select
              label="District"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              disabled={districts.length === 0}
            >
              <option value="">
                {districts.length === 0 ? "Loading Districts..." : "All Districts"}
              </option>

              {districts.map((district) => (
                <option key={district.slug || district.name} value={district.name}>
                  {district.name}
                </option>
              ))}
            </Select>

            {/* Market Filter */}
            <Select
              label="Market Center"
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              disabled={!selectedDistrict}
            >
              <option value="">
                {!selectedDistrict
                  ? "Select District First"
                  : markets.length === 0
                  ? "Loading Markets..."
                  : "All Markets"}
              </option>

              {markets.map((market) => (
                <option key={market} value={market}>
                  {market}
                </option>
              ))}
            </Select>

            {/* Sort Filter */}
            <Select
              label="Sort By"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="modalPriceDesc">Highest Modal Rate</option>
              <option value="modalPriceAsc">Lowest Modal Rate</option>
            </Select>

            {/* Search Input */}
            <Input
              label="Search"
              placeholder="Commodity, mandi, state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={Search}
            />
          </div>
        </div>
      </Card>

      {/* 4. Mandi Intelligence Table & Mobile Cards */}
      <div className="stagger-box">
        {isLoading ? (
          <LoadingState message="Fetching real-time APMC Mandi feeds..." />
        ) : filteredData.length === 0 ? (
          <EmptyState
            title="No Mandi Price Records Found"
            description="No markets match your filter or search criteria. Try selecting another state or clearing the search keyword."
            actionLabel="Reset All Filters"
            icon={Store}
            onAction={() => {
              setSearchQuery("");
              setSelectedDistrict("");
              setSelectedMarket("");
              setCropFilter("All");
              setMarketFilter("All");
              setSortBy("modalPriceDesc");
            }}
          />
        ) : (
          <>
            {/* Desktop / Tablet Table View */}
            <div className="hidden md:block bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  {/* Modern High-Contrast Table Header */}
                  <thead className="bg-gray-50/90 text-gray-600 text-xs font-semibold uppercase tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="py-3.5 px-5">Commodity & Grade</th>
                      <th className="py-3.5 px-5">APMC Mandi</th>
                      <th className="py-3.5 px-5">Price Range (Min - Max)</th>
                      <th className="py-3.5 px-5">Modal Rate</th>
                      <th className="py-3.5 px-5">Arrival Date</th>
                      <th className="py-3.5 px-5">Est. Net Realization</th>
                      <th className="py-3.5 px-5 text-center">Price Trend</th>
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody className="divide-y divide-gray-100">
                    {filteredData.map((row) => {
                      const net =
                        row.modalPrice -
                        (row.transportCost || 0) -
                        (row.storageCost || 0);

                      return (
                        <tr
                          key={row.id}
                          className="hover:bg-emerald-50/40 transition-colors"
                        >
                          {/* Commodity */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3.5">
                              <CropImage
                                crop={row.commodity}
                                size="table"
                                className="rounded-xl shadow-xs shrink-0"
                              />
                              <div>
                                <div className="font-bold text-stone-900 text-base sm:text-lg leading-tight">
                                  {row.commodity}
                                </div>
                                <span className="text-[11px] text-stone-500 font-medium mt-0.5 block">
                                  Mandi Benchmark
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Mandi & District */}
                          <td className="py-4 px-5">
                            <div className="font-semibold text-gray-800">
                              {row.market}
                            </div>
                            <span className="text-xs text-gray-500">
                              {row.district ? `${row.district}, ` : ""}
                              {row.state}
                            </span>
                          </td>

                          {/* Price Range with visual spread */}
                          <td className="py-4 px-5 min-w-[160px]">
                            <div className="flex items-center justify-between text-xs text-gray-600 font-medium mb-1">
                              <span>₹{row.minPrice}</span>
                              <span className="text-gray-400">to</span>
                              <span>₹{row.maxPrice}</span>
                            </div>

                            {/* Range track */}
                            <div className="relative w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-emerald-500 rounded-full" />
                              <div
                                className="absolute top-0 bottom-0 w-2 bg-white rounded-full shadow border border-gray-400 -translate-x-1/2"
                                style={{
                                  left: `${getPriceSpreadPct(
                                    row.minPrice,
                                    row.modalPrice,
                                    row.maxPrice
                                  )}%`,
                                }}
                              />
                            </div>
                          </td>

                          {/* Modal Price */}
                          <td className="py-4 px-5">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-extrabold text-base border border-emerald-200/80">
                              ₹{row.modalPrice.toLocaleString()}
                              <span className="text-[11px] font-normal text-emerald-700">/q</span>
                            </div>
                          </td>

                          {/* Arrival Date */}
                          <td className="py-4 px-5 text-gray-600 text-xs font-medium">
                            {row.arrivalDate || "—"}
                          </td>

                          {/* Net Realization */}
                          <td className="py-4 px-5">
                            <div className="font-bold text-gray-900 text-sm">
                              ₹{net.toLocaleString()}/q
                            </div>
                            <span className="text-[11px] text-gray-400 block">
                              ₹{(row.transportCost || 0) + (row.storageCost || 0)} overheads
                            </span>
                          </td>

                          {/* Price Trend Action */}
                          <td className="py-4 px-5 text-center">
                            <button
                              type="button"
                              onClick={() => setSelectedTrendRow(row)}
                              className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white transition-all shadow-2xs cursor-pointer"
                              title="View 7-day price history & trend graph"
                            >
                              <TrendingUp size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden space-y-3">
              {filteredData.map((row) => {
                const net =
                  row.modalPrice -
                  (row.transportCost || 0) -
                  (row.storageCost || 0);

                return (
                  <Card
                    key={row.id}
                    className="p-4 border-gray-200/90 hover:border-emerald-300 transition-all shadow-xs"
                  >

                    <div className="flex items-start gap-3">
                      <CropImage
                        crop={row.commodity}
                        size="card"
                        className="rounded-xl shadow-xs shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-gray-900 text-base leading-tight">
                            {row.market}
                          </h4>
                          <Badge variant="emerald" className="shrink-0 text-[11px]">
                            {row.trend}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mt-1">
                          <strong className="text-gray-900">{row.commodity}</strong> • {row.state} • {row.distance} km away
                        </p>
                      </div>
                    </div>


                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100 text-xs">

                      <div>

                        <span className="text-gray-400 block">
                          Modal Price
                        </span>
                        <span className="text-[10px] text-gray-400 block">/ quintal</span>
                      </div>
                    </div>

                    {/* Price Range Bar on Mobile */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Min: ₹{row.minPrice}</span>
                        <span className="text-emerald-700 font-semibold">
                          Modal: ₹{row.modalPrice}
                        </span>
                        <span>Max: ₹{row.maxPrice}</span>
                      </div>
                      <div className="relative w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-emerald-500 rounded-full" />
                        <div
                          className="absolute top-0 bottom-0 w-2 bg-white rounded-full shadow border border-gray-400 -translate-x-1/2"
                          style={{
                            left: `${getPriceSpreadPct(
                              row.minPrice,
                              row.modalPrice,
                              row.maxPrice
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100 text-xs">
                      <div>
                        <span className="text-gray-400 block text-[11px]">Net Realization</span>
                        <span className="font-bold text-gray-900">₹{net}/q</span>
                      </div>

                      <div>
                        <span className="text-gray-400 block text-[11px]">Feed Date</span>
                        <span className="font-medium text-gray-700">{row.arrivalDate || "—"}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-end">
                      <Button
                        size="xs"
                        variant="secondary"
                        onClick={() => setSelectedTrendRow(row)}
                        icon={TrendingUp}
                        className="font-semibold"
                      >
                        View 7-Day Trend
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* 5. Top Benchmark Card & Recommendation */}
      <div className="stagger-box grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <Card className="hover:border-emerald-300">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <CropImage crop="Tomato" size="card" className="rounded-xl shadow-xs shrink-0" />
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase">
                  Nashik APMC • Maharashtra
                </span>

                <h3 className="text-base sm:text-lg font-bold text-gray-900 mt-0.5">
                  Tomato Modal Rate
                </h3>
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                ₹2,700
              </span>
              <span className="text-xs text-gray-500 font-medium">/ quintal</span>
            </div>
          </div>

          <p className="text-xs text-emerald-700 font-medium mt-3 pt-3 border-t border-gray-100 flex items-center gap-1">
            <CheckCircle2 size={13} />
            Net Realization: ₹2,530/q (Short haul 18 km corridor)
          </p>
        </Card>

        {/* Algorithm Top Recommendation Corridor Card */}
        <div className="sm:col-span-1 lg:col-span-2 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <span className="text-xs uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 border border-emerald-400/40 inline-flex items-center gap-1">
                <Sparkles size={13} />
                Algorithm Top Recommendation
              </span>

              <h3 className="text-xl sm:text-2xl font-bold">
                Nashik APMC Corridor
              </h3>

              <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl font-normal leading-relaxed">
                Despite Mumbai's nominal ₹2,950/q, Nashik APMC yields ₹2,530/q net due to minimal ₹120/q transport cost (saving ₹430/q in diesel transit expenses).
              </p>
            </div>

            <div className="flex items-center gap-4 bg-emerald-950/50 p-3.5 rounded-xl border border-emerald-600/50 shrink-0">
              <div>
                <span className="text-[11px] text-emerald-200 block">Net Realization</span>
                <span className="text-2xl font-black text-white">₹2,530/q</span>
              </div>

              <div className="h-8 w-px bg-emerald-600/60" />

              <div>
                <span className="text-[11px] text-emerald-200 block">Corridor Dist.</span>
                <span className="text-base font-bold text-white">18 km</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. 7-Day Price Movement Visualization */}
      <Card className="stagger-box border-gray-200/90 shadow-xs">
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
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
              High Market Momentum
            </span>
          </div>
        </div>

        {/* Responsive Bar Visualization */}
        <div className="pt-2">
          <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 sm:h-52 px-2">
            {[
              {
                day: "Today",
                price: "₹2,750",
                height: "94%",
                color: "bg-emerald-700",
                active: true,
              },
            ].map((bar, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center h-full justify-end group"
              >
                <span className="text-[10px] sm:text-xs font-bold text-gray-600 mb-1.5 opacity-80 group-hover:opacity-100 group-hover:text-emerald-700 transition-colors">
                  {bar.price}
                </span>

                <div
                  style={{ height: bar.height }}
                  className={`w-full max-w-[48px] ${bar.color} rounded-t-lg transition-all duration-300 group-hover:brightness-110 shadow-2xs ${
                    bar.active ? "ring-2 ring-emerald-500 ring-offset-1" : ""
                  }`}
                />

                <span
                  className={`text-[11px] sm:text-xs mt-2 font-medium ${
                    bar.active ? "font-bold text-emerald-800" : "text-gray-500"
                  }`}
                >
                  {bar.day}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 7. Net Realization Interactive Calculator */}
      <Card className="stagger-box border-gray-200/90 shadow-xs">
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

                <span className="w-16 text-center font-bold text-emerald-700 text-base bg-emerald-50 py-1 rounded-lg border border-emerald-200 shrink-0">
                  {quantity} q
                </span>
              </div>

              <p className="text-xs text-gray-400 mt-1">
                Drag slider or adjust volume to project total pocket realization.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs bg-gray-50 p-3 rounded-xl border border-gray-200">
              <div>
                <span className="text-gray-400 block text-[11px]">Selected Mandi</span>
                <span className="font-bold text-gray-800 truncate block">
                  {refMandi.market}
                </span>
              </div>

              <div>
                <span className="text-gray-400 block text-[11px]">Transport</span>
                <span className="font-bold text-gray-800">
                  ₹{refMandi.transportCost || 0}/q
                </span>
              </div>

              <div>
                <span className="text-gray-400 block text-[11px]">Storage</span>
                <span className="font-bold text-gray-800">
                  ₹{refMandi.storageCost || 0}/q
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50/60 via-white to-white p-5 rounded-2xl border border-emerald-200 shadow-2xs">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Projected Net Earnings (Pocket Value)
            </span>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-emerald-700 tracking-tight">
                ₹{estTotalNet.toLocaleString()}
              </span>

              <span className="text-xs text-gray-500 font-medium">
                ({quantity} quintals)
              </span>
            </div>

            <p className="text-xs text-emerald-800 mt-2 font-medium">
              Effective Net Rate:{" "}
              <strong>₹{estNetPerQuintal.toLocaleString()} / quintal</strong>
            </p>

            <p className="text-[11px] text-gray-400 mt-3 pt-3 border-t border-emerald-100 flex items-center gap-1 font-medium">
              <Info size={13} className="text-emerald-600 shrink-0" />
              Formula eliminates false high-mandi illusions by deducting real transit fuel & APMC cess.
            </p>
          </div>
        </div>
      </Card>

      {/* 8. Price Trend Modal */}
      {selectedTrendRow && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4"
          onClick={() => setSelectedTrendRow(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedTrendRow(null)}
              aria-label="Close modal"
              className="absolute right-4 top-4 z-10 w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <PriceTrend
              state={selectedTrendRow.state}
              district={selectedTrendRow.district}
              market={selectedTrendRow.market}
              commodity={selectedTrendRow.commodity}
              variety={selectedTrendRow.variety}
              grade={selectedTrendRow.grade}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default MarketIntelligence;
