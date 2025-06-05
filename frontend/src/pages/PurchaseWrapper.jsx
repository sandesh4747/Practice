import React from "react";
import { Navigate } from "react-router-dom";
import PurchaseSuccessPage from "./PurchaseSuccessPage";
import { useUserStore } from "../store/useUserStore";

export default function PurchaseWrapper() {
  const { user } = useUserStore();
  return user ? <PurchaseSuccessPage /> : <Navigate to={"/login"} />;
}
