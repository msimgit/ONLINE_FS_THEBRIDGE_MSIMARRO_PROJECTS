// Sprint 10 - Autenticación + Autorización + Seguridad.
import { fail } from "../utils/response.js";
import { verifyToken } from "../utils/jwt.js";
import { COOKIE_NAME } from "../config/cookieOptions.js";

export function authenticate(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return fail(res, "No autenticado. Inicia sesión para continuar.", 401);
  }

  try {
    const payload = verifyToken(token); // { sub, role, iat, exp }
    req.user = payload;
    next();
  } catch (err) {
    return fail(res, "Sesión inválida o caducada. Inicia sesión de nuevo.", 401);
  }
}
