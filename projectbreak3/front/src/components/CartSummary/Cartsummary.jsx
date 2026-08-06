import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { checkout } from "../../store/cartSlice";

// items = cart.items — el backend no manda total, lo calculamos aquí
// onCheckoutSuccess (opcional): lo pasa CartDrawer para cerrarse tras el
// checkout; CartPage no lo necesita (no hay panel que cerrar) y no lo pasa.
function CartSummary({ items, onCheckoutSuccess }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const total = items.reduce(
    (acc, item) => acc + item.quantity * item.product.price,
    0,
  );

  const handleCheckout = async () => {
    try {
      await dispatch(checkout()).unwrap();
      onCheckoutSuccess?.();
      navigate("/checkout");
    } catch {
      // El error ya queda en state.cart.error; CartPage lo puede mostrar
    }
  };

  return (
    <div className="cart-summary">
      <p className="cart-summary-total">Total: {total.toFixed(2)} €</p>
      <button
        className="btn btn-primary"
        onClick={handleCheckout}
        disabled={items.length === 0}
      >
        Finalizar compra
      </button>
    </div>
  );
}

export default CartSummary;
