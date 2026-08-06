// Arranque del servidor: Sprint 7. Conexión a Mongo antes de levantar Express: Sprint 11.
import { env } from "./config/env.js";
import { connectMongo } from "./config/mongo.js";
import app from "./app.js";

async function start() {
  await connectMongo(); // Si falla, hace process.exit(1) (ver config/mongo.js)

  app.listen(env.port, () => {
    console.log(`[Server] Escuchando en http://localhost:${env.port}`);
    console.log(`[Server] Entorno: ${env.nodeEnv}`);
  });
}

start();
