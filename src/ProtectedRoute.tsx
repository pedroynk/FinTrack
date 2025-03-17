import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LoadingFallback from "./components/LoadingFallback";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading)
    return <LoadingFallback />

  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}
