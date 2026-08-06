// Project Break 2 - Mejora opcional 2 (Supertest). Lógica de Sprint 10 (JWT).
import { describe, it, expect } from "@jest/globals";
import { signToken, verifyToken } from "../../src/utils/jwt.js";

describe("jwt utils", () => {
  it("firma y verifica un token válido", () => {
    const token = signToken({ sub: "user-mundial-1", role: "ADMIN" });
    const payload = verifyToken(token);

    expect(payload.sub).toBe("user-mundial-1");
    expect(payload.role).toBe("ADMIN");
  });

  it("lanza una excepción al verificar un token manipulado", () => {
    const token = signToken({ sub: "user1", role: "USER" });
    const tampered = token.slice(0, -2) + "xx";

    expect(() => verifyToken(tampered)).toThrow();
  });

  it("lanza una excepción al verificar un token con texto arbitrario", () => {
    expect(() => verifyToken("esto-no-es-un-jwt")).toThrow();
  });
});
