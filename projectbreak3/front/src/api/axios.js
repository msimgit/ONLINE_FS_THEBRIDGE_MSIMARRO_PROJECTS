import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true, // envía la cookie httpOnly en cada request
});

// El store se inyecta desde main.jsx tras crearse, para evitar
// un import circular (axios.js <-> store -> authSlice -> api/auth.js -> axios.js).
let storeRef = null;
export const injectStore = (store) => {
  storeRef = store;
};

// Endpoints donde un 401 es un resultado ESPERADO, no una sesión caducada:
// - login/register: credenciales incorrectas
// - /me: comprobación silenciosa de sesión al arrancar la app (checkAuth)
const isExpectedAuthCheck = (url = '') =>
  url.includes('/auth/login') ||
  url.includes('/auth/register') ||
  url.endsWith('/me');

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';

    if (status === 401 && !isExpectedAuthCheck(requestUrl)) {
      // Sesión caducada/inválida en un endpoint que sí la requería (cart, wishlist...).
      // Despachamos el tipo de acción tal cual (sin importar authSlice, para no
      // reintroducir el ciclo de imports) y redirigimos a login.
      storeRef?.dispatch({ type: 'auth/sessionExpired' });

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

export default api;