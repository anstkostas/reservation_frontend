import { Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import Layout from "@/layouts/Layout";
import SplashPage from "@/features/SplashPage";
import ProtectedRoute from "@/features/auth/components/ProtectedRoute";
import LoginPage from "@/features/auth/pages/LoginPage";
import RestaurantList from "@/features/restaurants/pages/RestaurantList";
import RestaurantDetails from "@/features/restaurants/pages/RestaurantDetails";
import ReservationHistory from "@/features/reservations/pages/ReservationHistory";
import OwnerDashboard from "@/features/reservations/pages/OwnerDashboard";
import NotFoundPage from "@/features/misc/pages/NotFoundPage";
import ErrorFallback from "@/features/misc/components/ErrorFallback";

export function Router() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<SplashPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/restaurants" element={<RestaurantList />} />
          <Route path="/restaurants/:id" element={<RestaurantDetails />} />
          <Route
            path="/my-reservations"
            element={
              <ProtectedRoute role="customer">
                <ReservationHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner-dashboard"
            element={
              <ProtectedRoute role="owner">
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}
