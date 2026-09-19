import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import SellProduce from "./pages/SellProduce";
import MarketIntelligence from "./pages/MarketIntelligence";
import Opportunities from "./pages/Opportunities";
import Offers from "./pages/Offers";
import Buyers from "./pages/Buyers";
import Transactions from "./pages/Transactions";
import TrustSupport from "./pages/TrustSupport";

import PriceTrend from "./components/PriceTrend";

import "./App.css";

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <BrowserRouter>
      <div className="min-h-screen w-full bg-gray-50 text-gray-900 flex flex-col lg:flex-row antialiased">
        {/* Sidebar (Fixed on Desktop, Slide Drawer on Mobile) */}
        <Sidebar
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        {/* Main Content Area */}
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${isCollapsed ? "lg:pl-20" : "lg:pl-64"
            }`}
        >
          <Navbar onMenuToggle={() => setMobileMenuOpen((prev) => !prev)} />

          <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/sell" element={<SellProduce />} />
              <Route path="/markets" element={<MarketIntelligence />} />
              <Route path="/opportunities" element={<Opportunities />} />
              <Route path="/offers" element={<Offers />} />
              <Route path="/buyers" element={<Buyers />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/support" element={<TrustSupport />} />

              <Route path="/price-trend-test" element={<PriceTrend />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
