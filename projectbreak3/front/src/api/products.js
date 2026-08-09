import api from './axios';

export const getProducts = async () => {
  const response = await api.get('/products');
  return response.data.data.products;
};

// Solo ADMIN: incluye productos con isActive:false, que el listado
// público (getProducts) nunca devuelve.
export const getAdminProducts = async () => {
  const response = await api.get('/products/admin/all');
  return response.data.data.products;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data.data.product;
};

export const createProduct = async (data) => {
  const response = await api.post('/products', data);
  return response.data.data.product;
};

export const updateProduct = async (id, data) => {
  const response = await api.put(`/products/${id}`, data);
  return response.data.data.product;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data.data.message;
};

// Requiere que el producto YA exista (cuelga de /products/:id/image en el
// backend) — por eso en creación se llama DESPUÉS de createProduct, nunca
// antes. Axios detecta el FormData automáticamente y pone el header
// multipart/form-data correcto por su cuenta; no lo fuerces a mano.
export const uploadProductImage = async (id, file) => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await api.post(`/products/${id}/image`, formData);
  return response.data.data.product;
};