// Project Break 2 - Mejora opcional 2 (Supertest). Cubre el CRUD de Sprint 8/9 (Productos).
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import request from "supertest";
import { createMockPrisma } from "../helpers/mockPrisma.js";

const mockPrisma = createMockPrisma();

jest.unstable_mockModule("../../src/config/prismaClient.js", () => ({
  default: mockPrisma,
}));

const { default: app } = await import("../../src/app.js");
const { signToken } = await import("../../src/utils/jwt.js");

const ADMIN_COOKIE = `token=${signToken({ sub: "admin-1", role: "ADMIN" })}`;
const USER_COOKIE = `token=${signToken({ sub: "user-1", role: "USER" })}`;

const spainJersey = {
  id: "jersey-esp-1",
  name: "Camiseta España Mundial 2026",
  description: "Réplica oficial, edición Mundial 2026.",
  price: 89.99,
  stock: 40,
  imageUrl: null,
};

describe("Productos (/api/products)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET /api/products es público y lista productos", async () => {
    mockPrisma.product.findMany.mockResolvedValue([spainJersey]);

    const res = await request(app).get("/api/products");

    expect(res.status).toBe(200);
    expect(res.body.data.products).toHaveLength(1);
    expect(res.body.data.products[0].name).toBe("Camiseta España Mundial 2026");
  });

  it("GET /api/products/:id devuelve 404 si no existe", async () => {
    mockPrisma.product.findUnique.mockResolvedValue(null);

    const res = await request(app).get("/api/products/no-existe");

    expect(res.status).toBe(404);
  });

  it("POST /api/products sin autenticar devuelve 401", async () => {
    const res = await request(app).post("/api/products").send(spainJersey);
    expect(res.status).toBe(401);
  });

  it("POST /api/products autenticado como USER (no ADMIN) devuelve 403", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Cookie", USER_COOKIE)
      .send({ name: "Camiseta Brasil Mundial 2026", price: 89.99, stock: 30 });

    expect(res.status).toBe(403);
    expect(mockPrisma.product.create).not.toHaveBeenCalled();
  });

  it("POST /api/products como ADMIN crea el producto", async () => {
    mockPrisma.product.create.mockResolvedValue(spainJersey);

    const res = await request(app)
      .post("/api/products")
      .set("Cookie", ADMIN_COOKIE)
      .send({
        name: spainJersey.name,
        description: spainJersey.description,
        price: spainJersey.price,
        stock: spainJersey.stock,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.product.name).toBe("Camiseta España Mundial 2026");
  });

  it("POST /api/products como ADMIN con datos incompletos devuelve 400", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Cookie", ADMIN_COOKIE)
      .send({ name: "Camiseta sin precio ni stock" });

    expect(res.status).toBe(400);
    expect(mockPrisma.product.create).not.toHaveBeenCalled();
  });

  it("PUT /api/products/:id como ADMIN actualiza el stock", async () => {
    mockPrisma.product.findUnique.mockResolvedValue(spainJersey);
    mockPrisma.product.update.mockResolvedValue({ ...spainJersey, stock: 25 });

    const res = await request(app)
      .put(`/api/products/${spainJersey.id}`)
      .set("Cookie", ADMIN_COOKIE)
      .send({ stock: 25 });

    expect(res.status).toBe(200);
    expect(res.body.data.product.stock).toBe(25);
  });

  it("DELETE /api/products/:id como ADMIN elimina el producto", async () => {
    mockPrisma.product.findUnique.mockResolvedValue(spainJersey);
    mockPrisma.product.delete.mockResolvedValue(spainJersey);

    const res = await request(app)
      .delete(`/api/products/${spainJersey.id}`)
      .set("Cookie", ADMIN_COOKIE);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
