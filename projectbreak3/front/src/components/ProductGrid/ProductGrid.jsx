// Sprint 13 - Renderizado de listas con .map() y prop 'key', composición de <ProductCard> por props.
import ProductCard from '../ProductCard/ProductCard';

// Recibe la lista por props y la transforma en tarjetas
function ProductGrid({ products }) {
  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default ProductGrid;