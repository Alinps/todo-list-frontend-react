import React from "react";
import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("is_admin") === "true";
  return token && isAdmin ? children : <Navigate to="/admin/login" />;
}

export default AdminRoute;
