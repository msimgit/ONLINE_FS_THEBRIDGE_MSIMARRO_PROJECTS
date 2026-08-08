import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAdmin } from "../../store/authSlice";

// Iconos como SVG (no emoji): así el hover puede cambiar su color con CSS,
// algo que un emoji a color no permite.
function CartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.5 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21 7H6" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-3.9 3.6-7 8-7s8 3.1 8 7" />
    </svg>
  );
}

function Header({
  onCartClick,
  cartItemCount = 0,
  isCartOpen,
  onProfileClick,
  isProfileOpen,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const isAdmin = useSelector(selectIsAdmin);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <NavLink to="/" className="header-logo" onClick={closeMenu}>
        WorldCup Shop
      </NavLink>

      <button
        className="header-burger"
        onClick={toggleMenu}
        aria-label="Abrir menú"
      >
        {isMenuOpen ? "✕" : "☰"}
      </button>

      <nav className={isMenuOpen ? "header-nav open" : "header-nav"}>
        <NavLink to="/" className="header-pill-link" onClick={closeMenu}>
          Home
        </NavLink>
        <NavLink
          to="/products"
          className="header-pill-link"
          onClick={closeMenu}
        >
          Productos
        </NavLink>
      </nav>

      {/* Login + iconos agrupados en un solo bloque, pegados a la derecha.
          Si fueran hijos sueltos del header, justify-content:space-between
          los repartiría por todo el ancho en vez de mantenerlos juntos. */}
      <div className="header-actions">
        {!isAuthenticated && (
          <NavLink to="/login" className="header-pill-link" onClick={closeMenu}>
            Iniciar sesión
          </NavLink>
        )}

        {isAuthenticated && (
          <button
            className={`header-icon-button ${isProfileOpen ? "active" : ""}`}
            onClick={onProfileClick}
            aria-label="Abrir perfil"
          >
            <PersonIcon />
          </button>
        )}

        {/* Un admin gestiona la tienda, no compra en ella: sin acceso
            al carrito mientras esté logueado con ese rol. */}
        {!isAdmin && (
          <button
            className={`header-icon-button ${isCartOpen ? "active" : ""}`}
            onClick={onCartClick}
            aria-label="Abrir carrito"
          >
            <CartIcon />
            {cartItemCount > 0 && (
              <span className="header-cart-badge">{cartItemCount}</span>
            )}
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
