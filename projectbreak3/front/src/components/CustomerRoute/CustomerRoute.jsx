// Sprint 13 - Rutas protegidas: excluye al rol ADMIN de rutas de cliente (checkout).
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { selectIsAdmin } from "../../store/authSlice";

// Bloquea el acceso de un ADMIN a páginas pensadas para el flujo de compra
// (por ahora, /cart). No repite la comprobación de sesión/authChecked:
// este componente solo tiene sentido colgando DENTRO de <PrivateRoute />,
// que ya garantiza que hay un usuario autenticado antes de llegar aquí.
function CustomerRoute() {
  const isAdmin = useSelector(selectIsAdmin);

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}

export default CustomerRoute;
