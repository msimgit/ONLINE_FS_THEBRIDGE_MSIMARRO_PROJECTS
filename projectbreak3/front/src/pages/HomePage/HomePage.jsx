// Sprint 13 - Página de ruta índice ('/'), composición de componentes por props.
import { Link } from "react-router-dom";
import { useProducts } from "../../hooks/useProducts";
import ProductGrid from "../../components/ProductGrid/ProductGrid";

function HomePage() {
  // data llega null al principio; lo renombramos a products al destructurar
  const { data: products, loading, error } = useProducts();

  if (loading) return <p className="status-message">Cargando productos...</p>;
  if (error) return <p className="status-message error">Error: {error}</p>;

  // "Más demandados": no hay salesCount en el backend (es todo mock),
  // así que usamos stock como proxy — menos stock restante = más vendido.
  // Mismo criterio que ya usa ProductCard para "¡Últimas unidades!".
  // .slice() antes de .sort() porque sort() muta el array original.
  const featuredProducts = products
    .slice()
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 4);

  return (
    <section className="home">
      <div className="home-hero">
        <h1>WorldCup Shop</h1>
        <p>Las camisetas oficiales del Mundial 2026</p>
        <Link to="/products" className="btn btn-primary">
          Ver catálogo completo
        </Link>
      </div>

      <h2>Los más demandados</h2>
      <ProductGrid products={featuredProducts} />
    </section>
  );
}

export default HomePage;
