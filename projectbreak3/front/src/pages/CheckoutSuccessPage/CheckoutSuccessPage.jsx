import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

function CheckoutSuccessPage() {
  // El thunk checkout() guarda el pedido confirmado en state.cart.order
  const order = useSelector((state) => state.cart.order);

  if (!order) {
    // Alguien llegó a /checkout directamente sin haber completado un pedido
    return (
      <section className="checkout-success">
        <h1>No hay ningún pedido reciente</h1>
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
              <img src={item.product.imageUrl} alt={item.product.name} />

              <div className="cart-item-info">
                <h3>{item.product.name}</h3>
                <p>
                  {item.priceAtPurchase} € x {item.quantity}
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
