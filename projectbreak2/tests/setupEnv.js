// Project Break 2 - Mejora opcional 2 (Supertest).
// Se ejecuta ANTES de cargar cualquier test (ver jest.config.js -> setupFiles).
// Los servicios usan mocks de Prisma/Mongo, así que estos valores nunca llegan
// a una base de datos real: solo sirven para que env.js no aborte el arranque.
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/testdb";
process.env.DIRECT_URL ??= process.env.DATABASE_URL;
process.env.MONGO_URI ??= "mongodb://localhost:27017/testdb";
process.env.JWT_SECRET ??= "test_jwt_secret_no_usar_en_produccion";
process.env.JWT_EXPIRES_IN ??= "1h";
process.env.NODE_ENV ??= "test";
process.env.CLIENT_URL ??= "http://localhost:5173";
process.env.PORT ??= "0";
