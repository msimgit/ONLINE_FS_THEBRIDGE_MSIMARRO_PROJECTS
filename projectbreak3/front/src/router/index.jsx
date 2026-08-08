import { createBrowserRouter } from "react-router-dom";

import AdminDashboardPage from "../pages/AdminDashboardPage/AdminDashboardPage";
import AdminRoute from "../components/AdminRoute/AdminRoute";
import AdminPage from "../pages/AdminPage/AdminPage";
import AdminProductsPage from "../pages/AdminProductsPage/AdminProductsPage";
import AdminProductFormPage from "../pages/AdminProductFormPage/AdminProductFormPage";
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
    element: <Layout />, // ruta padre: el marco común
    children: [
      {
        index: true, // hijo por defecto: se muestra en "/" exacto
        element: <HomePage />,
      },
      {
        path: "products", // → /products
        element: <ProductsPage />,
      },
      {
        path: "products/:id", // → /products/3, /products/12...
        element: <ProductDetailPage />,
      },
      {
        path: "login", // → /login form
        element: <LoginPage />,
      },
      {
        path: "register", // → /register form
        element: <RegisterPage />,
      },
      {
        // Rutas protegidas: PrivateRoute decide si renderiza el <Outlet />
        // o redirige a /login antes de llegar a cualquiera de estos hijos.
        element: <PrivateRoute />,
        children: [
          {
            // CustomerRoute: un ADMIN nunca llega a /cart, ni siquiera
            // tecleando la URL directamente. Redirige a /admin.
            element: <CustomerRoute />,
            children: [
              {
                path: "cart", // → /cart
                element: <CartPage />,
              },
            ],
          },
          {
            path: "wishlist", // → /wishlist
            element: <WishlistPage />,
          },
          {
            path: "profile", // → /profile
            element: <ProfilePage />,
          },
          {
            path: "checkout/success", // → /checkout/success
            element: <CheckoutSuccessPage />,
          },
        ],
      },
      {
        element: <AdminRoute />,
        children: [
          {
            path: "admin",
            element: <AdminPage />,
            children: [
              {
                index: true,
                element: <AdminDashboardPage />,
              },
              {
                path: "products",
                element: <AdminProductsPage />,
              },
              {
                path: "products/new",
                element: <AdminProductFormPage />,
              },
              {
                path: "products/:id/edit",
                element: <AdminProductFormPage />,
              },
            ],
          },
        ],
      },
      {
        path: "*", // comodín: cualquier URL no definida
        element: <NotFoundPage />,
      },
    ],
  },
]);
