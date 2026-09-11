import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import MarketIntelligence from "./pages/MarketIntelligence";
import Offers from './pages/Offers';
import Transactions from "./pages/Transactions";

import Dashboard from './pages/Dashboard'
import SellProduce from './pages/SellProduce'
import Opportunities from "./pages/Opportunities";
import Buyers from './pages/Buyers';
import TrustSupport from "./pages/TrustSupport";

import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen w-full bg-gray-50">

        <Sidebar />

        <main className="flex-1 min-w-0">
          <Navbar />

          <div className="p-4 sm:p-6 lg:p-8">
            <Routes>

              <Route
                path="/"
                element={<Dashboard />}
              />

              <Route
                path="/sell"
                element={<SellProduce />}
              />

              <Route
                path="/markets"
                element={<MarketIntelligence />}
              />

              <Route
                path="/opportunities"
                element={<Opportunities />}
              />

              <Route path="/offers" element={<Offers />} />

              <Route path="/buyers" element={<Buyers />} />

              <Route path="/transactions" element={<Transactions />} />

              <Route path="/support" element={<TrustSupport />} />

            </Routes>



          </div>
        </main>

      </div>
    </BrowserRouter>
  );
}
export default App
