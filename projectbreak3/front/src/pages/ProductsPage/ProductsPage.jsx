// Sprint 13 - Ruta '/products' + Sprint 14 (fetch de productos vía hook con useEffect).
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../store/productsSlice";
import ProductGrid from "../../components/ProductGrid/ProductGrid";

// Igual que en la tabla del admin: clic en una opción ordena ascendente,
// clic otra vez sobre la misma alterna a descendente.
const SORT_OPTIONS = [
  { key: "name", label: "Nombre" },
  { key: "price", label: "Precio" },
  { key: "stock", label: "Stock" },
];

function ProductsPage() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.products);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const filtered = useMemo(
    () =>
      items
        ? items.filter((p) =>
            p.name.toLowerCase().includes(search.toLowerCase()),
          )
        : [],
    [items, search],
  );

  const sorted = useMemo(() => {
    if (!sortConfig.key) return filtered;

    // Para "precio" comparamos lo que el cliente pagaría de verdad
    // (salePrice si hay oferta activa), no el precio de catálogo — si no,
    // un producto rebajado a 40€ podía aparecer ordenado como si costara 65€.
    const getValue = (item) =>
      sortConfig.key === "price"
        ? (item.salePrice ?? item.price)
        : item[sortConfig.key];

    const result = [...filtered].sort((a, b) => {
      const aVal = getValue(a);
      const bVal = getValue(b);

      if (typeof aVal === "string") {
        return aVal.localeCompare(bVal, "es", { sensitivity: "base" });
      }
      return aVal - bVal;
    });

    return sortConfig.direction === "asc" ? result : result.reverse();
  }, [filtered, sortConfig]);

  function handleSort(key) {
    setSortConfig((prev) => {
      if (prev.key !== key) return { key, direction: "asc" };
      return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
    });
  }

  if (loading && !items) {
    return <p className="status-message">Cargando catálogo...</p>;
  }
  if (error) return <p className="status-message error">Error: {error}</p>;

  return (
    <section className="products-page">
      <h1>Catálogo</h1>

      <div className="products-toolbar">
        <input
          type="text"
          className="search-input"
          placeholder="Buscar camiseta..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="sort-controls">
          <span className="sort-label">Ordenar por</span>
          {SORT_OPTIONS.map((option) => {
            const isActive = sortConfig.key === option.key;
            return (
              <button
                key={option.key}
                type="button"
                className={`sort-pill${isActive ? " active" : ""}`}
                onClick={() => handleSort(option.key)}
              >
                {option.label}
                {isActive && (
                  <span className="sort-pill-arrow" aria-hidden="true">
                    {sortConfig.direction === "asc" ? "▲" : "▼"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {sorted.length > 0 ? (
        <ProductGrid products={sorted} />
      ) : (
        <p className="status-message">No hay resultados para "{search}"</p>
      )}
    </section>
  );
}

export default ProductsPage;
