# WorldCup Shop — Project Break 3

E-commerce full-stack de camisetas oficiales del Mundial 2026. El backend se
desarrolló a lo largo de los sprints previos (Project Break 2 y anteriores);
este Project Break 3 corresponde al **frontend en React**, aunque durante su
desarrollo se hicieron ajustes reales sobre el backend (nuevos campos,
endpoints, arquitectura de pagos) que se documentan aquí también, marcados
como tal.

---

## 1. Arquitectura general

```
┌─────────────────┐        ┌──────────────────────┐
│   Netlify        │  proxy │   Render               │
│   (Frontend)     │ ─────► │   (Backend / Express)  │
│   React + Vite   │  /api  │                         │
└─────────────────┘        └──────────┬──────────────┘
                                        │
                ┌───────────────────────┼───────────────────────┐
                │                       │                       │
        ┌───────▼────────┐   ┌──────────▼─────────┐   ┌─────────▼────────┐
        │  Supabase        │   │  MongoDB Atlas       │   │  Cloudinary        │
        │  (PostgreSQL)    │   │  (reviews)           │   │  (imágenes)        │
        │  vía Prisma      │   │                       │   │                    │
        └──────────────────┘   └───────────────────────┘   └────────────────────┘

                                        │
                                ┌───────▼────────┐
                                │  Stripe          │
                                │  Checkout +      │
                                │  Webhook         │
                                └──────────────────┘
```

El frontend **nunca llama directamente** a `onrender.com` — todas las
peticiones a `/api/*` pasan por un proxy configurado en Netlify
(`public/_redirects`), que las reenvía server-a-server a Render. Esto hace
que, desde el punto de vista del navegador, la API sea del mismo origen que
la web (`netlify.app`), lo cual es necesario porque Safari/iOS bloquea por
defecto las cookies de sesión cuando front y back están en dominios
distintos (Intelligent Tracking Prevention), incluso con
`SameSite=None; Secure` correctamente configurado.

---

## 2. Dónde está desplegado

| Servicio | Plataforma | URL |
|---|---|---|
| Frontend | Netlify | `https://msprojectbreak3.netlify.app` |
| Backend | Render | `https://online-fs-thebridge-msimarro-projects.onrender.com` |
| Base de datos relacional | Supabase (PostgreSQL) | — |
| Base de datos de reviews | MongoDB Atlas | — |
| Imágenes | Cloudinary | — |
| Pagos | Stripe (modo test/sandbox) | — |

### Estructura del repositorio

```
projectbreak3/
├── back/     # Node.js + Express + Prisma (heredado de Project Break 2, con ajustes en PB3)
└── front/    # React + Vite + Redux Toolkit (desarrollado en Project Break 3)
```

---

## 3. Stack tecnológico

**Frontend**
- React 18 + Vite
- Redux Toolkit (auth, cart, wishlist, products — con caché real vía
  `condition` en los thunks para evitar peticiones duplicadas)
- React Router (rutas protegidas por rol: `PrivateRoute`, `AdminRoute`,
  `CustomerRoute`)
- CSS propio ("glass" design system: tarjetas translúcidas, sistema de
  botones unificado, todo centralizado en un único `index.css`)

**Backend**
- Node.js + Express
- Prisma ORM sobre PostgreSQL (Supabase)
- MongoDB (reviews, independiente de Postgres — se cruzan por `productId`)
- Autenticación con JWT en cookie `httpOnly`
- Cloudinary (subida de imágenes vía `multer.memoryStorage()` + `upload_stream`)
- Stripe Checkout + webhook con verificación de firma
- Helmet, CORS, rate limiting (diferenciado: estricto en login/registro,
  generoso en el resto de la API)

---

## 4. Variables de entorno necesarias

*(nombres únicamente, nunca commitear valores reales)*

**Backend (Render)**
```
DATABASE_URL
MONGO_URI
JWT_SECRET
JWT_EXPIRES_IN
CLIENT_URL
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
NODE_ENV=production
```

**Frontend (Netlify)**
```
VITE_API_URL=/api   # ruta relativa: el proxy de _redirects se encarga del resto
```

---

## 5. Checklist — funcionalidades del enunciado

### Autenticación y usuarios
- [x] Registro e inicio de sesión
- [x] Sesión persistente vía cookie `httpOnly` (no `localStorage`)
- [x] Roles `USER` / `ADMIN` con rutas protegidas por rol
- [x] Perfil de usuario con historial de pedidos

### Catálogo
- [x] Listado de productos con búsqueda por nombre
- [x] Ordenación por nombre, precio y stock (ascendente/descendente)
- [x] Ficha de producto individual con reviews y valoración media
- [x] Paginación / rendimiento vía caché de Redux (sin peticiones duplicadas
  entre Home, Catálogo y Wishlist)

### Carrito y checkout
- [x] Añadir, quitar y modificar cantidad de productos en el carrito
- [x] Carrito accesible desde drawer lateral y página completa (`/cart`),
  con la misma UI
- [x] Checkout real con Stripe (modo test), verificado con pagos de prueba
- [x] Pedido creado de forma fiable vía **webhook de Stripe** (no por el
  navegador del cliente — evita pedidos fantasma o manipulación)
