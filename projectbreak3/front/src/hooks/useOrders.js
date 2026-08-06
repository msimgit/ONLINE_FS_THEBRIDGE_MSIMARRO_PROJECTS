import { useState, useEffect, useCallback } from "react";
import { getOrdersRequest, returnOrderRequest } from "../api/orders";

// Igual que useProducts/useReviews: estado local, no Redux, porque el
// historial de pedidos solo lo necesita ProfilePage (nada global depende de él).
// enabled: por defecto true. Se pone a false cuando no hay sesión, para no
// disparar una petición que sabemos que va a fallar con 401 (la usa ReviewForm
// para comprobar si el usuario compró el producto, incluso sin estar logueado).
export const useOrders = (enabled = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      const orders = await getOrdersRequest();
      setData(orders);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      fetchOrders();
    }
  }, [enabled, fetchOrders]);

  // Tras devolver, sustituimos solo ese pedido en el array local
  // (el backend ya nos devuelve el order actualizado con status: RETURNED)
  const returnOrder = async (orderId) => {
    const updatedOrder = await returnOrderRequest(orderId);
    setData((prev) =>
      prev.map((order) => (order.id === orderId ? updatedOrder : order)),
    );
  };

  return { data, loading, error, returnOrder };
};
