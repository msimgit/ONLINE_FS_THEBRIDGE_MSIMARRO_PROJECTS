import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchCart, clearCart } from "../../store/cartSlice";
import CartItem from "../CartItem/CartItem";
import CartSummary from "../CartSummary/CartSummary";

// isOpen/onClose vienen de Layout, que es quien guarda el estado del panel
function CartDrawer({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { cart, loading, error } = useSelector((state) => state.cart);

  // Al abrir el panel, refrescamos el carrito por si cambió en otra pestaña/página
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchCart());
    }
  }, [isOpen, dispatch]);

  if (!isOpen) return null;

  const items = cart?.items ?? [];

  const handleClearCart = () => {
    const confirmed = window.confirm("¿Vaciar todo el carrito?");
    if (confirmed) {
      dispatch(clearCart());
    }
  };

  return (
    <>
      {/* Overlay: clic fuera del panel cierra */}
      <div className="drawer-overlay" onClick={onClose} />

      <aside className="drawer">
        <div className="drawer-header">
          <h2>Mi carrito</h2>
          <div className="drawer-header-actions">
            {items.length > 0 && (
              <button
                className="drawer-clear-btn"
                onClick={handleClearCart}
                aria-label="Vaciar carrito"
              >
                Vaciar
              </button>
            )}
            <button
              className="drawer-close"
              onClick={onClose}
              aria-label="Cerrar carrito"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="drawer-body">
          {loading && !cart && (
            <p className="status-message">Cargando carrito...</p>
          )}
          {error && <p className="status-message error">{error}</p>}

          {!loading && items.length === 0 && (
            <p className="status-message">Tu carrito está vacío.</p>
          )}

          {items.length > 0 && (
            <div className="cart-items">
              {items.map((item) => (
                <CartItem key={item.id} item={item} compact />
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="drawer-footer">
            <CartSummary items={items} onCheckoutSuccess={onClose} />
            <Link to="/cart" className="btn btn-secondary" onClick={onClose}>
              Ver carrito completo
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}

export default CartDrawer;
