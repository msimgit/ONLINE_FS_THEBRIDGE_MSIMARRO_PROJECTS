import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toggleWishlist } from "../../store/wishlistSlice";
import Button from "../Button/Button";

// product = objeto completo del catálogo (viene de useProducts, no del backend de wishlist)
function WishlistItem({ product }) {
  const dispatch = useDispatch();

  const handleRemove = () => {
    dispatch(toggleWishlist(product.id));
  };

  return (
    <article className="wishlist-item">
      <Link to={`/products/${product.id}`}>
        <img src={product.imageUrl} alt={product.name} />
      </Link>

      <div className="wishlist-item-info">
        <Link to={`/products/${product.id}`}>
          <h3>{product.name}</h3>
        </Link>
        <p>{product.price} €</p>
      </div>

      <Button variant="secondary" onClick={handleRemove}>
        Quitar de la wishlist
      </Button>
    </article>
  );
}

export default WishlistItem;
