// Sprint 8 - manejo de errores HTTP (ruta no encontrada).
import { fail } from "../utils/response.js";

export function notFound(req, res) {
  return fail(res, `Ruta no encontrada: ${req.method} ${req.originalUrl}`, 404);
}
