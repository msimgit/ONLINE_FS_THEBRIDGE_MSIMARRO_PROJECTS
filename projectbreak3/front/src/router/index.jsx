// Sprint 13 - React Router: definición de rutas, rutas anidadas (children) y rutas dinámicas (:id).
import { createBrowserRouter } from "react-router-dom";

import AdminDashboardPage from "../pages/AdminDashboardPage/AdminDashboardPage";
import AdminRoute from "../components/AdminRoute/AdminRoute";
import AdminPage from "../pages/AdminPage/AdminPage";
import AdminProductsPage from "../pages/AdminProductsPage/AdminProductsPage";
import AdminProductFormPage from "../pages/AdminProductFormPage/AdminProductFormPage";
import AdminReturnsPage from "../pages/AdminReturnsPage/AdminReturnsPage";
import AdminReviewsPage from "../pages/AdminReviewsPage/AdminReviewsPage";
import CartPage from "../pages/CartPage/CartPage";
import CheckoutSuccessPage from "../pages/CheckoutSuccessPage/CheckoutSuccessPage";
import CustomerRoute from "../components/CustomerRoute/CustomerRoute";
import HomePage from "../pages/HomePage/HomePage";
import Layout from "../components/Layout/Layout";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import LoginPage from "../pages/LoginPage/LoginPage";
import PrivateRoute from "../components/PrivateRoute/PrivateRoute";
import ProductsPage from "../pages/ProductsPage/ProductsPage";
import ProductDetailPage from "../pages/ProductDetailPage/ProductDetailPage";
import ProfilePage from "../pages/ProfilePage/ProfilePage";
import RegisterPage from "../pages/RegisterPage/RegisterPage";
import WishlistPage from "../pages/WishlistPage/WishlistPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "products/:id", element: <ProductDetailPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      {
        element: <PrivateRoute />,
        children: [
          {
            element: <CustomerRoute />,
            children: [{ path: "cart", element: <CartPage /> }],
          },
          { path: "wishlist", element: <WishlistPage /> },
          { path: "profile", element: <ProfilePage /> },
          { path: "checkout/success", element: <CheckoutSuccessPage /> },
        ],
      },
      {
        element: <AdminRoute />,
        children: [
          {
  path: "admin",
  element: <AdminPage />,
  children: [
    { index: true, element: <AdminDashboardPage /> },
    { path: "products", element: <AdminProductsPage /> },
    { path: "products/new", element: <AdminProductFormPage /> },
    { path: "products/:id/edit", element: <AdminProductFormPage /> },
    { path: "returns", element: <AdminReturnsPage /> },
    { path: "reviews", element: <AdminReviewsPage /> },
  ],
},
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);