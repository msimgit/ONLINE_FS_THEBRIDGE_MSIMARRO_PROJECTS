import api from './axios';

// El backend envuelve todo en { success, data } (ver utils/response.js -> ok())
export const getReviews = async (productId) => {
  const response = await api.get(`/products/${productId}/reviews`);
  return response.data.data.reviews; // antes: response.data (guardaba el envoltorio entero)
};

export const createReview = async (productId, { rating, comment }) => {
  const response = await api.post(`/products/${productId}/reviews`, {
    rating,
    comment,
  });
  return response.data.data.review;
};