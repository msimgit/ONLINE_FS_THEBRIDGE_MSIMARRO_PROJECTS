// Sprint 15 - useSelector/useDispatch: lee el usuario autenticado del store y dispatch-ea el logout.
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { logout, selectIsAdmin } from "../../store/authSlice";

function ProfileDrawer({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const isAdmin = useSelector(selectIsAdmin);

  if (!isOpen) return null;

  const handleLogout = async () => {
    onClose();
    await dispatch(logout());
    navigate("/");
  };

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />

      <aside className="drawer">
        <div className="drawer-header">
          <h2>{user?.email}</h2>
          <button
            className="drawer-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <nav className="drawer-menu">
          {isAdmin ? (
            <Link to="/admin" className="drawer-menu-link" onClick={onClose}>
              Admin
            </Link>
          ) : (
            <>
              <Link
                to="/profile"
                className="drawer-menu-link"
                onClick={onClose}
              >
                Perfil
              </Link>
              <Link
                to="/wishlist"
                className="drawer-menu-link"
                onClick={onClose}
              >
                Wishlist
              </Link>
            </>
          )}
          <button
            className="drawer-menu-link drawer-menu-button"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </nav>
      </aside>
    </>
  );
}

export default ProfileDrawer;
