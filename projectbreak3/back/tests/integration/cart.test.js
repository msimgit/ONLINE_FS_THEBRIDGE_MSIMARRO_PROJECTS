// Project Break 2 - Mejora opcional 2 (Supertest). Cubre el checkout de Sprint 12 (Carrito).
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import request from "supertest";
import { createMockPrisma } from "../helpers/mockPrisma.js";

const mockPrisma = createMockPrisma();

jest.unstable_mockModule("../../src/config/prismaClient.js", () => ({
  default: mockPrisma,
}));

const { default: app } = await import("../../src/app.js");
const { signToken } = await import("../../src/utils/jwt.js");

const USER_COOKIE = `token=${signToken({ sub: "user-1", role: "USER" })}`;

const argentinaJersey = {
  id: "jersey-arg-1",
  name: "Argentina 2026 - Primera Equipación (Hombre)",
  price: 90.0,
  stock: 40,
};

describe("Carrito y checkout (/api/cart)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("POST /api/cart/checkout: descuenta stock, crea el pedido y marca el carrito CHECKED_OUT", async () => {
    // getCart() -> findFirst (carrito ACTIVE existente) + findUnique (con items)
    mockPrisma.cart.findFirst.mockResolvedValue({ id: "cart-1", status: "ACTIVE" });
    mockPrisma.cart.findUnique.mockResolvedValue({
      id: "cart-1",
      status: "ACTIVE",
      items: [{ id: "item-1", productId: argentinaJersey.id, quantity: 2, product: argentinaJersey }],
    });

    const txProduct = {
      findUnique: jest.fn().mockResolvedValue(argentinaJersey),
      update: jest.fn().mockResolvedValue({ ...argentinaJersey, stock: 38 }),
    };
    const txOrder = {
      create: jest.fn().mockResolvedValue({
        id: "order-1",
        total: 180.0,
        items: [{ productId: argentinaJersey.id, quantity: 2, priceAtPurchase: 90.0 }],
      }),
    };
    const txCart = { update: jest.fn().mockResolvedValue({ id: "cart-1", status: "CHECKED_OUT" }) };

    mockPrisma.$transaction.mockImplementation((callback) =>
      callback({ product: txProduct, order: txOrder, cart: txCart })
    );

    const res = await request(app).post("/api/cart/checkout").set("Cookie", USER_COOKIE);

    expect(res.status).toBe(201);
    expect(res.body.data.order.total).toBe(180.0);
    // El stock se descuenta DENTRO de la transacción, por la cantidad pedida
    expect(txProduct.update).toHaveBeenCalledWith({
      where: { id: argentinaJersey.id },
      data: { stock: { decrement: 2 } },
    });
    // El carrito pasa a CHECKED_OUT (no se borran sus items), dentro de la misma transacción
    expect(txCart.update).toHaveBeenCalledWith({
      where: { id: "cart-1" },
      data: { status: "CHECKED_OUT" },
    });
  });

  it("POST /api/cart/checkout devuelve 409 si no hay stock suficiente (y no descuenta nada)", async () => {
    const casiSinStock = { ...argentinaJersey, stock: 1 };

    mockPrisma.cart.findFirst.mockResolvedValue({ id: "cart-1", status: "ACTIVE" });
    mockPrisma.cart.findUnique.mockResolvedValue({
      id: "cart-1",
      status: "ACTIVE",
      items: [{ id: "item-1", productId: casiSinStock.id, quantity: 5, product: casiSinStock }], // pide más de lo que hay
    });

    const txProduct = {
      findUnique: jest.fn().mockResolvedValue(casiSinStock),
      update: jest.fn(),
    };
    mockPrisma.$transaction.mockImplementation((callback) => callback({ product: txProduct }));

    const res = await request(app).post("/api/cart/checkout").set("Cookie", USER_COOKIE);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(txProduct.update).not.toHaveBeenCalled(); // nada se descuenta si falla
  });

  it("POST /api/cart/checkout con el carrito vacío devuelve 400", async () => {
    mockPrisma.cart.findFirst.mockResolvedValue({ id: "cart-1", status: "ACTIVE" });
    mockPrisma.cart.findUnique.mockResolvedValue({ id: "cart-1", status: "ACTIVE", items: [] });

    const res = await request(app).post("/api/cart/checkout").set("Cookie", USER_COOKIE);

    expect(res.status).toBe(400);
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it("DELETE /api/cart/items/:itemId quita el item indicado del carrito ACTIVE", async () => {
    mockPrisma.cart.findFirst.mockResolvedValue({ id: "cart-1", status: "ACTIVE" });
    mockPrisma.cartItem.findFirst.mockResolvedValue({ id: "item-1", cartId: "cart-1" });
    mockPrisma.cartItem.delete.mockResolvedValue({ id: "item-1" });
    mockPrisma.cart.findUnique.mockResolvedValue({ id: "cart-1", status: "ACTIVE", items: [] });

    const res = await request(app).delete("/api/cart/items/item-1").set("Cookie", USER_COOKIE);

    expect(res.status).toBe(200);
    expect(mockPrisma.cartItem.delete).toHaveBeenCalledWith({ where: { id: "item-1" } });
  });

  it("POST /api/orders/:id/return repone el stock y marca el pedido como RETURNED", async () => {
    const order = {
      id: "order-1",
      userId: "user-1",
      status: "COMPLETED",
      items: [{ productId: argentinaJersey.id, quantity: 2 }],
    };
    mockPrisma.order.findUnique.mockResolvedValue(order);

    const txProduct = { update: jest.fn().mockResolvedValue({}) };
    const txOrder = {
      update: jest.fn().mockResolvedValue({ ...order, status: "RETURNED" }),
    };
    mockPrisma.$transaction.mockImplementation((callback) =>
      callback({ product: txProduct, order: txOrder })
    );

    const res = await request(app).post("/api/orders/order-1/return").set("Cookie", USER_COOKIE);

    expect(res.status).toBe(200);
    expect(res.body.data.order.status).toBe("RETURNED");
    expect(txProduct.update).toHaveBeenCalledWith({
      where: { id: argentinaJersey.id },
      data: { stock: { increment: 2 } },
    });
    expect(txOrder.update).toHaveBeenCalledWith({
      where: { id: "order-1" },
      data: { status: "RETURNED" },
      include: { items: { include: { product: true } } },
    });
  });

  it("POST /api/orders/:id/return devuelve 409 si ya estaba devuelto", async () => {
    mockPrisma.order.findUnique.mockResolvedValue({
      id: "order-1",
      userId: "user-1",
      status: "RETURNED",
      items: [],
    });

    const res = await request(app).post("/api/orders/order-1/return").set("Cookie", USER_COOKIE);

    expect(res.status).toBe(409);
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it("POST /api/orders/:id/return devuelve 403 si el pedido no es del usuario", async () => {
    mockPrisma.order.findUnique.mockResolvedValue({
      id: "order-1",
      userId: "otro-usuario",
      status: "COMPLETED",
      items: [],
    });

    const res = await request(app).post("/api/orders/order-1/return").set("Cookie", USER_COOKIE);

    expect(res.status).toBe(403);
  });

  it("POST /api/cart/items sin autenticar devuelve 401", async () => {
    const res = await request(app)
      .post("/api/cart/items")
      .send({ productId: argentinaJersey.id, quantity: 1 });

    expect(res.status).toBe(401);
  });
});
