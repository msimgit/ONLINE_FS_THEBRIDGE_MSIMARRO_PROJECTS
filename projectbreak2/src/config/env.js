// Sprint 7 (config inicial) - ampliado en Sprint 9 (Postgres), 10 (JWT) y 11 (Mongo).
import "dotenv/config";

const required = ["DATABASE_URL", "MONGO_URI", "JWT_SECRET"];

for (const key of required) {
  if (!process.env[key]) {
    // Por seguridad, el servidor NO debe arrancar si falta una variable crítica
    console.error(`[ENV] Falta la variable de entorno obligatoria: ${key}`);
    process.exit(1);
  }
}

export const env = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
};
