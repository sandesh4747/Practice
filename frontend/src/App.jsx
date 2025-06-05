import React, { useEffect } from "react";

import RootLayout from "./components/RootLayout";
import HomePage from "./pages/HomePage";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import SignUpPage from "./pages/SignUpPage";

import { useUserStore } from "./store/useUserStore";
import LoginWrapper from "./pages/LoginWrapper";
import SignUpWrapper from "./pages/SignUpWrapper";
import LoadingSpinner from "./components/LoadingSpinner";
import AdminWrapper from "./pages/AdminWrapper";
import CategoryPage from "./pages/CategoryPage";
import CartWrapper from "./pages/CartWrapper";
import { useCartStore } from "./store/useCartStore";
import Cat from "./pages/Cat";
import PurchaseWrapper from "./pages/PurchaseWrapper";
import PurchaseCancelPage from "./pages/PurchaseCancelPage";

export default function App() {
  const { checkAuth, checkingAuth, user } = useUserStore();
  const { getCartItems } = useCartStore();
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  useEffect(() => {
    if (user) getCartItems();
  }, [getCartItems, user]);

  if (checkingAuth) return <LoadingSpinner />;
  const router = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      children: [
        {
          index: true,
          element: <HomePage />,
        },
        {
          path: "/signup",
          element: <SignUpWrapper />,
        },
        {
          path: "/login",
          element: <LoginWrapper />,
        },
        {
          path: "/secret-dashboard",
          element: <AdminWrapper />,
        },
        {
          path: "/category/:category",
          element: <CategoryPage />,
        },
        {
          path: "/cart",
          element: <CartWrapper />,
        },
        {
          path: "/purchase-success",
          element: <PurchaseWrapper />,
        },
        {
          path: "/purchase-cancel",
          element: user ? <PurchaseCancelPage /> : <Navigate to="/login" />,
        },
      ],
    },
  ]);
  return <RouterProvider router={router} />;
}
