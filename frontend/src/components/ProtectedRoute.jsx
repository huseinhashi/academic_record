// ProtectedRoute.jsx - Updated to handle three roles
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const ProtectedRoute = ({ children, requiredType }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a specific user type is required, check if the current user has that type
  if (requiredType && user?.userType !== requiredType) {
    // Redirect to the appropriate dashboard based on user type
    if (user?.userType === "Admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user?.userType === "Student") {
      return <Navigate to="/student/dashboard" replace />;
    } else if (user?.userType === "Institution") {
      return <Navigate to="/institution/dashboard" replace />;
    } else if (user?.userType === "Company") {
      return <Navigate to="/company/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};
