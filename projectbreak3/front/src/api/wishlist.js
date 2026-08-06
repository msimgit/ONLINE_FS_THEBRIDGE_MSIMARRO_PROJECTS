import api from './axios';

// Respuestas envueltas en { success, data: { wishlist } }
// wishlist = { userId, productIds: [...] } (documento Mongo)

export const fetchWishlistRequest = async () => {
  const response = await api.get('/wishlist');
  return response.data.data; // { wishlist }
};

export const addToWishlistRequest = async (productId) => {
  const response = await api.post(`/wishlist/${productId}`);
  return response.data.data; // { wishlist }
};

export const removeFromWishlistRequest = async (productId) => {
  const response = await api.delete(`/wishlist/${productId}`);
  return response.data.data; // { wishlist }
};