// Sprint 10 - Autenticación + Autorización + Seguridad (JWT en cookie httpOnly).
import { env } from "./env.js";

// En producción (front y back en dominios distintos, p.ej. Vercel + Render)
// necesitamos sameSite "none" + secure true para que el navegador la mande.
// En local (mismo "site", solo cambia el puerto) basta con "lax".
export const cookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: env.nodeEnv === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días, alineado con JWT_EXPIRES_IN por defecto
};

export const COOKIE_NAME = "token";
