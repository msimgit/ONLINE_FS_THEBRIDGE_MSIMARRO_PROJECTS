// Sprint 13 - Props (item, compact) + Sprint 15 (dispatch de thunks del carrito).
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { removeCartItem, updateCartItem } from "../../store/cartSlice";

// item = { id, productId, quantity, product: { name, price, salePrice, stock, imageUrl, ... } }
// compact: en el drawer no hay ancho para el texto "Eliminar" sin que
// aparezca scroll horizontal, así que ahí se pasa compact=true y se usa "✕".
function CartItem({ item, compact = false }) {
  const dispatch = useDispatch();
  // Estado de carga LOCAL a esta tarjeta, no el global del slice — si
  // usáramos state.cart.loading, actualizar UN item pondría ese flag a
  // true para TODO el carrito mientras dura la petición, y como cada
  // CartItem lee el mismo valor, las demás tarjetas parpadeaban también.
  const [isBusy, setIsBusy] = useState(false);

  const isOnSale = item.product.salePrice != null;
  // Precio EFECTIVO: si hay oferta activa se cobra ese, si no el normal.
  // Debe coincidir con lo que calcula cart.service.js en el backend.
  const unitPrice = isOnSale ? item.product.salePrice : item.product.price;
  const subtotal = item.quantity * unitPrice;

  const handleRemove = async () => {
    setIsBusy(true);
    try {
      await dispatch(removeCartItem(item.id)).unwrap();
    } catch {
      // el error queda reflejado en state.cart.error si hace falta mostrarlo
    } finally {
      setIsBusy(false);
    }
  };

  const handleQuantityChange = async (nextQuantity) => {
    const clamped = Math.max(1, Math.min(item.product.stock, nextQuantity));
    if (clamped === item.quantity) return; // ya está en el límite, no llames a la API en vano

    setIsBusy(true);
    try {
      await dispatch(
        updateCartItem({ itemId: item.id, quantity: clamped }),
      ).unwrap();
    } catch {
      // el error queda reflejado en state.cart.error si hace falta mostrarlo
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <article className="cart-item">
      <Link
        to={`/products/${item.productId}`}
        className="cart-item-image-link thumb-wrap"
      >
        <img src={item.product.imageUrl} alt={item.product.name} />
        {isOnSale && <span className="thumb-sale-stamp">Oferta</span>}
      </Link>

      <div className="cart-item-info">
        <h3>{item.product.name}</h3>

        <div className="quantity-selector cart-item-quantity">
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={isBusy || item.quantity <= 1}
            aria-label="Quitar una unidad"
          >
            -
          </button>
          <span>{item.quantity}</span>
          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={isBusy || item.quantity >= item.product.stock}
            aria-label="Añadir una unidad"
          >
            +
          </button>
        </div>

        <p>
          {isOnSale ? (
            <>
              <span className="product-card-price-old">
                {item.product.price} €
              </span>{" "}
              <span className="product-card-price-sale">
                {item.product.salePrice} €
              </span>
            </>
          ) : (
            <>{item.product.price} €</>
          )}
        </p>
      </div>

      <p className="cart-item-subtotal">{subtotal.toFixed(2)} €</p>

      <button
        className={compact ? "cart-item-remove-icon" : "btn btn-secondary"}
        onClick={handleRemove}
        disabled={isBusy}
        aria-label="Eliminar producto"
      >
        {compact ? "✕" : "Eliminar"}
      </button>
    </article>
  );
}

export default CartItem;
