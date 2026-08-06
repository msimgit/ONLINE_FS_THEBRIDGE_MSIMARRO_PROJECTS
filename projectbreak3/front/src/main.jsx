import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { store } from './store/index.js';
import { injectStore } from './api/axios.js';
import { router } from './router/index.jsx';
import './styles/index.css';

// Conectamos el store con axios para que el interceptor de 401
// pueda despachar sessionExpired sin crear un import circular.
injectStore(store);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
);