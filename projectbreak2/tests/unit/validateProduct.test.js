// Project Break 2 - Mejora opcional 2 (Supertest). Lógica de Sprint 8 (Productos).
import { describe, it, expect, jest } from "@jest/globals";
import { validateProduct } from "../../src/middlewares/validateProduct.js";

function mockRes() {
  return {
    statusCode: null,
    body: null,
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; return this; },
  };
}

describe("validateProduct", () => {
  it("POST sin price ni stock es rechazado", () => {
    const res = mockRes();
    const next = jest.fn();
    validateProduct({ method: "POST", body: { name: "Camiseta España Mundial 2026" } }, res, next);

    expect(res.statusCode).toBe(400);
    expect(next).not.toHaveBeenCalled();
  });

  it("POST completo y válido pasa la validación", () => {
    const res = mockRes();
    const next = jest.fn();
    validateProduct(
      { method: "POST", body: { name: "Camiseta Argentina Mundial 2026", price: 89.99, stock: 35 } },
      res,
      next
    );

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("PUT parcial (solo stock) es válido, no exige name/price", () => {
    const res = mockRes();
    const next = jest.fn();
    validateProduct({ method: "PUT", body: { stock: 20 } }, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("PUT con price negativo es rechazado", () => {
    const res = mockRes();
    const next = jest.fn();
    validateProduct({ method: "PUT", body: { price: -10 } }, res, next);

    expect(res.statusCode).toBe(400);
    expect(next).not.toHaveBeenCalled();
  });
});
