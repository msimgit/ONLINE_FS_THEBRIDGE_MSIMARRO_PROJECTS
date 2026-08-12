import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

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
  {
    key: "issues",
    label: "Incidencias",
    basePath: "/admin/returns", // también cubre /admin/reviews más abajo
    items: [
      { to: "/admin/returns", label: "Devoluciones" },
      { to: "/admin/reviews", label: "Comentarios" },
    ],
  },
];

function AdminSidebar() {
  const location = useLocation();

  const [openKey, setOpenKey] = useState(() =>
    ADMIN_NAV.find(
      (category) =>
        location.pathname.startsWith(category.basePath) ||
        location.pathname.startsWith("/admin/reviews"),
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
