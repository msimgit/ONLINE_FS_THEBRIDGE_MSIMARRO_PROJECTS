# WorldCup Shop — Project Break 3

E-commerce full-stack de camisetas oficiales del Mundial 2026. El backend se
desarrolló a lo largo de los sprints previos (Project Break 2 y anteriores);
este Project Break 3 corresponde al **frontend en React**, aunque durante su
desarrollo se hicieron ajustes reales sobre el backend (nuevos modelos,
endpoints, arquitectura de pagos, sistema de incidencias) que se documentan
aquí también, marcados como tal.

---

## 1. Arquitectura general

```
┌──────────────────┐        ┌────────────────────────┐
│   Netlify        │  proxy │   Render               │
│   (Frontend)     │ ─────► │   (Backend / Express)  │
│   React + Vite   │  /api  │                        │
└──────────────────┘        └───────────┬────────────┘
                                        │
                ┌───────────────────────┼───────────────────────┐
                │                       │                       │
        ┌───────▼──────────┐   ┌────────▼─────────┐   ┌─────────▼────────┐
        │  Supabase        │   │  MongoDB Atlas   │   │  Cloudinary      │
        │  (PostgreSQL)    │   │  (reviews)       │   │  (imágenes)      │
        │  vía Prisma      │   │                  │   │                  │
        └──────────────────┘   └──────────────────┘   └──────────────────┘

                                        │
                                ┌───────▼──────────┐
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
- CSS propio ("glass" design system), **modularizado** en varios archivos
  temáticos que se importan desde un `index.css` central (ver §6)

**Backend**
- Node.js + Express
- Prisma ORM sobre PostgreSQL (Supabase)
- MongoDB / Mongoose (reviews, independiente de Postgres — se cruzan por
  `productId` en memoria, nunca con un join real)
- Autenticación con JWT en cookie `httpOnly`; middleware de autenticación
  **opcional** (`optionalAuthenticate`) para endpoints públicos cuyo
  comportamiento cambia si quien pregunta es un admin logueado
- Autorización por rol (`requireAdmin` / `requireRole`) en todos los
  endpoints de escritura sensibles (productos, devoluciones, moderación de
  reviews)
- Cloudinary (subida de imágenes vía `multer.memoryStorage()` + `upload_stream`)
- Stripe Checkout + webhook con verificación de firma e idempotencia
- Helmet, CORS, rate limiting (diferenciado: estricto en login/registro,
  generoso en el resto de la API)

---

## 4. Variables de entorno necesarias

*(nombres únicamente, nunca commitear valores reales)*

**Backend (Render / local)**
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
NODE_ENV=production   # en local: development (o simplemente omitir)
```

**Frontend (Netlify)**
```
VITE_API_URL=/api   # ruta relativa: el proxy de _redirects se encarga del resto
```

