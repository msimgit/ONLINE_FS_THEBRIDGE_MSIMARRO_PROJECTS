import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import PrivateRoute from '../components/PrivateRoute/PrivateRoute';
import HomePage from '../pages/HomePage/HomePage';
import ProductsPage from '../pages/ProductsPage/ProductsPage';
import ProductDetailPage from '../pages/ProductDetailPage/ProductDetailPage';
import LoginPage from '../pages/LoginPage/LoginPage';
import RegisterPage from '../pages/RegisterPage/RegisterPage';
import CartPage from '../pages/CartPage/CartPage';
import WishlistPage from '../pages/WishlistPage/WishlistPage';
import ProfilePage from '../pages/ProfilePage/ProfilePage';
import CheckoutSuccessPage from '../pages/CheckoutSuccessPage/CheckoutSuccessPage';
import NotFoundPage from '../pages/NotFoundPage/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />, // ruta padre: el marco común
    children: [
      {
        index: true, // hijo por defecto: se muestra en "/" exacto
        element: <HomePage />,
      },
      {
        path: 'products', // → /products
        element: <ProductsPage />,
      },
      {
        path: 'products/:id', // → /products/3, /products/12...
        element: <ProductDetailPage />,
      },
      {
        path: 'login', // → /login form
        element: <LoginPage />,
      },
      {
        path: 'register', // → /register form
        element: <RegisterPage />,
      },
      {
        // Rutas protegidas: PrivateRoute decide si renderiza el <Outlet />
        // o redirige a /login antes de llegar a cualquiera de estos hijos.
        element: <PrivateRoute />,
        children: [
          {
            path: 'cart', // → /cart
            element: <CartPage />,
          },
          {
            path: 'wishlist', // → /wishlist
            element: <WishlistPage />,
          },
          {
            path: 'profile', // → /profile
            element: <ProfilePage />,
          },
          {
            path: 'checkout', // → /checkout
            element: <CheckoutSuccessPage />,
          },
        ],
      },
      {
        path: '*', // comodín: cualquier URL no definida
        element: <NotFoundPage />,
      },
    ],
  },
]);