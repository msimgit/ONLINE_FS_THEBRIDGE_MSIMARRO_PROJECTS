// Sprint 16 - useMemo para memoizar el ordenado de la tabla (evita re-ordenar en cada render si no cambian products/sortConfig).
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAdminProducts,
  deleteProduct,
  updateProduct,
} from "../../api/products";

// Columnas ordenables: clave del campo en el objeto producto.
const SORTABLE_COLUMNS = [
  { key: "name", label: "Nombre" },
  { key: "price", label: "Precio" },
  { key: "stock", label: "Stock" },
];

function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // sortConfig.key === null => orden natural (el que devuelve la API)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      // getAdminProducts (no getProducts): el admin necesita ver también
      // los productos ocultos (isActive:false), el listado público no.
      const data = await getAdminProducts();
      setProducts(data);
    } catch (err) {
      setError("No se pudieron cargar los productos.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "¿Seguro que quieres eliminar este producto?",
    );
    if (!confirmed) return;

    try {
      await deleteProduct(id);
      // Recargamos la lista para reflejar el borrado, en vez de filtrar
      // el estado local: así si algo falla en backend vemos el estado real.
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo eliminar el producto.");
    }
  }

  async function handleToggleActive(product) {
    try {
      await updateProduct(product.id, { isActive: !product.isActive });
      fetchProducts();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "No se pudo cambiar la visibilidad del producto.",
      );
    }
  }

  function handleSort(key) {
    setSortConfig((prev) => {
      // Primer clic en esta columna -> ascendente.
      // Si ya estaba activa, alterna asc/desc en vez de reiniciar.
      if (prev.key !== key) return { key, direction: "asc" };
      return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
    });
  }

  const sortedProducts = useMemo(() => {
    if (!sortConfig.key) return products;

    const sorted = [...products].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (typeof aVal === "string") {
        return aVal.localeCompare(bVal, "es", { sensitivity: "base" });
      }
      return aVal - bVal;
    });

    return sortConfig.direction === "asc" ? sorted : sorted.reverse();
  }, [products, sortConfig]);

  if (loading) return <p>Cargando productos...</p>;

  return (
    <div>
      <h1>Productos</h1>

      {error && <p className="admin-error">{error}</p>}

      {products.length === 0 ? (
        <p>No hay productos todavía.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              {SORTABLE_COLUMNS.map((col) => {
  const isSortActive = sortConfig.key === col.key;
  return (
    <th key={col.key}>
      <button
        type="button"
        className="admin-th-sort"
        onClick={() => handleSort(col.key)}
      >
        {col.label}
        <span
          className={`admin-sort-arrow ${isSortActive ? "active" : ""}`}
          aria-hidden="true"
        >
          {isSortActive ? (sortConfig.direction === "asc" ? "▲" : "▼") : "↕"}
        </span>
      </button>
    </th>
  );
})}
              <th>Visible</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sortedProducts.map((p) => (
              <tr
                key={p.id}
                className={!p.isActive ? "admin-row-inactive" : undefined}
              >
                <td>{p.name}</td>
                <td>
                  {p.salePrice != null ? (
                    <>
                      <span className="admin-price-old">{p.price} €</span>{" "}
                      <span className="admin-price-sale">{p.salePrice} €</span>
                    </>
                  ) : (
                    <span>{p.price} €</span>
                  )}
                </td>
                <td>{p.stock}</td>
                <td>
                  <label className="admin-visibility-toggle">
                    <input
                      type="checkbox"
                      checked={p.isActive}
                      onChange={() => handleToggleActive(p)}
                    />
                    {p.isActive ? "Visible" : "Oculto"}
                  </label>
                </td>
                <td className="admin-table-actions">
                  <Link
                    to={`/admin/products/${p.id}/edit`}
                    className="btn btn-secondary"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="btn btn-danger"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminProductsPage;
