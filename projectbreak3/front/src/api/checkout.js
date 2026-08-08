import api from "./axios";

export const createCheckoutSession = async (items) => {
  const response = await api.post("/checkout", { items });
  return response.data.data.url;
};
