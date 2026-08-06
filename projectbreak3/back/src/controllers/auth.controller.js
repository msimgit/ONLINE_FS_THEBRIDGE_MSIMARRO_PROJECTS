// Sprint 10 - Autenticación + Autorización + Seguridad.
import * as authService from "../services/auth.service.js";
import { ok } from "../utils/response.js";
import { COOKIE_NAME, cookieOptions } from "../config/cookieOptions.js";

export async function register(req, res, next) {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.registerUser({ email, password });

    res.cookie(COOKIE_NAME, token, cookieOptions);
    return ok(res, { user }, 201);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.loginUser({ email, password });

    res.cookie(COOKIE_NAME, token, cookieOptions);
    return ok(res, { user });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    // clearCookie debe usar las mismas opciones (salvo maxAge) con las que se creó
    res.clearCookie(COOKIE_NAME, cookieOptions);
    return ok(res, { message: "Sesión cerrada correctamente." });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    // req.user lo añade el middleware "authenticate"
    const user = await authService.getUserById(req.user.sub);
    return ok(res, { user });
  } catch (err) {
    next(err);
  }
}
