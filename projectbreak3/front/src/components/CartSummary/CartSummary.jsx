// Sprint 15 - Componente de presentación que recibe el total ya calculado; el checkout real se dispara vía Stripe (Sprint 16, fuera de Redux).
import { useState } from "react";
import { createCheckoutSession } from "../../api/checkout";

// items = cart.items — el backend no manda total, lo calculamos aquí
function CartSummary({ items }) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState(null);

  // Precio EFECTIVO: si el producto tiene oferta activa, se cobra ese;
  // si no, el normal. Debe coincidir exactamente con lo que usa
  // CartItem.jsx para cada línea individual.
  const total = items.reduce(
    (acc, item) =>
      acc + item.quantity * (item.product.salePrice ?? item.product.price),
    0,
  );

  const handleCheckout = async () => {
    setError(null);
    setIsRedirecting(true);
    try {
      const url = await createCheckoutSession(
        items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      );
      window.location.href = url; // redirección a Stripe Checkout
    } catch (err) {
      setError(err.response?.data?.error || "Error al iniciar el pago");
      setIsRedirecting(false);
    }
  };

  return (
    <div className="cart-summary">
      <p className="cart-summary-total">Total: {total.toFixed(2)} €</p>
      {error && <p className="status-message error">{error}</p>}
      <button
        className="btn btn-primary"
        onClick={handleCheckout}
        disabled={items.length === 0 || isRedirecting}
      >
        {isRedirecting ? "Redirigiendo..." : "Finalizar compra"}
      </button>
    </div>
  );
}

export default CartSummary;
