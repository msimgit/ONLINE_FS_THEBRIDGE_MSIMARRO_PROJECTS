import api from "./axios";

export const getProducts = async () => {
  const response = await api.get("/products");
  return response.data.data.products;
};

// Solo ADMIN: incluye productos con isActive:false, que el listado
// público (getProducts) nunca devuelve.
export const getAdminProducts = async () => {
  const response = await api.get("/products/admin/all");
  return response.data.data.products;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data.data.product;
};

export const createProduct = async (data) => {
  const response = await api.post("/products", data);
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
