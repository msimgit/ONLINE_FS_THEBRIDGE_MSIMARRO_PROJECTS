import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createProduct,
  updateProduct,
  getProductById,
} from "../../api/products";

function AdminProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
    imageUrl: "",
  });
  const [isOnSale, setIsOnSale] = useState(false);
  const [salePrice, setSalePrice] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEditing) return;

    async function fetchProduct() {
      try {
        const product = await getProductById(id);
        setFormData({
          name: product.name ?? "",
          price: product.price ?? "",
          stock: product.stock ?? "",
          description: product.description ?? "",
          imageUrl: product.imageUrl ?? "",
        });
        // salePrice puede venir como null (sin oferta) o número (con oferta)
        if (product.salePrice !== null && product.salePrice !== undefined) {
          setIsOnSale(true);
          setSalePrice(product.salePrice);
        }
        setIsActive(product.isActive ?? true);
      } catch (err) {
        setError("No se pudo cargar el producto.");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id, isEditing]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSaleToggle(e) {
    setIsOnSale(e.target.checked);
    if (!e.target.checked) setSalePrice("");
  }

  function validate() {
    if (!formData.name.trim()) return "El nombre es obligatorio.";
    // description es opcional en el modelo (String?), no se valida como obligatoria.
    if (formData.price === "" || Number.isNaN(Number(formData.price))) {
      return "El precio debe ser un número.";
    }
    if (Number(formData.price) < 0) return "El precio no puede ser negativo.";
    if (formData.stock !== "" && Number.isNaN(Number(formData.stock))) {
      return "El stock debe ser un número entero.";
    }
    if (Number(formData.stock) < 0) return "El stock no puede ser negativo.";

    if (isOnSale) {
      if (salePrice === "" || Number.isNaN(Number(salePrice))) {
        return "El precio de oferta debe ser un número.";
      }
      if (Number(salePrice) <= 0) {
        return "El precio de oferta debe ser mayor que 0.";
      }
      if (Number(salePrice) >= Number(formData.price)) {
        return "El precio de oferta debe ser menor que el precio normal.";
      }
    }

    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      ...formData,
      price: Number(formData.price),
      stock: formData.stock === "" ? 0 : Number(formData.stock),
      // Se manda explícitamente null al desmarcar, para poder DESACTIVAR
      // una oferta ya existente al editar (no solo activarla).
      salePrice: isOnSale ? Number(salePrice) : null,
      isActive,
    };

    try {
      setSubmitting(true);
      if (isEditing) {
        await updateProduct(id, payload);
      } else {
        await createProduct(payload);
      }
      navigate("/admin/products");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "No se pudo guardar el producto. Inténtalo de nuevo.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p>Cargando producto...</p>;

  return (
    <div className="admin-form-page">
      <h1>{isEditing ? "Editar producto" : "Crear producto"}</h1>

      {error && <p className="admin-error">{error}</p>}

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="admin-form-row">
          <label htmlFor="name">Nombre</label>
          <input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nombre del producto"
          />
        </div>

        <div className="admin-form-row">
          <label htmlFor="price">Precio</label>
          <input
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Precio"
            inputMode="decimal"
          />
        </div>

        <div className="admin-form-row admin-form-row-checkbox">
          <label htmlFor="sale-toggle">En oferta</label>
          <div className="admin-form-sale-group">
            <div className="admin-form-sale-checkbox-wrap">
              <input
                id="sale-toggle"
                type="checkbox"
                checked={isOnSale}
                onChange={handleSaleToggle}
              />
            </div>
            {isOnSale && (
              <input
                name="salePrice"
                className="admin-form-sale-price-input"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="Precio de oferta"
                inputMode="decimal"
              />
            )}
          </div>
        </div>

        <div className="admin-form-row">
          <label htmlFor="stock">Stock</label>
          <input
            id="stock"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            placeholder="Stock"
            inputMode="numeric"
          />
        </div>

        <div className="admin-form-row">
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Descripción (opcional)"
          />
        </div>

        <div className="admin-form-row">
          <label htmlFor="imageUrl">URL de imagen</label>
          {/* Temporal: hasta el tutorial de Cloudinary, la imagen se
              introduce como URL manual (placeholder o enlace real). */}
          <input
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="URL de la imagen (temporal)"
          />
        </div>

        <div className="admin-form-row admin-form-row-checkbox">
          <label htmlFor="isActive">Visible en la web</label>
          <input
            id="isActive"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
        </div>

        <div className="admin-form-row admin-form-row-submit">
          <span />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminProductFormPage;
