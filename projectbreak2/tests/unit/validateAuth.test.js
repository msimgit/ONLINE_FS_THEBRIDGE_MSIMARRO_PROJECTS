// Project Break 2 - Mejora opcional 2 (Supertest). Lógica de Sprint 10 (Auth).
import { describe, it, expect, jest } from "@jest/globals";
import { validateRegister, validateLogin } from "../../src/middlewares/validateAuth.js";

function mockRes() {
  return {
    statusCode: null,
    body: null,
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; return this; },
  };
}

describe("validateRegister", () => {
  it("rechaza un email con formato inválido", () => {
    const res = mockRes();
    const next = jest.fn();
    validateRegister({ body: { email: "no-es-email", password: "123456" } }, res, next);

    expect(res.statusCode).toBe(400);
    expect(next).not.toHaveBeenCalled();
  });

  it("rechaza una password demasiado corta", () => {
    const res = mockRes();
    const next = jest.fn();
    validateRegister({ body: { email: "espana@mundial.com", password: "123" } }, res, next);

    expect(res.statusCode).toBe(400);
    expect(next).not.toHaveBeenCalled();
  });

  it("llama a next() cuando los datos son válidos", () => {
    const res = mockRes();
    const next = jest.fn();
    validateRegister({ body: { email: "espana@mundial.com", password: "123456" } }, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBeNull();
  });
});

describe("validateLogin", () => {
  it("rechaza si falta email o password", () => {
    const res = mockRes();
    const next = jest.fn();
    validateLogin({ body: { email: "espana@mundial.com" } }, res, next);

    expect(res.statusCode).toBe(400);
    expect(next).not.toHaveBeenCalled();
  });

  it("llama a next() si vienen ambos campos", () => {
    const res = mockRes();
    const next = jest.fn();
    validateLogin({ body: { email: "espana@mundial.com", password: "123456" } }, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
