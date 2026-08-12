import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useProduct } from "../../hooks/useProduct";
import { useReviews } from "../../hooks/useReviews";
import { addCartItem } from "../../store/cartSlice";
import { fetchWishlist, toggleWishlist } from "../../store/wishlistSlice";
import { selectIsAdmin } from "../../store/authSlice";
import { hideReviewRequest, unhideReviewRequest } from "../../api/reviews";
import ReviewForm from "../../components/ReviewForm/ReviewForm";
import StarRating from "../../components/StarRating/StarRating";
import { formatDate } from "../../utils/formatDate";

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.4 20.4 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a20.4 20.4 0 0 1-3.22 4.53M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <path d="M1 1l22 22" />
    </svg>
  );
}

function ProductDetailPage() {
  const { id } = useParams();

  const { data: product, loading, error } = useProduct(id);
  const {
    data: reviews,
    loading: reviewsLoading,
    error: reviewsError,
    refetch: refetchReviews,
  } = useReviews(id);

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [togglingReviewId, setTogglingReviewId] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const { productIds: wishlistIds } = useSelector((state) => state.wishlist);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [isAuthenticated, dispatch]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    await dispatch(addCartItem({ productId: product.id, quantity }));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    dispatch(toggleWishlist(product.id));
  };

  const handleToggleReviewVisibility = async (review) => {
    setTogglingReviewId(review.id);
    try {
      if (review.hidden) {
        await unhideReviewRequest(review.id);
      } else {
        await hideReviewRequest(review.id);
      }
      await refetchReviews();
    } catch (err) {
      alert(err.response?.data?.error || "No se pudo actualizar la visibilidad.");
    } finally {
      setTogglingReviewId(null);
    }
  };

  if (loading) return <p className="status-message">Cargando producto...</p>;

  if (error) {
    return (
      <section className="product-detail">
        <p className="status-message error">Producto no encontrado</p>
        <Link to="/products" className="btn btn-primary">
          Volver al catálogo
        </Link>
      </section>
    );
  }

  const isInWishlist = wishlistIds.includes(product.id);
  const isOnSale = product.salePrice != null;

  return (
    <section className="product-detail">
      <Link to="/products" className="back-link">
        ← Volver al catálogo
      </Link>

      <div className="product-detail-card">
        <div className="product-detail-media">
          <div className="product-detail-image-wrap thumb-wrap">
            <img src={product.imageUrl} alt={product.name} />
            {isOnSale && <span className="thumb-sale-stamp">Oferta</span>}
            <button
              className="product-detail-zoom-btn"
              onClick={() => setIsZoomOpen(true)}
              aria-label="Ver imagen ampliada"
            >
              🔍
            </button>
          </div>

          <button
            className={`btn btn-secondary product-detail-wishlist-btn${isAdmin ? " disabled" : ""}`}
            onClick={handleToggleWishlist}
            disabled={isAdmin}
          >
            {isInWishlist ? "Quitar de la wishlist" : "Añadir a la wishlist"}
          </button>
        </div>

        <div className="product-detail-info">
          <div className="product-detail-heading">
            <h1>{product.name}</h1>
            <p className="product-detail-subtitle">{product.description}</p>
          </div>

          <div className="product-detail-meta">
            {isOnSale ? (
              <p className="product-price">
                <span className="product-price-old">{product.price} €</span>{" "}
                <span className="product-price-sale">
                  {product.salePrice} €
                </span>
              </p>
            ) : (
              <p className="product-price">{product.price} €</p>
            )}
            <p className="product-stock">Stock: {product.stock}</p>

            <div className="quantity-selector">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                -
              </button>
              <span>{quantity}</span>
              <button
                onClick={() =>
                  setQuantity((q) => Math.min(product.stock, q + 1))
                }
              >
                +
              </button>
            </div>

            <button
              className={`btn btn-primary${isAdmin ? " disabled" : ""}`}
              onClick={handleAddToCart}
              disabled={isAdmin}
            >
              {added ? "Añadido" : `Añadir ${quantity} al carrito`}
            </button>
          </div>
        </div>
      </div>

      <div className="product-reviews">
        <h2>Reviews</h2>
        {reviewsLoading && <p>Cargando reviews...</p>}
        {reviewsError && <p>No se pudieron cargar las reviews</p>}
        {reviews && reviews.length === 0 && <p>Aún no hay reviews</p>}
        {reviews && reviews.length > 0 && (
          <div className="review-list">
            {reviews.map((review) => (
              <div
                key={review.id}
                className={`review-card${review.hidden ? " review-card-hidden" : ""}`}
              >
                {isAdmin && (
                  <button
                    className="review-visibility-toggle"
                    onClick={() => handleToggleReviewVisibility(review)}
                    disabled={togglingReviewId === review.id}
                    aria-label={review.hidden ? "Mostrar review" : "Ocultar review"}
                    title={review.hidden ? "Oculta: mostrar de nuevo" : "Ocultar review"}
                  >
                    {review.hidden ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                )}
                <StarRating rating={review.rating} />
                <p className="review-comment">{review.comment}</p>
                {review.createdAt && (
                  <p className="review-date">{formatDate(review.createdAt)}</p>
                )}
              </div>
            ))}
          </div>
        )}

        <ReviewForm productId={id} onSuccess={refetchReviews} />
      </div>

      {isZoomOpen && (
        <div
          className="image-zoom-overlay"
          onClick={() => setIsZoomOpen(false)}
        >
          <button
            className="image-zoom-close"
            onClick={() => setIsZoomOpen(false)}
            aria-label="Cerrar imagen ampliada"
          >
            ✕
          </button>
          <img
            src={product.imageUrl}
            alt={product.name}
            className="image-zoom-content"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}

export default ProductDetailPage;
