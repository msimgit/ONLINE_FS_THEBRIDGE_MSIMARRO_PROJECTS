import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { toggleWishlist } from "../../store/wishlistSlice";

function WishlistItem({ product }) {
  const dispatch = useDispatch();
  const isOnSale = product.salePrice != null;

  return (
    <article className="wishlist-item">
      <Link to={`/products/${product.id}`} className="thumb-wrap">
        <img src={product.imageUrl} alt={product.name} />
        {isOnSale && <span className="thumb-sale-stamp">Oferta</span>}
      </Link>

      <div className="wishlist-item-info">
        <Link to={`/products/${product.id}`}>
          <h3>{product.name}</h3>
        </Link>
        {isOnSale ? (
          <p>
            <span className="product-card-price-old">{product.price} €</span>{" "}
            <span className="product-card-price-sale">
              {product.salePrice} €
            </span>
          </p>
        ) : (
          <p>{product.price} €</p>
        )}
      </div>

      <button
        className="btn btn-secondary"
        onClick={() => dispatch(toggleWishlist(product.id))}
      >
        Quitar de la wishlist
      </button>
    </article>
  );
}

export default WishlistItem;
