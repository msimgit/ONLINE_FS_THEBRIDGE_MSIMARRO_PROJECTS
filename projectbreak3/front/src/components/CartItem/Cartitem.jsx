import { useDispatch } from "react-redux";
import { removeCartItem } from "../../store/cartSlice";

// item = { id, productId, quantity, product: { name, price, imageUrl, ... } }
// compact: en el drawer no hay ancho para el texto "Eliminar" sin que
// aparezca scroll horizontal, así que ahí se pasa compact=true y se usa "✕".
function CartItem({ item, compact = false }) {
  const dispatch = useDispatch();

  const subtotal = item.quantity * item.product.price;

  const handleRemove = () => {
    dispatch(removeCartItem(item.id));
  };

  return (
    <article className="cart-item">
      <img src={item.product.imageUrl} alt={item.product.name} />

      <div className="cart-item-info">
        <h3>{item.product.name}</h3>
        <p>
          {item.product.price} € x {item.quantity}
        </p>
      </div>

      <p className="cart-item-subtotal">{subtotal.toFixed(2)} €</p>

      <button
        className={compact ? "cart-item-remove-icon" : "btn btn-secondary"}
        onClick={handleRemove}
        aria-label="Eliminar producto"
      >
        {compact ? "✕" : "Eliminar"}
      </button>
    </article>
  );
}

export default CartItem;
