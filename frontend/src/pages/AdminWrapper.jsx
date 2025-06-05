import React from "react";
import { Navigate } from "react-router-dom";

import { useUserStore } from "../store/useUserStore";
import AdminPage from "./AdminPage";
export default function AdminWrapper() {
  const { user } = useUserStore();

  // Use Navigate instead of directly rendering HomePage
  return user?.role === "admin" ? (
    <AdminPage />
  ) : (
    <Navigate to="/login" replace />
  );
}
