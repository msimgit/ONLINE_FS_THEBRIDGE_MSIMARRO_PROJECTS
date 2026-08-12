import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createProduct,
  updateProduct,
  getProductById,
  uploadProductImage,
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
  });
  const [isOnSale, setIsOnSale] = useState(false);
  const [salePrice, setSalePrice] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Imagen: currentImageUrl es la que YA tiene el producto en BD (si estás
  // editando); imageFile es el archivo nuevo elegido en este formulario,
  // todavía sin subir. La vista previa usa el archivo nuevo si existe,
  // si no la imagen actual.
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

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
        });
        if (product.salePrice !== null && product.salePrice !== undefined) {
          setIsOnSale(true);
          setSalePrice(product.salePrice);
        }
        setIsActive(product.isActive ?? true);
        setCurrentImageUrl(product.imageUrl ?? null);
      } catch (err) {
        setError("No se pudo cargar el producto.");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id, isEditing]);

  // Libera el object URL de la vista previa al desmontar o cambiar de
  // archivo, para no ir acumulando memoria en el navegador.
  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) setImageFile(file);
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

    // En creación hace falta una imagen sí o sí; en edición basta con que
    // ya hubiera una (no se obliga a cambiarla cada vez que editas texto).
    if (!isEditing && !imageFile) {
      return "Selecciona una imagen para el producto.";
    }
    if (isEditing && !imageFile && !currentImageUrl) {
      return "Este producto no tiene imagen; sube una antes de guardar.";
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
      name: formData.name,
      description: formData.description,
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
        // La imagen solo se sube si el admin eligió un archivo nuevo —
        // si no tocó la imagen, la que ya había en BD se queda igual.
        if (imageFile) {
          await uploadProductImage(id, imageFile);
        }
      } else {
        // POST /products/:id/image exige un producto YA existente, así
        // que primero se crea sin imagen y con el id que devuelve se sube
        // el archivo en una segunda petición.
        const created = await createProduct(payload);
        await uploadProductImage(created.id, imageFile);
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

  const displayedImage = imagePreview || currentImageUrl;

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
  <label htmlFor="image">Imagen</label>
  <div className="admin-image-upload">
    {displayedImage && (
      <img
        src={displayedImage}
        alt="Vista previa"
        className="admin-image-preview"
      />
    )}
    <div className="admin-file-picker">
      <label htmlFor="image" className="btn btn-primary admin-file-picker-btn">
        Elegir archivo
      </label>
      <span className="admin-file-picker-name">
        {imageFile?.name || "Ningún archivo seleccionado"}
      </span>
      <input
        id="image"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="admin-file-picker-input"
      />
    </div>
  </div>
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
            {submitting
              ? isEditing
                ? "Guardando..."
                : "Creando..."
              : isEditing
                ? "Actualizar"
                : "Crear"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminProductFormPage;
