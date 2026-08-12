// Sprint 14 - Funciones async/await que envuelven las llamadas HTTP de reviews.
import api from "./axios";

// El backend envuelve todo en { success, data } (ver utils/response.js -> ok())
export const getReviews = async (productId) => {
  const response = await api.get(`/products/${productId}/reviews`);
  return response.data.data.reviews;
};

export const createReview = async (productId, { rating, comment }) => {
  const response = await api.post(`/products/${productId}/reviews`, {
    rating,
    comment,
  });
  return response.data.data.review;
};

export const hideReviewRequest = async (reviewId) => {
  const response = await api.put(`/admin/reviews/${reviewId}/hide`);
  return response.data.data.review;
};

export const unhideReviewRequest = async (reviewId) => {
  const response = await api.put(`/admin/reviews/${reviewId}/unhide`);
  return response.data.data.review;
};