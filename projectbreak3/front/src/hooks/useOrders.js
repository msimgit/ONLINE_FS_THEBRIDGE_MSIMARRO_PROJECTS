// Sprint 14 - Hook personalizado: useEffect + useCallback, gestión de asincronía fuera de Redux.
import { useState, useEffect, useCallback } from "react";
import { getOrdersRequest, requestReturnRequest } from "../api/orders";

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

  const requestReturn = async (orderId, items) => {
    const newRequest = await requestReturnRequest(orderId, items);
    setData((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, returnRequests: [...(order.returnRequests ?? []), newRequest] }
          : order,
      ),
    );
  };

  return { data, loading, error, requestReturn };
};
