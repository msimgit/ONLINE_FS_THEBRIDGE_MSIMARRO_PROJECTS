import api from "./axios";

// Todas las respuestas van envueltas en { success, data } (ver utils/response.js)
// Todas requieren estar autenticado (cookie httpOnly), authenticate lo valida en backend.

export const fetchCartRequest = async () => {
  const response = await api.get("/cart");
  return response.data.data; // { cart }
};

export const addCartItemRequest = async ({ productId, quantity }) => {
  const response = await api.post("/cart/items", { productId, quantity });
  return response.data.data; // { cart }
};

export const removeCartItemRequest = async (itemId) => {
  const response = await api.delete(`/cart/items/${itemId}`);
  return response.data.data; // { cart }
};

// checkoutRequest eliminado: el pedido ya no lo crea el cliente, lo crea
// el webhook de Stripe. En su lugar, se CONSULTA si ya existe.
export const getOrderBySessionRequest = async (sessionId) => {
  const response = await api.get(`/cart/orders/by-session/${sessionId}`);
  return response.data.data; // { order } — order puede venir null si el
  // webhook todavía no ha llegado
};
