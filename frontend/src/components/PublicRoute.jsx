// PublicRoute.jsx - Updated to handle three roles
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  
  // Default fallback path
  const from = location.state?.from?.pathname || '/dashboard';

  if (isAuthenticated) {
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
      return <Navigate to={from} replace />;
    }
  }

  return children;
};
