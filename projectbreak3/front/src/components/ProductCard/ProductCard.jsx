import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addCartItem } from "../../store/cartSlice";
import { selectIsAdmin } from "../../store/authSlice";

// Recibe el producto por props — destructuring directo en el parámetro
function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);

  const isOnSale = product.salePrice != null;

  const handleAddToCart = (event) => {
    // El botón vive dentro de un <Link>: sin esto, el click también navegaría
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    dispatch(addCartItem({ productId: product.id, quantity: 1 }));
  };

  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`}>
        <div className="thumb-wrap">
          <img src={product.imageUrl} alt={product.name} />
          {isOnSale && <span className="thumb-sale-stamp">Oferta</span>}
        </div>
        <div className="product-card-body">
          <h3>{product.name}</h3>

          {isOnSale ? (
            <p className="product-card-price">
              <span className="product-card-price-old">
                {product.price} €
              </span>{" "}
              <span className="product-card-price-sale">
                {product.salePrice} €
              </span>
            </p>
          ) : (
            <p className="product-card-price">{product.price} €</p>
          )}

          {product.stock < 10 && (
            <p className="product-card-low-stock">¡Últimas unidades!</p>
          )}
        </div>
      </Link>

      <div className="product-card-footer">
        {/* Un admin gestiona la tienda, no compra en ella: el botón se
            queda visible pero deshabilitado. */}
        {isAdmin ? (
          <button className="btn btn-primary disabled" disabled>
            Añadir al carrito
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handleAddToCart}>
            Añadir al carrito
          </button>
        )}
        {product.avgRating !== null && (
          <span className="product-card-rating">
            ★ {product.avgRating.toFixed(1)}
          </span>
        )}
      </div>
    </article>
  );
}

export default ProductCard;
