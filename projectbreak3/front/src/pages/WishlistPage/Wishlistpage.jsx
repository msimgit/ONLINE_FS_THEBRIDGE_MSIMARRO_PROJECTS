import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWishlist } from "../../store/wishlistSlice";
import { useProducts } from "../../hooks/useProducts";
import WishlistItem from "../../components/WishlistItem/WishlistItem";

function WishlistPage() {
  const dispatch = useDispatch();
  const {
    productIds,
    loading: wishlistLoading,
    error,
  } = useSelector((state) => state.wishlist);

  // Reutilizamos el mismo hook que ProductsPage: trae el catálogo completo.
  // La wishlist del backend solo guarda IDs, así que necesitamos cruzarlos aquí.
  const { data: products, loading: productsLoading } = useProducts();

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  // Antes de los return condicionales: los Hooks no pueden ser condicionales.
  // Aquí SÍ tiene más sentido useMemo que en ProductsPage: este cálculo
  // depende de DOS fuentes distintas (productIds de Redux + products del
  // hook), que no siempre cambian juntas. Si el usuario añade algo al
  // carrito (otro slice de Redux), este componente no se re-renderiza,
  // pero si en el futuro comparte estado con cart/auth, useMemo evita
  // recalcular el cruce cuando lo que cambió no fue ni products ni productIds.
  const wishlistProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((product) => productIds.includes(product.id));
  }, [products, productIds]);

  if ((wishlistLoading || productsLoading) && !products) {
    return <p className="status-message">Cargando tu wishlist...</p>;
  }
  if (error) return <p className="status-message error">{error}</p>;

  return (
    <section className="wishlist-page">
      <h1>Mi wishlist</h1>

      {wishlistProducts.length === 0 ? (
        <p className="status-message">
          Todavía no has añadido productos a tu wishlist.
        </p>
      ) : (
        <div className="wishlist-items">
          {wishlistProducts.map((product) => (
            <WishlistItem key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

export default WishlistPage;
