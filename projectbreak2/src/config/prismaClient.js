// Sprint 9 - SQL con Prisma.
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "./env.js";

// Instancia única de Prisma para toda la app.
// Usamos DATABASE_URL (pooler, modo transacción, puerto 6543) para runtime.
const adapter = new PrismaPg({ connectionString: env.databaseUrl });

const prisma = new PrismaClient({ adapter });

export default prisma;
