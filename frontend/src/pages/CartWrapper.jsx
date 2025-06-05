import React from "react";
import { useUserStore } from "../store/useUserStore";
import { Navigate } from "react-router-dom";
import CartPage from "./CartPage";

export default function CartWrapper() {
  const { user } = useUserStore();
  return user ? <CartPage /> : <Navigate to="/login" replace />;
}
