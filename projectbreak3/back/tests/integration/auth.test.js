// Project Break 2 - Mejora opcional 2 (Supertest). Cubre el flujo de Sprint 10 (Auth).
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import request from "supertest";
import bcrypt from "bcryptjs";
import { createMockPrisma } from "../helpers/mockPrisma.js";

const mockPrisma = createMockPrisma();

// Hay que mockear el módulo ANTES de importar app.js (que lo importa indirectamente).
jest.unstable_mockModule("../../src/config/prismaClient.js", () => ({
  default: mockPrisma,
}));

const { default: app } = await import("../../src/app.js");

describe("Auth (/api/auth, /api/me)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("POST /api/auth/register crea el usuario y devuelve cookie httpOnly", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null); // no existe todavía
    mockPrisma.user.create.mockResolvedValue({
      id: "user-1",
      email: "seleccion.espana@mundial.com",
      role: "USER",
      passwordHash: "hash-no-deberia-salir-en-la-respuesta",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "seleccion.espana@mundial.com", password: "123456" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe("seleccion.espana@mundial.com");
    expect(res.body.data.user.passwordHash).toBeUndefined();
    expect(res.headers["set-cookie"][0]).toMatch(/^token=/);
  });

  it("POST /api/auth/register devuelve 409 si el email ya existe", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: "user-1", email: "seleccion.espana@mundial.com" });

    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "seleccion.espana@mundial.com", password: "123456" });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/auth/register valida antes de tocar la BD", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "no-es-email", password: "123" });

    expect(res.status).toBe(400);
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("POST /api/auth/login con credenciales correctas devuelve cookie", async () => {
    const passwordHash = await bcrypt.hash("123456", 10);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user-2",
      email: "seleccion.brasil@mundial.com",
      role: "USER",
      passwordHash,
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "seleccion.brasil@mundial.com", password: "123456" });

    expect(res.status).toBe(200);
    expect(res.headers["set-cookie"][0]).toMatch(/^token=/);
  });

  it("POST /api/auth/login con password incorrecta devuelve 401", async () => {
    const passwordHash = await bcrypt.hash("123456", 10);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user-2",
      email: "seleccion.brasil@mundial.com",
      role: "USER",
      passwordHash,
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "seleccion.brasil@mundial.com", password: "password-incorrecta" });

    expect(res.status).toBe(401);
  });

  it("GET /api/me sin cookie devuelve 401", async () => {
    const res = await request(app).get("/api/me");
    expect(res.status).toBe(401);
  });
});
