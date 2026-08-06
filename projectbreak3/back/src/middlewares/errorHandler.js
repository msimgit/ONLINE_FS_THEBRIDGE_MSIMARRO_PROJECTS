// Sprint 8 - manejo de errores HTTP. Ampliado en Sprint 9 (Prisma), 11 (Mongo/Mongoose)
// y Project Break 2 - Mejora opcional 1 (errores de Multer).
import { fail } from "../utils/response.js";

// Middleware de 4 argumentos -> Express lo reconoce como Error Handler.
// Cualquier next(err) de la app termina aquí.
export function errorHandler(err, req, res, next) {
  // Errores conocidos de Prisma
  if (err.code === "P2025") {
    return fail(res, "Recurso no encontrado", 404);
  }
  if (err.code === "P2002") {
    return fail(res, "Conflicto: registro duplicado", 409);
  }

  // Error de clave duplicada de MongoDB (ej. review duplicada, índice unique)
  if (err.code === 11000) {
    return fail(res, "Ya existe un registro con esos datos (duplicado).", 409);
  }

  // Error de validación de Mongoose (ej. rating fuera de 1-5)
  if (err.name === "ValidationError") {
    return fail(res, err.message, 400);
  }

  // Id de Mongo con formato inválido (ej. /api/reviews/abc123)
  if (err.name === "CastError") {
    return fail(res, "Identificador con formato inválido.", 400);
  }

  // Errores de Multer al subir el archivo (tamaño, formato, etc.)
  if (err.name === "MulterError") {
    const messages = {
      LIMIT_FILE_SIZE: "La imagen supera el tamaño máximo permitido (5 MB).",
      LIMIT_UNEXPECTED_FILE: "Formato de archivo no soportado (usa JPG, PNG o WEBP).",
    };
    return fail(res, messages[err.code] || err.message, 400);
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Error interno del servidor";

  if (statusCode === 500) {
    console.error("[ErrorHandler]", err);
  }

  return fail(res, message, statusCode);
}
