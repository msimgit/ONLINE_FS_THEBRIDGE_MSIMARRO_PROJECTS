// Estructura base (Express, parsers, /health): Sprint 7.
// Seguridad (helmet, cors, rate limit): Sprint 10.
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

// Rate limit general (protege login/registro de fuerza bruta entre otros)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// --- Parsers ---
app.use(express.json());
app.use(cookieParser());

// --- Health check ---
app.get("/health", (req, res) => ok(res, { status: "up" }));

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
