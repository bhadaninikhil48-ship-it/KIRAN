import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { LoadingState } from "./ui/LoadingState";

export function ProtectedRoute({ children, allowedRoles }) {
  const { user, token, loading, isLoggingOut } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingState message="Verifying session..." />
      </div>
    );
  }

  // If a logout is currently in progress, navigate cleanly to "/" instead of "/login"
  const loggingOut =
    isLoggingOut ||
    (() => {
      try {
        return sessionStorage.getItem("kiran_logout") === "true";
      } catch {
        return false;
      }
    })();

  if (loggingOut) {
    return <Navigate to="/" replace />;
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default ProtectedRoute;
