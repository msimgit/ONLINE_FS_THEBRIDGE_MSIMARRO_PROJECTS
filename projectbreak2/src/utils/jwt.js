// Sprint 10 - Autenticación + Autorización + Seguridad.
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signToken(payload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export function verifyToken(token) {
  // Lanza si el token no es válido o ha caducado; lo capturamos en el middleware
  return jwt.verify(token, env.jwtSecret);
}
