// Sprint 10 - Autenticación + Autorización + Seguridad.
import bcrypt from "bcryptjs";
import prisma from "../config/prismaClient.js";
import { AppError } from "../utils/AppError.js";
import { signToken } from "../utils/jwt.js";

const SALT_ROUNDS = 10;

// Quita passwordHash antes de devolver el usuario al controlador
function toPublicUser(user) {
  const { passwordHash, ...publicUser } = user;
  return publicUser;
}

export async function registerUser({ email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError("Ya existe un usuario con ese email.", 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { email, passwordHash },
  });

  const token = signToken({ sub: user.id, role: user.role });

  return { user: toPublicUser(user), token };
}

export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError("Credenciales inválidas.", 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw new AppError("Credenciales inválidas.", 401);
  }

  const token = signToken({ sub: user.id, role: user.role });

  return { user: toPublicUser(user), token };
}

export async function getUserById(id) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new AppError("Usuario no encontrado.", 404);
  }
  return toPublicUser(user);
}
