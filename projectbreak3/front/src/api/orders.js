// Sprint 14 - Funciones async/await que envuelven las llamadas HTTP de pedidos/devoluciones.
import api from "./axios";

export const getOrdersRequest = async () => {
  const response = await api.get("/orders");
  return response.data.data.orders;
};

// items = [{ orderItemId, quantity, reason }]
export const requestReturnRequest = async (orderId, items) => {
  const response = await api.post(`/orders/${orderId}/return`, { items });
  return response.data.data.request;
};
