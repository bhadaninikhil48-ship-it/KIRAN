import { useState, useEffect, useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Shell Components
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import FloatingVoiceAssistant from "./components/FloatingVoiceAssistant";
import { LoadingState } from "./components/ui/LoadingState";
import LandingPage from "./pages/LandingPage";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Unauthorized from "./pages/auth/Unauthorized";

// Farmer Pages
import Dashboard from "./pages/Dashboard";
import SellProduce from "./pages/SellProduce";
import MarketIntelligence from "./pages/MarketIntelligence";
import Opportunities from "./pages/Opportunities";
import Offers from "./pages/Offers";
import Buyers from "./pages/Buyers";
import Transactions from "./pages/Transactions";
import TrustSupport from "./pages/TrustSupport";
import Profile from "./pages/farmer/Profile";

// Buyer Pages
import BuyerDashboard from "./pages/buyer/BuyerDashboard";
import BuyerRequirements from "./pages/buyer/BuyerRequirements";
import BuyerOffers from "./pages/buyer/BuyerOffers";
import BuyerContracts from "./pages/buyer/BuyerContracts";

// FPO Pages
import FPODashboard from "./pages/fpo/FPODashboard";

import PriceTrend from "./components/PriceTrend";
import "./App.css";

// Layout wrapper for authenticated pages
function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-900 flex flex-col lg:flex-row antialiased">
      {/* Sidebar */}
      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <Navbar onMenuToggle={() => setMobileMenuOpen((prev) => !prev)} />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0">
          <Outlet />
        </main>

        {/* Global Floating Voice Assistant for all authenticated roles */}
        <FloatingVoiceAssistant />
      </div>
    </div>
  );
}

// Smart root handler: exposes public Landing Page for guests, role dashboard for members
function HomeRoute() {
  const { user, token, loading, isLoggingOut, clearLoggingOut } = useContext(AuthContext);

  useEffect(() => {
    if (isLoggingOut) {
      clearLoggingOut();
    }
  }, [isLoggingOut, clearLoggingOut]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingState message="Verifying session..." />
      </div>
    );
  }

  const loggingOut =
    isLoggingOut ||
    (() => {
      try {
        return sessionStorage.getItem("kiran_logout") === "true";
      } catch {
        return false;
      }
    })();

  // If user just logged out, or has no session, render the public Landing Page (outside AppLayout, zero dashboard chrome)
  if (loggingOut || !token || !user) {
    return <LandingPage />;
  }

  if (user.role === "buyer") {
    return <Navigate to="/buyer/dashboard" replace />;
  }

  if (user.role === "fpo") {
    return <Navigate to="/fpo/dashboard" replace />;
  }

  return <Navigate to="/farmer/dashboard" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Route (Outside AppLayout - Zero Dashboard Chrome) */}
          <Route path="/" element={<HomeRoute />} />

          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Authenticated Platform App Layout */}
          <Route element={<AppLayout />}>
            {/* Farmer Dashboard Protected Route */}
            <Route
              path="/farmer/dashboard"
              element={
                <ProtectedRoute allowedRoles={["farmer"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Farmer Protected Routes */}
            <Route
              path="/sell"
              element={
                <ProtectedRoute allowedRoles={["farmer"]}>
                  <SellProduce />
                </ProtectedRoute>
              }
            />
            <Route
              path="/opportunities"
              element={
                <ProtectedRoute allowedRoles={["farmer"]}>
                  <Opportunities />
                </ProtectedRoute>
              }
            />
            <Route
              path="/offers"
              element={
                <ProtectedRoute allowedRoles={["farmer"]}>
                  <Offers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buyers"
              element={
                <ProtectedRoute allowedRoles={["farmer"]}>
                  <Buyers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute allowedRoles={["farmer"]}>
                  <Transactions />
                </ProtectedRoute>
              }
            />
            {/* User Profile Routes (accessible by all platform roles) */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={["farmer", "buyer", "fpo"]}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/farmer/profile"
              element={
                <ProtectedRoute allowedRoles={["farmer", "buyer", "fpo"]}>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Buyer Protected Routes */}
            <Route
              path="/buyer/dashboard"
              element={
                <ProtectedRoute allowedRoles={["buyer"]}>
                  <BuyerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buyer/requirements"
              element={
                <ProtectedRoute allowedRoles={["buyer"]}>
                  <BuyerRequirements />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buyer/offers"
              element={
                <ProtectedRoute allowedRoles={["buyer"]}>
                  <BuyerOffers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buyer/contracts"
              element={
                <ProtectedRoute allowedRoles={["buyer"]}>
                  <BuyerContracts />
                </ProtectedRoute>
              }
            />

            {/* FPO Protected Routes */}
            <Route
              path="/fpo/dashboard"
              element={
                <ProtectedRoute allowedRoles={["fpo"]}>
                  <FPODashboard />
                </ProtectedRoute>
              }
            />

            {/* Shared Authenticated Routes */}
            <Route
              path="/markets"
              element={
                <ProtectedRoute>
                  <MarketIntelligence />
                </ProtectedRoute>
              }
            />
            <Route
              path="/support"
              element={
                <ProtectedRoute>
                  <TrustSupport />
                </ProtectedRoute>
              }
            />
            <Route path="/price-trend-test" element={<PriceTrend />} />

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