> **Nota sobre `STRIPE_WEBHOOK_SECRET` en local**: Stripe no puede alcanzar
> `localhost` directamente. Para probar pagos en desarrollo hace falta el
> [Stripe CLI](https://stripe.com/docs/stripe-cli) reenviando eventos:
> ```
> stripe listen --forward-to localhost:3000/api/webhook
> ```
> Cada ejecución de `stripe listen` genera un `whsec_...` temporal distinto,
> que hay que copiar al `.env` local mientras dure esa sesión. Sin esto, un
> pago completado en modo test se queda “colgado” en el frontend
> (`CheckoutSuccessPage` esperando un pedido que el webhook nunca crea)
> porque Stripe no logra notificar al backend.

---

## 5. Checklist — funcionalidades del enunciado

### Autenticación y usuarios
- [x] Registro e inicio de sesión
- [x] Sesión persistente vía cookie `httpOnly` (no `localStorage`)
- [x] Roles `USER` / `ADMIN` con rutas protegidas por rol, tanto en
  frontend (`AdminRoute`) como en backend (`requireAdmin`/`requireRole`)
- [x] Perfil de usuario con historial de pedidos

### Catálogo
- [x] Listado de productos con búsqueda por nombre
- [x] Ordenación por nombre, precio y stock (ascendente/descendente),
  con flecha de dirección siempre visible en las cabeceras ordenables
- [x] Ficha de producto individual con reviews y valoración media
- [x] Paginación / rendimiento vía caché de Redux (sin peticiones duplicadas
  entre Home, Catálogo y Wishlist)

### Carrito y checkout
- [x] Añadir, quitar y modificar cantidad de productos en el carrito, con
  un selector `+ / -` reutilizado como componente visual único en carrito,
  drawer y formulario de devolución
- [x] Carrito accesible desde drawer lateral y página completa (`/cart`),
  con la misma UI ("ticket" estrecho tipo recibo)
- [x] Checkout real con Stripe (modo test), verificado con pagos de prueba
- [x] Pedido creado de forma fiable vía **webhook de Stripe** (no por el
  navegador del cliente — evita pedidos fantasma o manipulación), con
  idempotencia por `stripeSessionId`
- [x] Miniatura de producto clicable hacia su ficha, de forma consistente
  en carrito, ticket de compra, historial de pedidos y panel de admin

### Panel de administración
- [x] Rutas protegidas exclusivas para `ADMIN`, con sidebar de navegación
  anidada persistente en todas las subpáginas (Dashboard → Productos →
  Ver/Crear; Dashboard → Incidencias → Devoluciones/Comentarios)
- [x] CRUD completo de productos (crear, editar, eliminar, con protección
  ante productos referenciados por pedidos históricos)
- [x] Tabla de productos ordenable
- [x] Subida real de imágenes a Cloudinary desde el formulario, con selector
  de archivo rediseñado (botón + nombre de archivo, en vez del input nativo)
- [x] Toggle de visibilidad de producto (`isActive`) sin necesidad de
  eliminarlo
- [x] Un usuario `ADMIN` no puede comprar: carrito e iconos de compra
  deshabilitados visualmente en toda la web; el drawer de perfil de un admin
  muestra únicamente el acceso al Dashboard, no Perfil/Wishlist

### Wishlist
- [x] Añadir/quitar productos a la wishlist
- [x] Página de wishlist con la misma estética que el carrito

### 🎫 Sistema de devoluciones con aprobación (antes en roadmap, **ahora completo**)
- [x] El cliente solicita la devolución de **artículos concretos** de un
  pedido (no el pedido completo obligatoriamente), eligiendo cuántas
  unidades de cada uno
- [x] Cada artículo devuelto lleva su **propio motivo** (desplegable:
  producto equivocado / no solicitado / talla incorrecta / otro), ya que un
  mismo ticket puede agrupar varios artículos con motivos distintos
- [x] La solicitud queda en estado `PENDING` — no se repone stock ni se
  resuelve nada hasta que un admin actúa
- [x] Panel de admin (`/admin/returns`) con tres secciones: **Pendientes**
  (con botones Aprobar/Rechazar), **Aprobadas** y **Rechazadas**, todas
  visibles en todo momento para no perder trazabilidad
- [x] Al aprobar: se repone stock del artículo, y el pedido recalcula su
  estado automáticamente (`COMPLETED` → `PARTIALLY_RETURNED` →
  `RETURNED`, según cuánto del pedido total se haya devuelto)
- [x] El cliente ve en su historial, junto a cada artículo, el estado de su
  solicitud con número de referencia (`Devolución solicitada / aprobada /
  rechazada de N unidad(es) — Referencia: ...`)
- [x] El total del pedido se muestra recalculado (importe original tachado
  + importe tras devoluciones aprobadas) sin alterar el dato histórico
  real cobrado por Stripe

### ⭐ Moderación de reviews (antes en roadmap, **ahora completo**)
- [x] Panel de admin (`/admin/reviews`) con dos secciones:
  - **Valoraciones negativas pendientes** (< 4★, no resueltas), con
    miniatura del producto y botón **Resuelta** que las retira del listado
  - **Valoración media por producto**, en miniatura pequeña con badge de
    estrellas superpuesto (mismo lenguaje visual que las product cards),
    ordenable por nombre o por valoración
- [x] El admin puede **ocultar** una review directamente desde la ficha de
  producto (icono de ojo/ojo-tachado en la esquina de cada review), sin
  borrarla — queda atenuada visualmente y solo el propio admin sigue
  viéndola; un usuario normal nunca la ve
- [x] La valoración media (catálogo y ficha de producto) **excluye** las
  reviews ocultas del cálculo, para no mostrar una media inconsistente con
  lo que el usuario puede leer

---

## 6. CSS modularizado

El antiguo `index.css` monolítico (~1500 líneas) se dividió en módulos
temáticos, todos importados desde un `index.css` que ahora solo contiene
`@import`, en un orden de cascada intencional:

```
src/styles/
├── variables.css   # :root — paleta, radios, transiciones
├── base.css        # reset, tipografía, "tarjeta de cristal" reutilizable, auth, 404
├── layout.css       # header, drawer genérico, responsive/menú móvil
├── buttons.css       # sistema de botones, inputs, selector de cantidad (+/-)
├── cart.css        # carrito, wishlist, checkout success, perfil/pedidos, precio de oferta
├── products.css      # catálogo, home, product card, detalle de producto, reviews
├── admin.css        # sidebar, tabla de productos, formulario admin, incidencias
└── index.css        # solo @import de los anteriores, en este orden
```

El objetivo fue eliminar duplicación real: por ejemplo, el selector `+/-`
de cantidad es una única clase base (`.quantity-selector`) con
modificadores compactos (`.cart-item-quantity`, `.return-item-quantity`)
en vez de reescribir el mismo bloque de estilos en cada sitio donde se usa.

---

## 7. Funcionalidades extra, más allá del enunciado

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
- **Sistema de devoluciones parcial por artículo con motivo individual y
  flujo de aprobación** — bastante más granular que un simple "devolver
  pedido completo": el cliente elige qué artículos y cuántas unidades, cada
  uno con su propio motivo, y nada se resuelve hasta que un admin lo revisa
- **Moderación de reviews con ocultamiento reversible** (`hidden`) separada
  de la resolución de incidencias (`resolved`) — dos flags independientes
  en el mismo documento, cada uno con su propio flujo y su propia pantalla
  de admin
- **Middleware de autenticación opcional** (`optionalAuthenticate`) para
  que un mismo endpoint público (`GET /products/:id/reviews`) devuelva más
  o menos datos según si quien pregunta está autenticado como admin, sin
  duplicar la ruta
- **Rate limiting diferenciado** — límite estricto solo en login/registro
  (protección real contra fuerza bruta), límite generoso en el resto de la
  API (navegación normal no debe competir por el mismo presupuesto)
- **Health check aislado del rate limit**, para que los pings de Render no
  puedan tumbar el propio servicio por error
- **Proxy Netlify → Render** para sortear el bloqueo de cookies de terceros
  en Safari/iOS
- **CSS modularizado en 6 archivos temáticos** con componentes visuales
  reutilizados (ver §6), en vez de un único archivo monolítico

---

## 8. Funcionalidades extra pendientes (roadmap)

### 💡 Visibilidad de la wishlist en el panel de admin

**Estado:** sin empezar. Es la única mejora extra del plan original que
sigue pendiente — devoluciones y moderación de reviews (antes en esta
sección) ya se completaron, ver §5.

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

## 9. Modelos de datos añadidos en Project Break 3

Sobre el schema heredado de Project Break 2, se añadieron:

**Prisma / PostgreSQL**
```prisma
enum ReturnStatus { PENDING  APPROVED  REJECTED }

model ReturnRequest {
  id         String              @id @default(cuid())
  orderId    String
  order      Order               @relation(...)
  status     ReturnStatus        @default(PENDING)
  items      ReturnRequestItem[]
  createdAt  DateTime            @default(now())
  resolvedAt DateTime?
}

model ReturnRequestItem {
  id              String        @id @default(cuid())
  returnRequestId String
  returnRequest   ReturnRequest @relation(...)
  orderItemId     String
  orderItem       OrderItem     @relation(...)
  quantity        Int
  reason          String?       // motivo propio de ESTE artículo, no del ticket entero
}
```

`Order.status` amplió su enum con `PARTIALLY_RETURNED`, y `Order` /
`OrderItem` ganaron sus relaciones inversas correspondientes.

**Mongoose / MongoDB**
```js
// models/Review.js — dos flags nuevos, independientes entre sí
resolved: { type: Boolean, default: false }, // el admin ya gestionó esta valoración negativa
hidden:   { type: Boolean, default: false }, // oculta a usuarios, visible solo para admin
```

---

## 10. Notas de mantenimiento

- Tras cualquier cambio en `schema.prisma`, ejecutar
  `npx prisma migrate dev --name <descripcion>` en local, y confirmar que
  el build de Render aplica `npx prisma migrate deploy` automáticamente
- Tras cualquier cambio de schema que la migración no regenere sola,
  ejecutar `npx prisma generate` — un cliente desactualizado da errores
  confusos tipo `PrismaClientValidationError` o `column does not exist`
  aunque la base de datos ya esté correctamente migrada
- `VITE_API_URL` se "hornea" en el bundle en tiempo de build — cualquier
  cambio en Netlify requiere forzar un redeploy, no basta con guardar la
  variable
- El plan gratuito de Render duerme tras 15 min de inactividad; la primera
  petición tras el despertar puede tardar 30-50s
- **Sensibilidad a mayúsculas en Linux**: Windows/Mac no distinguen
  `OrderCard.jsx` de `Ordercard.jsx` en el sistema de archivos, pero Linux
  (Netlify/Render) sí — un nombre de archivo que no coincide carácter a
  carácter con su `import` compila en local y **rompe el build en
  producción**. Si esto ocurre, renombrar con `git mv` (nunca con el
  explorador de archivos de Windows, que no siempre registra el cambio en
  Git) y verificar con `git status` que aparece como *rename* antes de
  hacer commit