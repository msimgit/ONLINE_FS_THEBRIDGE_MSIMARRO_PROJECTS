// Project Break 2 - Mejora opcional 2 (Supertest).
// "transform: {}" le dice a Jest que NO transpile nada (ni Babel ni TS):
// el proyecto ya es ESM nativo ("type": "module" en package.json) y se ejecuta
// con --experimental-vm-modules (ver el script "test" en package.json).
export default {
  testEnvironment: "node",
  transform: {},
  setupFiles: ["<rootDir>/tests/setupEnv.js"],
  testPathIgnorePatterns: ["/node_modules/"],
  verbose: true,
};
