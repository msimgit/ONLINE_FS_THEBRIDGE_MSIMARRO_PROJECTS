// Sprint 11 - MongoDB (Reviews + Wishlist).
import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectMongo() {
  try {
    await mongoose.connect(env.mongoUri);
    console.log("[MongoDB] Conectado correctamente");
  } catch (err) {
    // Si Mongo falla, el servidor no debe arrancar (igual que con JWT_SECRET)
    console.error("[MongoDB] Error de conexión:", err.message);
    process.exit(1);
  }
}
