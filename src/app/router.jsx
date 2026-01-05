import { Routes, Route } from "react-router-dom";
import Layout from "@/layouts/Layout";
import SplashPage from "@/features/SplashPage";
import ProtectedRoute from "@/features/auth/components/ProtectedRoute";
import LoginPage from "@/features/auth/pages/LoginPage";

export function Router() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<SplashPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/reservation"
          element={<ProtectedRoute>{/* <Reservation /> */}</ProtectedRoute>}
        />
      </Route>
      {/* other routes */}
    </Routes>
  );
}
