// Sprint 12 - Documentación con Swagger.
// Documento OpenAPI 3.0 escrito a mano (más fiable que generarlo desde
// comentarios JSDoc repartidos por las rutas). Se sirve en /api/docs.
export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Ecommerce Backend API - Project Break 2",
    version: "1.0.0",
    description:
      "API REST para el backend del Project Break 2. Autenticación con JWT en cookie httpOnly. " +
      "Postgres (Prisma) para usuarios/productos/carrito/pedidos, MongoDB (Mongoose) para reviews/wishlist.",
  },
  servers: [{ url: "/api", description: "Prefijo base de toda la API" }],
  tags: [
    { name: "Auth" },
    { name: "Productos" },
    { name: "Reviews" },
    { name: "Wishlist" },
    { name: "Carrito" },
    { name: "Pedidos" },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "token",
        description: "JWT guardado en cookie httpOnly tras /auth/login o /auth/register",
      },
    },
    schemas: {
      SuccessEnvelope: {
        type: "object",
        properties: { success: { type: "boolean", example: true }, data: { type: "object" } },
      },
      ErrorEnvelope: {
        type: "object",
        properties: { success: { type: "boolean", example: false }, error: { type: "string" } },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          email: { type: "string", format: "email" },
          role: { type: "string", enum: ["USER", "ADMIN"] },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Product: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          description: { type: "string", nullable: true },
          price: { type: "number" },
          stock: { type: "integer" },
          imageUrl: { type: "string", nullable: true },
        },
      },
      Review: {
        type: "object",
        properties: {
          _id: { type: "string" },
          productId: { type: "string" },
          userId: { type: "string" },
          rating: { type: "integer", minimum: 1, maximum: 5 },
          comment: { type: "string" },
        },
      },
      Wishlist: {
        type: "object",
        properties: {
          userId: { type: "string" },
          productIds: { type: "array", items: { type: "string" } },
        },
      },
      Cart: {
        type: "object",
        properties: {
          id: { type: "string" },
          userId: { type: "string" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                productId: { type: "string" },
                quantity: { type: "integer" },
                product: { $ref: "#/components/schemas/Product" },
              },
            },
          },
        },
      },
      Order: {
        type: "object",
        properties: {
          id: { type: "string" },
          userId: { type: "string" },
          total: { type: "number" },
          createdAt: { type: "string", format: "date-time" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                productId: { type: "string" },
                quantity: { type: "integer" },
                priceAtPurchase: { type: "number" },
              },
            },
          },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: "No autenticado",
        content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } } },
      },
      Forbidden: {
        description: "Sin permisos suficientes",
        content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } } },
      },
      NotFound: {
        description: "Recurso no encontrado",
        content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } } },
      },
      BadRequest: {
        description: "Datos de entrada inválidos",
        content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" } } },
      },
    },
  },
  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Crear una cuenta",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 6 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Usuario creado", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessEnvelope" } } } },
          400: { $ref: "#/components/responses/BadRequest" },
          409: { description: "Email ya registrado" },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Iniciar sesión",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: { email: { type: "string" }, password: { type: "string" } },
              },
            },
          },
        },
        responses: {
          200: { description: "Login correcto, cookie 'token' establecida" },
          401: { description: "Credenciales inválidas" },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Cerrar sesión (borra la cookie)",
        responses: { 200: { description: "Sesión cerrada" } },
      },
    },
    "/me": {
      get: {
        tags: ["Auth"],
        summary: "Usuario autenticado actual",
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: "Usuario actual", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "object", properties: { user: { $ref: "#/components/schemas/User" } } } } } } } },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/products": {
      get: {
        tags: ["Productos"],
        summary: "Listar productos",
        parameters: [
          { name: "search", in: "query", schema: { type: "string" }, description: "Filtra por nombre" },
          { name: "sort", in: "query", schema: { type: "string", enum: ["price_asc", "price_desc", "recent"] } },
        ],
        responses: { 200: { description: "Lista de productos" } },
      },
      post: {
        tags: ["Productos"],
        summary: "Crear producto (solo ADMIN)",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "price", "stock"],
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  price: { type: "number" },
                  stock: { type: "integer" },
                  imageUrl: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Producto creado" },
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/products/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      get: {
        tags: ["Productos"],
        summary: "Ver un producto",
        responses: { 200: { description: "Producto" }, 404: { $ref: "#/components/responses/NotFound" } },
      },
      put: {
        tags: ["Productos"],
        summary: "Actualizar producto (solo ADMIN, parcial)",
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: "Producto actualizado" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        tags: ["Productos"],
        summary: "Borrar producto (solo ADMIN)",
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: "Producto eliminado" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/products/{id}/image": {
      post: {
        tags: ["Productos"],
        summary: "Subir/cambiar la imagen del producto (solo ADMIN, Cloudinary)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: { image: { type: "string", format: "binary" } },
              },
            },
          },
        },
        responses: {
          200: { description: "Producto actualizado con la nueva imageUrl" },
          400: { description: "Falta el archivo o formato/tamaño no soportado" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/products/{id}/reviews": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" }, description: "id del producto" }],
      get: {
        tags: ["Reviews"],
        summary: "Listar reviews de un producto",
        responses: { 200: { description: "Lista de reviews" } },
      },
      post: {
        tags: ["Reviews"],
        summary: "Dejar una review (autenticado, una por producto)",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["rating"],
                properties: { rating: { type: "integer", minimum: 1, maximum: 5 }, comment: { type: "string" } },
              },
            },
          },
        },
        responses: {
          201: { description: "Review creada" },
          401: { $ref: "#/components/responses/Unauthorized" },
          409: { description: "Ya existe una review de este usuario para este producto" },
        },
      },
    },
    "/reviews/{reviewId}": {
      delete: {
        tags: ["Reviews"],
        summary: "Borrar una review (propietario o ADMIN)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "reviewId", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Review eliminada" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/wishlist": {
      get: {
        tags: ["Wishlist"],
        summary: "Ver mi wishlist",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "Wishlist del usuario" }, 401: { $ref: "#/components/responses/Unauthorized" } },
      },
    },
    "/wishlist/{productId}": {
      parameters: [{ name: "productId", in: "path", required: true, schema: { type: "string" } }],
      post: {
        tags: ["Wishlist"],
        summary: "Añadir producto a la wishlist",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "Wishlist actualizada" }, 401: { $ref: "#/components/responses/Unauthorized" } },
      },
      delete: {
        tags: ["Wishlist"],
        summary: "Quitar producto de la wishlist",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "Wishlist actualizada" }, 401: { $ref: "#/components/responses/Unauthorized" } },
      },
    },
    "/cart": {
      get: {
        tags: ["Carrito"],
        summary: "Ver mi carrito",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "Carrito del usuario" }, 401: { $ref: "#/components/responses/Unauthorized" } },
      },
    },
    "/cart/items": {
      post: {
        tags: ["Carrito"],
        summary: "Añadir producto al carrito",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["productId", "quantity"],
                properties: { productId: { type: "string" }, quantity: { type: "integer", minimum: 1 } },
              },
            },
          },
        },
        responses: { 201: { description: "Producto añadido" }, 400: { $ref: "#/components/responses/BadRequest" }, 401: { $ref: "#/components/responses/Unauthorized" } },
      },
    },
    "/cart/items/{itemId}": {
      parameters: [{ name: "itemId", in: "path", required: true, schema: { type: "string" }, description: "id del CartItem (no del producto)" }],
      put: {
        tags: ["Carrito"],
        summary: "Cambiar cantidad de un producto del carrito",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "Carrito actualizado" }, 401: { $ref: "#/components/responses/Unauthorized" }, 404: { $ref: "#/components/responses/NotFound" } },
      },
      delete: {
        tags: ["Carrito"],
        summary: "Quitar producto del carrito",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "Carrito actualizado" }, 401: { $ref: "#/components/responses/Unauthorized" }, 404: { $ref: "#/components/responses/NotFound" } },
      },
    },
    "/cart/checkout": {
      post: {
        tags: ["Carrito"],
        summary: "Confirmar pedido (transaccional: descuenta stock, crea Order, vacía carrito)",
        security: [{ cookieAuth: [] }],
        responses: {
          201: { description: "Pedido creado" },
          400: { description: "Carrito vacío" },
          401: { $ref: "#/components/responses/Unauthorized" },
          409: { description: "Stock insuficiente en algún producto" },
        },
      },
    },
    "/orders": {
      get: {
        tags: ["Pedidos"],
        summary: "Mi historial de pedidos",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "Lista de pedidos" }, 401: { $ref: "#/components/responses/Unauthorized" } },
      },
    },
    "/orders/{id}/return": {
      post: {
        tags: ["Pedidos"],
        summary: "Devolver un pedido completo (repone stock, marca el pedido como RETURNED)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Pedido devuelto, stock repuesto" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
          409: { description: "El pedido ya estaba devuelto" },
        },
      },
    },
  },
};
