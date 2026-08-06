import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createReview } from "../../api/reviews";
import { useOrders } from "../../hooks/useOrders";
import StarRating from "../StarRating/StarRating";

// onSuccess: callback para recargar la lista de reviews (le pasamos refetch)
function ReviewForm({ productId, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const navigate = useNavigate();

  // enabled=isAuthenticated: si no hay sesión no tiene sentido pedir el
  // historial (fallaría con 401), y de todas formas vamos a devolver el
  // prompt de login antes de necesitar este dato.
  const { data: orders, loading: ordersLoading } = useOrders(isAuthenticated);

  if (!isAuthenticated) {
    return (
      <div className="review-login-prompt">
        <p>Inicia sesión para dejar una reseña.</p>
        <button className="btn btn-primary" onClick={() => navigate("/login")}>
          Iniciar sesión
        </button>
      </div>
    );
  }

  // Solo puede opinar quien tenga una compra confirmada (no devuelta) de este producto
  const hasConfirmedPurchase = orders?.some(
    (order) =>
      order.status !== "RETURNED" &&
      order.items.some((item) => item.productId === productId),
  );

  if (ordersLoading) {
    return (
      <p className="status-message">Comprobando tu historial de compras...</p>
    );
  }

  if (!hasConfirmedPurchase) {
    return (
      <p className="status-message">
        Solo puedes valorar productos que hayas comprado y recibido.
      </p>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!comment.trim()) {
      setError("Escribe un comentario antes de enviar.");
      return;
    }

    setSubmitting(true);
    try {
      await createReview(productId, { rating: Number(rating), comment });
      setComment("");
      setRating(5);
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo enviar la reseña.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <div className="review-form-rating">
        <label>Puntuación</label>
        <StarRating rating={rating} onChange={setRating} />
      </div>

      <textarea
        placeholder="Escribe tu opinión sobre este producto..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      {error && <p className="form-error">{error}</p>}

      <button className="btn btn-primary" type="submit" disabled={submitting}>
        {submitting ? "Enviando..." : "Enviar reseña"}
      </button>
    </form>
  );
}

export default ReviewForm;
