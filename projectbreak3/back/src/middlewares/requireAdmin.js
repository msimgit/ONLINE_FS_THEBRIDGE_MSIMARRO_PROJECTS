import { fail } from "../utils/response.js";

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "ADMIN") {
    return fail(res, "Acceso denegado. Se requiere rol de administrador.", 403);
  }
  next();
}