- [x] Historial de pedidos con estado (`COMPLETED` / `RETURNED`)
- [x] Devolución de pedido con reposición automática de stock

### Panel de administración
- [x] Rutas protegidas exclusivas para `ADMIN`, con sidebar de navegación
  anidada (Dashboard → Productos → Ver/Crear)
- [x] CRUD completo de productos (crear, editar, eliminar, con protección
  ante productos referenciados por pedidos históricos)
- [x] Tabla de productos ordenable
- [x] Subida real de imágenes a Cloudinary desde el formulario (verificado)
- [x] Toggle de visibilidad de producto (`isActive`) sin necesidad de
  eliminarlo
- [x] Un usuario `ADMIN` no puede comprar: carrito e iconos de compra
  deshabilitados visualmente en toda la web

### Wishlist
- [x] Añadir/quitar productos a la wishlist
- [x] Página de wishlist con la misma estética que el carrito

---

## 6. Funcionalidades extra, más allá del enunciado

Estas se añadieron por iniciativa propia durante el desarrollo, no estaban
en el enunciado original:

- **Precio de oferta (`salePrice`)** — sistema completo de principio a fin:
  - Campo en base de datos, validado en backend
  - Se refleja de forma consistente en catálogo, ficha de producto, carrito,
    drawer, historial de pedidos y confirmación de compra (etiqueta visual
    "Oferta" en la miniatura, precio tachado)
  - El precio que **cobra Stripe** coincide exactamente con el que se
    **registra** en el pedido — verificado con pago real
  - El historial de pedidos conserva el precio de oferta que existía **en el
    momento de la compra** (campo `originalPrice` en `OrderItem`), aunque la
    oferta cambie o desaparezca después
- **Webhook de Stripe con verificación de firma e idempotencia** — el pedido
  se crea server-a-server cuando Stripe confirma el pago, no cuando el
  navegador del cliente llega a la página de éxito (patrón más seguro que
  el habitual en un proyecto de bootcamp)
- **Rate limiting diferenciado** — límite estricto solo en login/registro
  (protección real contra fuerza bruta), límite generoso en el resto de la
  API (navegación normal no debe competir por el mismo presupuesto)
- **Health check aislado del rate limit**, para que los pings de Render no
  puedan tumbar el propio servicio por error
- **Proxy Netlify → Render** para sortear el bloqueo de cookies de terceros
  en Safari/iOS

---

## 7. Funcionalidades extra pendientes (roadmap)

### 🎫 Sistema de tickets para devoluciones

**Ya implementado:**
- Endpoint de devolución (`returnOrder`) que permite al cliente devolver un
  pedido completo, con reposición automática de stock y cambio de estado a
  `RETURNED`

**Falta:**
- El endpoint actual es **autoservicio inmediato**, sin motivo ni
  aprobación — para convertirlo en un sistema de tickets real hace falta:
  - Capturar el **motivo de la devolución** (artículo dañado, talla
    errónea, producto equivocado...) en un formulario al solicitarla
  - Un nuevo estado intermedio (`PENDING`) en vez de resolver la devolución
    al instante — el pedido queda "en revisión" hasta que el admin actúe
  - Sección nueva en el panel de admin (sidebar → "Tickets" o
    "Incidencias") donde el admin vea todos los tickets pendientes, el
    motivo, y pueda **aprobar o rechazar** cada uno

### ⭐ Control de valoraciones bajas

**Estado:** sin empezar.

- Las reviews ya existen (MongoDB, con rating de 1 a 5 estrellas) y la
  media se calcula y se muestra en el catálogo y la ficha de producto
- Falta: un listado en el panel de admin de todas las reviews con
  **3★ o menos** (umbral de "mala experiencia" acordado), para que el
  admin pueda contactar al cliente y ofrecer una solución cuando tenga
  sentido (reembolso parcial, reposición, etc.)

### 💡 Visibilidad de la wishlist en el panel de admin

**Estado:** sin empezar.

- Objetivo: que el admin pueda ver qué productos acumulan más adiciones a
  wishlist en un periodo dado, para:
  - Detectar candidatos a campaña de descuento (mucha demanda latente, poca
    conversión a venta)
  - Anticipar necesidad de reposición de stock si un producto muy deseado
    se está quedando sin unidades
- Requiere una agregación nueva en el backend (contar wishlists por
  producto) y una vista en el admin, no existe ningún endpoint para esto
  todavía

---

## 8. Notas de mantenimiento

- Tras cualquier cambio en `schema.prisma`, ejecutar `npx prisma generate`
  **tanto en local como confirmar que el build de Render lo aplica
  automáticamente** (su build command ya incluye `npx prisma generate` y
  `npx prisma migrate deploy`)
- `VITE_API_URL` se "hornea" en el bundle en tiempo de build — cualquier
  cambio en Netlify requiere forzar un redeploy, no basta con guardar la
  variable
- El plan gratuito de Render duerme tras 15 min de inactividad; la primera
  petición tras el despertar puede tardar 30-50s