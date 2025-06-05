import React from "react";
import { Navigate } from "react-router-dom";

import { useUserStore } from "../store/useUserStore";
import SignUpPage from "./SignUpPage";
export default function SignUpWrapper() {
  const { user } = useUserStore();

  // Use Navigate instead of directly rendering HomePage
  return user ? <Navigate to="/" replace /> : <SignUpPage />;
}
