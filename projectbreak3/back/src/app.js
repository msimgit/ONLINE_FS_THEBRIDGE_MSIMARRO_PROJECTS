// Estructura base (Express, parsers, /health): Sprint 7.
// Seguridad (helmet, cors, rate limit): Sprint 10.
// Webhook de Stripe: registrado ANTES de express.json() y con su propio
// parser en crudo — la verificación de firma de Stripe necesita el body
// tal cual llegó por la red, byte a byte; si express.json() lo parsea
// primero, la firma nunca verifica y el webhook falla siempre.
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";

import { env } from "./config/env.js";
import { swaggerSpec } from "./config/swaggerSpec.js";
import { ok } from "./utils/response.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { handleStripeWebhook } from "./controllers/webhook.controller.js";
import routes from "./routes/index.routes.js";

const app = express();

// --- Seguridad ---
// crossOriginResourcePolicy: por defecto helmet pone "same-origin", lo que en
// algunos navegadores bloquearía que el frontend React (otro origen/puerto) lea
// las respuestas, aunque CORS esté bien configurado. Lo abrimos a "cross-origin"
// porque el control de acceso real ya lo hace la lista blanca de cors() de abajo.
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// CORS: permitimos el frontend React y habilitamos credentials para la cookie de auth
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);

// --- Health check ---
// Registrado ANTES del rate limiter: Render hace ping aquí periódicamente
// para saber si el servicio sigue vivo. Si contara contra el límite de
// peticiones, los propios health checks podrían acabar bloqueados con un
// 429, y Render reiniciaría el servicio pensando que está caído.
app.get("/health", (req, res) => ok(res, { status: "up" }));

// Rate limit del resto de la API: navegación normal (catálogo, carrito,
// perfil...) genera muchas peticiones por sesión real de usuario —
// un límite pensado para frenar fuerza bruta en login sería demasiado
// agresivo aplicado aquí también.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(generalLimiter);

// Rate limit estricto SOLO para login/registro: aquí sí tiene sentido
// limitar mucho más, es la superficie real de ataque por fuerza bruta.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Demasiados intentos. Inténtalo de nuevo en unos minutos.",
  },
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// --- Webhook de Stripe (ANTES de express.json(), body en crudo) ---
app.post(
  "/api/webhook/stripe",
  express.raw({ type: "application/json" }),
  handleStripeWebhook,
);

// --- Parsers ---
app.use(express.json());
app.use(cookieParser());

// --- Documentación Swagger ---
// swagger-ui-express sirve todo su JS/CSS desde el propio origen (sin scripts
// inline), así que funciona perfectamente bajo el CSP por defecto de helmet.
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Rutas de la API ---
app.use("/api", routes);

// --- 404 y manejo de errores (siempre al final) ---
app.use(notFound);
app.use(errorHandler);

export default app;
