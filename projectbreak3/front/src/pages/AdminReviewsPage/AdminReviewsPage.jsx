// Sprint 16 - useMemo para memoizar el ordenado de la grid de valoraciones medias por producto.
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getNegativeReviewsRequest, resolveReviewRequest } from "../../api/adminReviews";
import { getAdminProducts } from "../../api/products";
import { formatDate } from "../../utils/formatDate";

const SORT_OPTIONS = [
  { key: "name", label: "Nombre" },
  { key: "rating", label: "Valoración" },
];

function AdminReviewsPage() {
  const [negativeReviews, setNegativeReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    const [reviews, productList] = await Promise.all([
      getNegativeReviewsRequest(),
      getAdminProducts(),
    ]);
    setNegativeReviews(reviews);
    setProducts(productList);
    setLoading(false);
  }

  async function handleResolve(reviewId) {
    setResolvingId(reviewId);
    try {
      await resolveReviewRequest(reviewId);
      setNegativeReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err) {
      alert(err.response?.data?.error || "No se pudo marcar como resuelta.");
    } finally {
      setResolvingId(null);
    }
  }

  function handleSort(key) {
    setSortConfig((prev) => {
      if (prev.key !== key) return { key, direction: "asc" };
      return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
    });
  }

  const sortedProducts = useMemo(() => {
    const sorted = [...products].sort((a, b) => {
      if (sortConfig.key === "rating") {
        const aVal = a.avgRating ?? -1;
        const bVal = b.avgRating ?? -1;
        return aVal - bVal;
      }
      return a.name.localeCompare(b.name, "es", { sensitivity: "base" });
    });
    return sortConfig.direction === "asc" ? sorted : sorted.reverse();
  }, [products, sortConfig]);

  if (loading) return <p className="status-message">Cargando comentarios...</p>;

  return (
    <div>
      <h1>Comentarios</h1>

      <h2 className="admin-section-title">Valoraciones negativas pendientes</h2>
      {negativeReviews.length === 0 ? (
        <p className="status-message">No hay valoraciones negativas pendientes de revisar.</p>
      ) : (
        negativeReviews.map((review) => (
          <div key={review.id} className="order-card">
            <div className="order-card-header">
              <div className="admin-review-header-info">
                {review.product && (
                  <Link
                    to={`/products/${review.productId}`}
                    className="cart-item-image-link"
                  >
                    <img src={review.product.imageUrl} alt={review.product.name} />
                  </Link>
                )}
                <div>
                  <p className="order-card-id">
                    {review.product?.name ?? "Producto eliminado"}
                  </p>
                  <p className="order-card-date">{formatDate(review.createdAt)}</p>
                  <p className="admin-issue-card-meta">★ {review.rating}</p>
                </div>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => handleResolve(review.id)}
                disabled={resolvingId === review.id}
              >
                {resolvingId === review.id ? "..." : "Resuelta"}
              </button>
            </div>
            {review.comment && <p className="review-comment">{review.comment}</p>}
          </div>
        ))
      )}

      <div className="admin-section-header">
        <h2 className="admin-section-title">Valoración media por producto</h2>
        <div className="sort-controls">
          <span className="sort-label">Ordenar por:</span>
          {SORT_OPTIONS.map((opt) => {
            const isActive = sortConfig.key === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                className={`sort-pill ${isActive ? "active" : ""}`}
                onClick={() => handleSort(opt.key)}
              >
                {opt.label}
                {isActive && (
                  <span className="sort-pill-arrow" aria-hidden="true">
                    {sortConfig.direction === "asc" ? "▲" : "▼"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rating-thumb-grid">
        {sortedProducts.map((product) => (
          <Link
            key={product.id}
            to={`/products/${product.id}`}
            className="rating-thumb-item"
          >
            <img src={product.imageUrl} alt={product.name} />
            {product.avgRating != null && (
              <span className="rating-thumb-badge">★ {product.avgRating.toFixed(1)}</span>
            )}
            <p className="rating-thumb-name">{product.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default AdminReviewsPage;