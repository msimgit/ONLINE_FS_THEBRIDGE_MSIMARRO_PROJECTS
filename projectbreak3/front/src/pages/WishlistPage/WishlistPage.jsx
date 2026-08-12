// Sprint 15 - useSelector/useDispatch para leer y modificar la wishlist desde el store global.
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWishlist } from "../../store/wishlistSlice";
import { fetchProducts } from "../../store/productsSlice";
import WishlistItem from "../../components/WishlistItem/WishlistItem";

function WishlistPage() {
  const dispatch = useDispatch();
  const {
    productIds,
    loading: wishlistLoading,
    error,
  } = useSelector((state) => state.wishlist);
  const { items: products, loading: productsLoading } = useSelector(
    (state) => state.products,
  );

  useEffect(() => {
    dispatch(fetchWishlist());
    dispatch(fetchProducts());
  }, [dispatch]);

  const items = useMemo(
    () => (products ? products.filter((p) => productIds.includes(p.id)) : []),
    [products, productIds],
  );

  if ((wishlistLoading || productsLoading) && !products) {
    return <p className="status-message">Cargando tu wishlist...</p>;
  }

  if (error) {
    return <p className="status-message error">{error}</p>;
  }

  return (
    // Mismas clases que CartPage: mismo ancho, mismo centrado, misma
    // tarjeta contenedora — si /cart cambia de estilo, esta lo hereda igual.
    <section className="cart-page">
      <h1>Mi wishlist</h1>

      {items.length === 0 ? (
        <p className="status-message">
          Todavía no has añadido productos a tu wishlist.
        </p>
      ) : (
        <div className="checkout-summary-card">
          <div className="wishlist-items">
            {items.map((product) => (
              <WishlistItem key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default WishlistPage;
