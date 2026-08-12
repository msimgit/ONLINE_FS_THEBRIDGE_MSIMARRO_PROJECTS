// Sprint 14 - Funciones async/await que envuelven las llamadas HTTP de moderación de reviews (admin).
import api from "./axios";

export const getNegativeReviewsRequest = async () => {
  const response = await api.get("/admin/reviews/negative");
  return response.data.data.reviews;
};

export const resolveReviewRequest = async (reviewId) => {
  const response = await api.put(`/admin/reviews/${reviewId}/resolve`);
  return response.data.data.review;
};

export const hideReviewRequest = async (reviewId) => {
  const response = await api.put(`/admin/reviews/${reviewId}/hide`);
  return response.data.data.review;
};