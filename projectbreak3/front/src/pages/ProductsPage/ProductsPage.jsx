import { useState, useMemo } from "react";
import { useProducts } from "../../hooks/useProducts";
import ProductGrid from "../../components/ProductGrid/ProductGrid";

function ProductsPage() {
  const { data: products, loading, error } = useProducts();

  // Estado del buscador: igual que en Sprint 13, no cambia nada
  const [searchText, setSearchText] = useState("");

  // Guard clauses ANTES del useMemo estarían mal: los Hooks no pueden
  // ser condicionales. Por eso el useMemo va antes de los "return" de
  // loading/error, aunque products pueda ser null en ese momento.
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [products, searchText]);

  if (loading) return <p className="status-message">Cargando catálogo...</p>;
  if (error) return <p className="status-message error">Error: {error}</p>;

  return (
    <section className="products-page">
      <h1>Catálogo</h1>

      <input
        type="text"
        className="search-input"
        placeholder="Buscar camiseta..."
        value={searchText}
        onChange={(event) => setSearchText(event.target.value)}
      />

      {filteredProducts.length > 0 ? (
        <ProductGrid products={filteredProducts} />
      ) : (
        <p className="status-message">No hay resultados para "{searchText}"</p>
      )}
    </section>
  );
}

export default ProductsPage;
