import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

// Envuelve rutas que requieren sesión.
// Mientras authChecked sea false, no decidimos nada todavía (evita un
// redirect prematuro a /login antes de que checkAuth() haya respondido).
function PrivateRoute() {
  const { isAuthenticated, authChecked } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!authChecked) {
    return null; // aquí podrías mostrar un spinner de carga si prefieres
  }

  if (!isAuthenticated) {
    // Guardamos de dónde venía, útil si luego quieres devolverlo tras el login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export default PrivateRoute;