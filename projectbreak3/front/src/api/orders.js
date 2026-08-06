import api from "./axios";

export const getOrdersRequest = async () => {
  const response = await api.get("/orders");
  return response.data.data.orders;
};

export const returnOrderRequest = async (orderId) => {
  const response = await api.post(`/orders/${orderId}/return`);
  return response.data.data.order;
};
