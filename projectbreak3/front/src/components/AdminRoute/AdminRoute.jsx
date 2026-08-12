// Sprint 13 - Rutas protegidas por rol con React Router (<Outlet/> + <Navigate/> condicional).
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { selectIsAdmin } from "../../store/authSlice";

// Envuelve rutas que requieren rol ADMIN.
// Mientras authChecked sea false, no decidimos nada todavía (evita un
// redirect prematuro a "/" antes de que checkAuth() haya respondido:
// sin esto, un ADMIN que recarga /admin sería expulsado un instante
// porque state.auth.user todavía es null mientras /me está en vuelo).
function AdminRoute() {
  const { authChecked } = useSelector((state) => state.auth);
  const isAdmin = useSelector(selectIsAdmin);
  const location = useLocation();

  if (!authChecked) {
    return null; // aquí podrías mostrar un spinner de carga si prefieres
  }

  if (!isAdmin) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export default AdminRoute;
