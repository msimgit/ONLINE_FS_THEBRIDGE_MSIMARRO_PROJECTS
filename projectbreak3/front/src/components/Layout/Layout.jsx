// Sprint 13 - Composición por props/children: <Outlet /> como "children" del layout común (Header+Footer envolviendo cada página).
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "../../store/authSlice";
import { fetchCart } from "../../store/cartSlice";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import CartDrawer from "../CartDrawer/CartDrawer";
import ProfileDrawer from "../ProfileDrawer/ProfileDrawer";

function Layout() {
  const dispatch = useDispatch();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { isAuthenticated } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Traemos el carrito en cuanto sabemos que hay sesión, para que el
  // badge del header tenga el número correcto sin esperar a abrir el panel.
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [isAuthenticated, dispatch]);

  const cartItemCount = (cart?.items ?? []).reduce(
    (acc, item) => acc + item.quantity,
    0,
  );

  // Solo un panel abierto a la vez: si se abre uno, se cierra el otro
  const openCart = () => {
    setIsProfileOpen(false);
    setIsCartOpen(true);
  };

  const openProfile = () => {
    setIsCartOpen(false);
    setIsProfileOpen(true);
  };

  return (
    <div className="layout">
      <Header
        onCartClick={openCart}
        cartItemCount={cartItemCount}
        isCartOpen={isCartOpen}
        onProfileClick={openProfile}
        isProfileOpen={isProfileOpen}
      />
      <main className="layout-content">
        <Outlet />
      </main>
      <Footer />

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <ProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
}

export default Layout;
