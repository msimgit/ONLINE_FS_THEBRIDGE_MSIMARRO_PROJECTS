import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

// Árbol de navegación del admin. Añadir aquí nuevas categorías (pedidos,
// usuarios...) sin tocar el resto del componente.
const ADMIN_NAV = [
  {
    key: "products",
    label: "Productos",
    basePath: "/admin/products",
    items: [
      { to: "/admin/products", label: "Ver productos" },
      { to: "/admin/products/new", label: "Crear producto" },
    ],
  },
];

function AdminSidebar() {
  const location = useLocation();

  // Si entras directamente en una subpágina (ej. recargando /admin/products
  // o volviendo de editar), la categoría correspondiente ya arranca abierta
  // en vez de obligarte a desplegarla a mano.
  const [openKey, setOpenKey] = useState(
    () =>
      ADMIN_NAV.find((category) =>
        location.pathname.startsWith(category.basePath),
      )?.key ?? null,
  );

  function toggleCategory(key) {
    setOpenKey((prev) => (prev === key ? null : key));
  }

  return (
    <nav className="admin-sidebar">
      <NavLink to="/admin" end className="admin-sidebar-root">
        Admin Dashboard
      </NavLink>

      <ul className="admin-nav-tree">
        {ADMIN_NAV.map((category) => {
          const isOpen = openKey === category.key;
          return (
            <li key={category.key} className="admin-nav-category">
              <button
                type="button"
                className="admin-nav-category-toggle"
                onClick={() => toggleCategory(category.key)}
                aria-expanded={isOpen}
              >
                <span>{category.label}</span>
                <span
                  className={`admin-nav-chevron ${isOpen ? "open" : ""}`}
                  aria-hidden="true"
                >
                  ▸
                </span>
              </button>

              {isOpen && (
                <ul className="admin-nav-subitems">
                  {category.items.map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end
                        className={({ isActive }) =>
                          `admin-nav-link${isActive ? " active" : ""}`
                        }
                      >
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default AdminSidebar;
