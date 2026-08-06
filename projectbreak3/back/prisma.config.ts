// Generado siguiendo el mismo patrón que en Sprint 9.
// npm install --save-dev prisma dotenv
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // El CLI (db push / migrate) usa la conexión DIRECTA, no el pooler
    url: env("DIRECT_URL"),
  },
});
