// Sprint 8 - validaciones básicas y errores HTTP.
// salePrice/isActive añadidos junto con el precio de oferta y la
// visibilidad de productos: antes viajaban sin validar hasta Prisma,
// que ante un tipo incorrecto habría respondido con un 500 feo en vez
// de un 400 claro.
import { fail } from "../utils/response.js";

// En POST (creación) los campos obligatorios deben venir siempre.
// En PUT (actualización parcial) solo validamos los campos que vengan.
export function validateProduct(req, res, next) {
  const isCreate = req.method === "POST";
  const { name, price, stock, description, imageUrl, salePrice, isActive } =
    req.body;
  const errors = [];

  if (isCreate || name !== undefined) {
    if (!name || typeof name !== "string" || name.trim() === "") {
      errors.push("El campo 'name' es obligatorio y debe ser texto.");
    }
  }

  if (isCreate || price !== undefined) {
    if (price === undefined || typeof price !== "number" || price < 0) {
      errors.push(
        "El campo 'price' es obligatorio y debe ser un número positivo.",
      );
    }
  }

  if (isCreate || stock !== undefined) {
    if (
      stock === undefined ||
      typeof stock !== "number" ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      errors.push(
        "El campo 'stock' es obligatorio y debe ser un número entero positivo.",
      );
    }
  }

  if (
    description !== undefined &&
    description !== null &&
    typeof description !== "string"
  ) {
    errors.push("El campo 'description' debe ser texto.");
  }

  if (
    imageUrl !== undefined &&
    imageUrl !== null &&
    typeof imageUrl !== "string"
  ) {
    errors.push("El campo 'imageUrl' debe ser texto (URL).");
  }

  // salePrice es opcional siempre (create o update): null significa
  // "sin oferta", así que solo se valida el formato cuando trae un valor.
  if (salePrice !== undefined && salePrice !== null) {
    if (typeof salePrice !== "number" || salePrice <= 0) {
      errors.push(
        "El campo 'salePrice' debe ser un número mayor que 0, o null.",
      );
    } else if (typeof price === "number" && salePrice >= price) {
      errors.push("El campo 'salePrice' debe ser menor que 'price'.");
    }
  }

  if (isActive !== undefined && typeof isActive !== "boolean") {
    errors.push("El campo 'isActive' debe ser true o false.");
  }

  if (errors.length > 0) {
    return fail(res, errors.join(" "), 400);
  }

  next();
}
