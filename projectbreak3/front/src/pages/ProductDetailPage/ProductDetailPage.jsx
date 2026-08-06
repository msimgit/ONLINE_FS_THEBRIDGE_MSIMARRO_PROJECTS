import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useProduct } from "../../hooks/useProduct";
import { useReviews } from "../../hooks/useReviews";
import { addCartItem } from "../../store/cartSlice";
import { fetchWishlist, toggleWishlist } from "../../store/wishlistSlice";
import ReviewForm from "../../components/ReviewForm/ReviewForm";
import StarRating from "../../components/StarRating/StarRating";
import { formatDate } from "../../utils/formatDate";

function ProductDetailPage() {
  // useParams devuelve el id como string; el backend hace Number(id) en su capa
  const { id } = useParams();

  // Dos hooks independientes: cada uno con su propio loading y error
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

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const { productIds: wishlistIds } = useSelector((state) => state.wishlist);

  // Antes de los return condicionales (loading/error): las reglas de Hooks
  // no permiten que un Hook se salte según una condición.
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

  if (loading) return <p className="status-message">Cargando producto...</p>;

  // Un 404 del backend entra por aquí: Axios lanza error con status 4xx
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

  // Aquí ya es seguro usar `product`: pasamos los guards de loading/error
  const isInWishlist = wishlistIds.includes(product.id);

  return (
    <section className="product-detail">
      <Link to="/products" className="back-link">
        ← Volver al catálogo
      </Link>

      <div className="product-detail-card">
        <div className="product-detail-media">
          <div className="product-detail-image-wrap">
            <img src={product.imageUrl} alt={product.name} />
            <button
              className="product-detail-zoom-btn"
              onClick={() => setIsZoomOpen(true)}
              aria-label="Ver imagen ampliada"
            >
              🔍
            </button>
          </div>

          <button
            className="btn btn-secondary product-detail-wishlist-btn"
            onClick={handleToggleWishlist}
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
            <p className="product-price">{product.price} €</p>
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

            <button className="btn btn-primary" onClick={handleAddToCart}>
              {added ? "Añadido" : `Añadir ${quantity} al carrito`}
            </button>
          </div>
        </div>
      </div>

      {/* Reviews: el hook ya está conectado; ReviewList (paso 6) es opcional
          por ahora según el enunciado. De momento, versión mínima: */}
      <div className="product-reviews">
        <h2>Reviews</h2>
        {reviewsLoading && <p>Cargando reviews...</p>}
        {reviewsError && <p>No se pudieron cargar las reviews</p>}
        {reviews && reviews.length === 0 && <p>Aún no hay reviews</p>}
        {reviews && reviews.length > 0 && (
          <div className="review-list">
            {reviews.map((review) => (
              <div key={review.id} className="review-card">
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
