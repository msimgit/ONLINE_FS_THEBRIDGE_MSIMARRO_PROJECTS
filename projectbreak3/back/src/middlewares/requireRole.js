// Sprint 10 - Autenticación + Autorización + Seguridad (control de roles).
import { fail } from "../utils/response.js";

// Uso: router.post("/", authenticate, requireRole("ADMIN"), controller.create)
export function requireRole(...allowedRoles) {
  return function (req, res, next) {
    if (!req.user) {
      return fail(res, "No autenticado.", 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return fail(res, "No tienes permisos para realizar esta acción.", 403);
    }

    next();
  };
}
