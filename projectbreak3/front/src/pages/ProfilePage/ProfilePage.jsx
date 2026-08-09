import { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useOrders } from "../../hooks/useOrders";
import { formatDate } from "../../utils/formatDate";

// El backend puede tener más valores de status de los que conocemos;
// esto solo formatea lo que venga, sin asumir un listado cerrado.
const formatStatus = (status) =>
  status.charAt(0) + status.slice(1).toLowerCase().replace("_", " ");

function ProfilePage() {
  const { user } = useSelector((state) => state.auth);
  const { data: orders, loading, error, returnOrder } = useOrders();
  const [returningId, setReturningId] = useState(null);

  const handleReturn = async (orderId) => {
    const confirmed = window.confirm(
      "¿Seguro que quieres devolver este pedido? Se repondrá el stock.",
    );
    if (!confirmed) return;

    setReturningId(orderId);
    try {
      await returnOrder(orderId);
    } catch {
      alert("No se pudo procesar la devolución. Inténtalo de nuevo.");
    } finally {
      setReturningId(null);
    }
  };

  return (
    <section className="profile-page">
      <div className="profile-info-card">
        <h1>Mi perfil</h1>
        <p className="profile-email">{user?.email}</p>
        {user?.createdAt && (
          <p className="profile-member-since">
            Cliente desde {formatDate(user.createdAt)}
          </p>
        )}
      </div>

      <h2>Historial de pedidos</h2>

      {loading && <p className="status-message">Cargando pedidos...</p>}
      {error && <p className="status-message error">{error}</p>}

      {orders && orders.length === 0 && (
        <p className="status-message">Aún no has realizado ningún pedido.</p>
      )}

      {orders && orders.length > 0 && (
        <div className="order-history-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div>
                  <p className="order-card-id">Pedido #{order.id}</p>
                  <p className="order-card-date">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <span
                  className={`order-status order-status-${order.status.toLowerCase()}`}
                >
                  {formatStatus(order.status)}
                </span>
              </div>

              <div className="cart-items">
                {order.items.map((item) => (
                  <article key={item.id} className="cart-item">
                    <Link
                      to={`/products/${item.productId}`}
                      className="cart-item-image-link thumb-wrap"
                    >
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                      />
                      {item.originalPrice != null && (
                        <span className="thumb-sale-stamp">Oferta</span>
                      )}
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
                {order.status !== "RETURNED" && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleReturn(order.id)}
                    disabled={returningId === order.id}
                  >
                    {returningId === order.id
                      ? "Procesando..."
                      : "Devolver pedido"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default ProfilePage;
