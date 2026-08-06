import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart } from '../../store/cartSlice';
import CartItem from '../../components/CartItem/CartItem';
import CartSummary from '../../components/CartSummary/CartSummary';

function CartPage() {
  const dispatch = useDispatch();
  const { cart, loading, error } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  if (loading && !cart) return <p className="status-message">Cargando carrito...</p>;
  if (error) return <p className="status-message error">{error}</p>;

  const items = cart?.items ?? [];

  return (
    <section className="cart-page">
      <h1>Mi carrito</h1>

      {items.length === 0 ? (
        <p className="status-message">Tu carrito está vacío.</p>
      ) : (
        <>
          <div className="cart-items">
            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
          <CartSummary items={items} />
        </>
      )}
    </section>
  );
}

export default CartPage;