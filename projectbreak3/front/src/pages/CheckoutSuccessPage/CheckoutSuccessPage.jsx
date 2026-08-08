import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { confirmOrderBySession } from "../../store/cartSlice";

function CheckoutSuccessPage() {
  const dispatch = useDispatch();
  const order = useSelector((state) => state.cart.order);
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [confirming, setConfirming] = useState(true);
  const [confirmError, setConfirmError] = useState(null);
  const hasRequested = useRef(false); // evita el doble dispatch de StrictMode

  useEffect(() => {
    if (order) {
      setConfirming(false);
      return;
    }

    if (!sessionId) {
      setConfirmError(
        "No se encontró la referencia del pago. Si acabas de completar una compra, revisa tu historial de pedidos.",
      );
      setConfirming(false);
      return;
    }

    if (hasRequested.current) return;
    hasRequested.current = true;

    dispatch(confirmOrderBySession(sessionId))
      .unwrap()
      .catch((err) => setConfirmError(err))
      .finally(() => setConfirming(false));
  }, [dispatch, order, sessionId]);

  if (confirming) {
    return (
      <section className="checkout-success">
        <p className="status-message">Confirmando tu pedido...</p>
      </section>
    );
  }

  if (confirmError || !order) {
    return (
      <section className="checkout-success">
        <h1>No hay ningún pedido reciente</h1>
        {confirmError && <p className="status-message error">{confirmError}</p>}
        <Link to="/products" className="btn btn-primary">
          Ir al catálogo
        </Link>
      </section>
    );
  }

  return (
    <section className="checkout-success">
      <h1>Pedido confirmado</h1>
      <p className="receipt-order-id">Pedido #{order.id}</p>

      <div className="checkout-summary-card">
        <div className="cart-items">
          {order.items.map((item) => (
            <article key={item.id} className="cart-item">
              <Link
                to={`/products/${item.productId}`}
                className="cart-item-image-link"
              >
                <img src={item.product.imageUrl} alt={item.product.name} />
              </Link>

              <div className="cart-item-info">
                <h3>{item.product.name}</h3>
                <p>
                  {item.originalPrice != null ? (
                    <>
                      <span className="product-card-price-old">
                        {item.originalPrice} €
                      </span>{" "}
                      <span className="product-card-price-sale">
                        {item.priceAtPurchase} €
                      </span>
                    </>
                  ) : (
                    <>{item.priceAtPurchase} €</>
                  )}{" "}
                  x {item.quantity}
                </p>
              </div>

              <p className="cart-item-subtotal">
                {(item.quantity * item.priceAtPurchase).toFixed(2)} €
              </p>
            </article>
          ))}
        </div>

        <div className="cart-summary">
          <p className="cart-summary-total">
            Total: {order.total.toFixed(2)} €
          </p>
        </div>
      </div>

      <Link to="/products" className="btn btn-primary">
        Seguir comprando
      </Link>
    </section>
  );
}

export default CheckoutSuccessPage;
