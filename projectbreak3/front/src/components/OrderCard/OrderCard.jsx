// Sprint 16 - Estado local complejo (selección por artículo) resuelto con varios useState coordinados.
import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDate } from "../../utils/formatDate";

const formatStatus = (status) =>
  status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ");

const RETURN_REASONS = [
  { value: "wrong_product", label: "Producto equivocado" },
  { value: "not_requested", label: "Producto no solicitado" },
  { value: "wrong_size", label: "Talla incorrecta" },
  { value: "other", label: "Otro" },
];

function getLatestRequestForItem(order, orderItemId) {
  const matches = (order.returnRequests ?? [])
    .filter((r) => r.items.some((ri) => ri.orderItemId === orderItemId))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return matches[0] ?? null;
}

function getRequestedQty(order, orderItemId) {
  return (order.returnRequests ?? [])
    .filter((r) => r.status === "PENDING" || r.status === "APPROVED")
    .flatMap((r) => r.items)
    .filter((ri) => ri.orderItemId === orderItemId)
    .reduce((sum, ri) => sum + ri.quantity, 0);
}

function ReturnStatusNote({ order, item }) {
  const latest = getLatestRequestForItem(order, item.id);
  if (!latest) return null;

  const ri = latest.items.find((ri) => ri.orderItemId === item.id);
  const qty = ri?.quantity;

  if (latest.status === "PENDING") {
    return (
      <p className="return-item-note">
        Devolución solicitada de {qty} unidad{qty > 1 ? "es" : ""}
        <br />
        (Referencia: {latest.id})
      </p>
    );
  }
  if (latest.status === "APPROVED") {
    return (
      <p className="return-item-note return-item-note-approved">
        Devolución aprobada de {qty} unidad{qty > 1 ? "es" : ""}
        <br />
        (Referencia: {latest.id})
      </p>
    );
  }
  if (latest.status === "REJECTED") {
    return (
      <p className="return-item-note return-item-note-rejected">
        Solicitud de devolución rechazada
        <br />
        (Referencia: {latest.id})
      </p>
    );
  }
  return null;
}

function OrderCard({ order, onRequestReturn }) {
  // { [orderItemId]: { quantity, reason } }
  const [selected, setSelected] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const toggleItem = (itemId) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[itemId] != null) {
        delete next[itemId];
      } else {
        next[itemId] = { quantity: 1, reason: RETURN_REASONS[0].value };
      }
      return next;
    });
  };

  const changeQuantity = (itemId, nextQuantity, available) => {
    const clamped = Math.max(1, Math.min(available, nextQuantity));
    setSelected((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], quantity: clamped },
    }));
  };

  const changeReason = (itemId, reason) => {
    setSelected((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], reason },
    }));
  };

  const hasSelection = Object.keys(selected).length > 0;

  const handleSubmit = async () => {
    const items = Object.entries(selected).map(([orderItemId, { quantity, reason }]) => ({
      orderItemId,
      quantity,
      reason,
    }));
    setSubmitting(true);
    try {
      await onRequestReturn(order.id, items);
      setSelected({});
    } catch (err) {
      alert(err.response?.data?.error || "No se pudo solicitar la devolución.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="order-card">
      <div className="order-card-header">
        <div>
          <p className="order-card-id">Pedido #{order.id}</p>
          <p className="order-card-date">{formatDate(order.createdAt)}</p>
        </div>
        <span className={`order-status order-status-${order.status.toLowerCase()}`}>
          {formatStatus(order.status)}
        </span>
      </div>

      <div className="cart-items">
        {order.items.map((item) => {
          const requestedQty = getRequestedQty(order, item.id);
          const available = item.quantity - requestedQty;
          const isSelected = selected[item.id] != null;
          const { quantity = 1, reason = RETURN_REASONS[0].value } = selected[item.id] ?? {};

          return (
            <article key={item.id} className="cart-item">
              <Link to={`/products/${item.productId}`} className="cart-item-image-link">
                <img src={item.product.imageUrl} alt={item.product.name} />
              </Link>

              <div className="cart-item-info">
                <h3>{item.product.name}</h3>
                <p>
                  {item.priceAtPurchase} € x {item.quantity}
                </p>
                <ReturnStatusNote order={order} item={item} />
              </div>

              <p className="cart-item-subtotal">
                {(item.quantity * item.priceAtPurchase).toFixed(2)} €
              </p>

              {available > 0 && (
                <div className="return-item-selector">
                  <label className="return-item-checkbox">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleItem(item.id)}
                    />
                    Devolver
                  </label>
                  {isSelected && (
                    <>
                      <div className="quantity-selector return-item-quantity">
                        <button
                          onClick={() => changeQuantity(item.id, quantity - 1, available)}
                          disabled={quantity <= 1}
                          aria-label="Quitar una unidad"
                        >
                          -
                        </button>
                        <span>{quantity}</span>
                        <button
                          onClick={() => changeQuantity(item.id, quantity + 1, available)}
                          disabled={quantity >= available}
                          aria-label="Añadir una unidad"
                        >
                          +
                        </button>
                      </div>
                      <select
                        className="return-reason-select"
                        value={reason}
                        onChange={(e) => changeReason(item.id, e.target.value)}
                      >
                        {RETURN_REASONS.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>

      <div className="cart-summary">
        <p className="cart-summary-total">Total: {order.total.toFixed(2)} €</p>
        {hasSelection && (
          <button className="btn btn-secondary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Enviando..." : "Solicitar devolución"}
          </button>
        )}
      </div>
    </div>
  );
}

export default OrderCard;
