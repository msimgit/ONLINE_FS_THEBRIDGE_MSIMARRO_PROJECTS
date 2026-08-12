import { verifyToken } from "../utils/jwt.js";
import { COOKIE_NAME } from "../config/cookieOptions.js";

export function optionalAuthenticate(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return next();

  try {
    req.user = verifyToken(token);
  } catch {
    // token inválido/caducado: seguimos como anónimo
  }
  next();
}