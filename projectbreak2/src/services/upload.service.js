// Project Break 2 - Mejora opcional 1 (Cloudinary).
import { Readable } from "node:stream";
import cloudinary from "../config/cloudinary.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

export async function uploadImageBuffer(buffer, folder = "ecommerce-products") {
  if (!env.cloudinary.cloudName || !env.cloudinary.apiKey || !env.cloudinary.apiSecret) {
    throw new AppError(
      "Cloudinary no está configurado (faltan variables CLOUDINARY_* en .env).",
      500
    );
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(new AppError("Error subiendo la imagen a Cloudinary.", 502));
        resolve(result);
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
}
