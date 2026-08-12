// Sprint 14 - Función async/await que envuelve la llamada HTTP de creación de sesión de Stripe.
import api from "./axios";

export const createCheckoutSession = async (items) => {
  const response = await api.post("/checkout", { items });
  return response.data.data.url;
};
