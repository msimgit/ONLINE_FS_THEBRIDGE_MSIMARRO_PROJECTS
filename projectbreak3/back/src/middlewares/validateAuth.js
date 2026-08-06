// Sprint 10 - Autenticación + Autorización + Seguridad.
import { fail } from "../utils/response.js";

export function validateRegister(req, res, next) {
  const { email, password } = req.body;
  const errors = [];

  if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push("El campo 'email' es obligatorio y debe ser un email válido.");
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    errors.push("El campo 'password' es obligatorio y debe tener al menos 6 caracteres.");
  }

  if (errors.length > 0) {
    return fail(res, errors.join(" "), 400);
  }

  next();
}

export function validateLogin(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return fail(res, "'email' y 'password' son obligatorios.", 400);
  }

  next();
}
