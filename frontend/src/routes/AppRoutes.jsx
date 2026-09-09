import { Routes, Route } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import ProtectedRoute from "../components/common/ProtectedRoute";

import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Dashboard from "../pages/Dashboard/Dashboard";
import Market from "../pages/Market/Market";
import AssetDetail from "../pages/AssetDetail/AssetDetail";
import Portfolio from "../pages/Portfolio/Portfolio";
import Transactions from "../pages/Transactions/Transactions";
import Profile from "../pages/Profile/Profile";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes — share the authenticated layout (navbar + wallet indicator) */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/market" element={<Market />} />
        <Route path="/market/:assetId" element={<AssetDetail />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}
