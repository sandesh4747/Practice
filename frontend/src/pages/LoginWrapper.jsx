import React from "react";
import { Navigate } from "react-router-dom";
import LoginPage from "./LoginPage";
import { useUserStore } from "../store/useUserStore";
export default function LoginWrapper() {
  const { user } = useUserStore();

  // Use Navigate instead of directly rendering HomePage
  return user ? <Navigate to="/" replace /> : <LoginPage />;
}

/*


Step	Code	Purpose
1️⃣	useEffect(() => checkAuth(), [checkAuth])	Runs on first render after refresh
2️⃣	checkAuth() in useUserStore	Calls backend /auth/profile to check if you're still logged in
3️⃣	set({ user: res.data })	Updates the state with your user info
4️⃣	LoginWrapper uses user from store	Automatically redirects you away from login if you're logged in*/
