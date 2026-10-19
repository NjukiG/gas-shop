import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

// AdminRoute guards the /admin area: only authenticated admins may enter.
// Non-admins are sent home; logged-out users to login.
const AdminRoute = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (user.Role !== "Admin") return <Navigate to="/" replace />;

  return <Outlet />;
};

export default AdminRoute;
