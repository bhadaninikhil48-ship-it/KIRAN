import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Unauthorized from "./pages/auth/Unauthorized";

import FarmerDashboard from "./pages/farmer/Dashboard";
import FPODashboard from "./pages/fpo/Dashboard";
import BuyerDashboard from "./pages/buyer/Dashboard";
import FarmerProfile from "./pages/farmer/Profile";
import AddProduce from "./pages/farmer/AddProduce";
import MyProduce from "./pages/farmer/MyProduce";
import MarketIntelligence from "./pages/farmer/MarketIntelligence";
import ProfitCalculator from "./pages/farmer/ProfitCalculator";
import BestOpportunity from "./pages/farmer/BestOpportunity";
import CreateRequirement from "./pages/buyer/CreateRequirement";
import MyRequirements from "./pages/buyer/MyRequirements";
import FindBuyers from "./pages/farmer/FindBuyers";
import CreateOffer from "./pages/farmer/CreateOffer";
import Offers from "./pages/buyer/Offers";
import BuyerContracts from "./pages/buyer/Contracts";
import FarmerContracts from "./pages/farmer/Contracts";

function App() {

  return (
    <AuthProvider>

      <BrowserRouter>

        <Routes>

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/unauthorized"
            element={<Unauthorized />}
          />

          <Route
            path="/farmer/dashboard"
            element={
              <ProtectedRoute allowedRoles={["farmer"]}>
                <FarmerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/fpo/dashboard"
            element={
              <ProtectedRoute allowedRoles={["fpo"]}>
                <FPODashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/buyer/dashboard"
            element={
              <ProtectedRoute allowedRoles={["buyer"]}>
                <BuyerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/farmer/profile"
            element={
              <ProtectedRoute allowedRoles={["farmer"]}>
                <FarmerProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/farmer/add-produce"
            element={
              <ProtectedRoute allowedRoles={["farmer"]}>
                <AddProduce />
              </ProtectedRoute>
            }
          />

          <Route
            path="/farmer/my-produce"
            element={
              <ProtectedRoute allowedRoles={["farmer"]}>
                <MyProduce />
              </ProtectedRoute>
            }
          />

          <Route
            path="/farmer/market-intelligence"
            element={
              <ProtectedRoute allowedRoles={["farmer"]}>
                <MarketIntelligence />
              </ProtectedRoute>
            }
          />

          <Route
            path="/farmer/profit-calculator"
            element={
              <ProtectedRoute allowedRoles={["farmer"]}>
                <ProfitCalculator />
              </ProtectedRoute>
            }
          />

          <Route
            path="/farmer/best-opportunity"
            element={
              <ProtectedRoute allowedRoles={["farmer"]}>
                <BestOpportunity />
              </ProtectedRoute>
            }
          />

          <Route
            path="/buyer/create-requirement"
            element={
              <ProtectedRoute allowedRoles={["buyer"]}>
                <CreateRequirement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/buyer/my-requirements"
            element={
              <ProtectedRoute allowedRoles={["buyer"]}>
                <MyRequirements />
              </ProtectedRoute>
            }
          />

          <Route
            path="/farmer/find-buyers"
            element={
              <ProtectedRoute allowedRoles={["farmer"]}>
                <FindBuyers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/farmer/create-offer"
            element={
              <ProtectedRoute allowedRoles={["farmer"]}>
                <CreateOffer />
              </ProtectedRoute>
            }
          />

          <Route
            path="/buyer/offers"
            element={
              <ProtectedRoute allowedRoles={["buyer"]}>
                <Offers />
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

          <Route
            path="/farmer/contracts"
            element={
              <ProtectedRoute allowedRoles={["farmer"]}>
                <FarmerContracts />
              </ProtectedRoute>
            }
          />

        </Routes>

      </BrowserRouter>

    </AuthProvider>
  );
}

export default App;