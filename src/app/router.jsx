import { Routes, Route } from "react-router-dom";
import Navbar from "@/layouts/Navbar";
import SplashPage from "@/pages/SplashPage";
import ProtectedRoute from "@/features/auth/components/ProtectedRoute";
import LoginPage from "@/features/auth/pages/LoginPage";

export default function Router() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/reservation"
          element={<ProtectedRoute>{/* <Reservation /> */}</ProtectedRoute>}
        />
        {/* other routes */}
      </Routes>
    </>
  );
}
