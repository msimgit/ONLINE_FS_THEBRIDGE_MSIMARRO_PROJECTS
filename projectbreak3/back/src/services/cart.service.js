// Sprint 12 - Carrito y Checkout (transacción con prisma.$transaction).
// withCartTotal añadido junto con salePrice: el total del carrito (antes de
// pagar) se calcula en vivo con el precio EFECTIVO de cada producto
// (salePrice si hay oferta activa, si no price), para que quede coherente
// con lo que se cobrará realmente en el checkout.
import prisma from "../config/prismaClient.js";
import { AppError } from "../utils/AppError.js";

const cartInclude = {
  items: {
    include: { product: true },
  },
};

function effectivePrice(product) {
  return product.salePrice ?? product.price;
}

function withCartTotal(cart) {
  const total = cart.items.reduce(
    (sum, item) => sum + effectivePrice(item.product) * item.quantity,
    0,
  );
  return { ...cart, total };
}

// El usuario puede tener varios carritos a lo largo del tiempo (uno por cada
// checkout que hace), pero solo UNO en estado ACTIVE a la vez. Es ese el que
// usan todas las operaciones de "añadir/editar/quitar" mientras compra.
async function getOrCreateActiveCartId(userId) {
  const existing = await prisma.cart.findFirst({ where: { userId, status: "ACTIVE" } });
  if (existing) return existing.id;

  const created = await prisma.cart.create({ data: { userId } });
  return created.id;
}

export async function getCart(userId) {
  const cartId = await getOrCreateActiveCartId(userId);
  const cart = await prisma.cart.findUnique({ where: { id: cartId }, include: cartInclude });
  return withCartTotal(cart);
}

async function ensureProduct(productId) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new AppError("Producto no encontrado.", 404);
  }
  return product;
}

export async function addItem(userId, productId, quantity) {
  await ensureProduct(productId);

  const cartId = await getOrCreateActiveCartId(userId);

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId, productId } },
    create: { cartId, productId, quantity },
    update: { quantity: { increment: quantity } },
  });

  return getCart(userId);
}

// itemId es el id del propio CartItem (tal y como pide el enunciado:
// DELETE /api/cart/items/:itemId), no el id del producto.
export async function updateItemQuantity(userId, itemId, quantity) {
  const cart = await prisma.cart.findFirst({ where: { userId, status: "ACTIVE" } });
  if (!cart) {
    throw new AppError("Carrito vacío.", 404);
  }

  const item = await prisma.cartItem.findFirst({ where: { id: itemId, cartId: cart.id } });
  if (!item) {
    throw new AppError("Ese item no está en tu carrito.", 404);
  }

  await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });

  return getCart(userId);
}

export async function removeItem(userId, itemId) {
  const cart = await prisma.cart.findFirst({ where: { userId, status: "ACTIVE" } });
  if (!cart) {
    throw new AppError("Carrito vacío.", 404);
  }

  const item = await prisma.cartItem.findFirst({ where: { id: itemId, cartId: cart.id } });
  if (!item) {
    throw new AppError("Ese item no está en tu carrito.", 404);
  }

  await prisma.cartItem.delete({ where: { id: itemId } });

  return getCart(userId);
}

// stripeSessionId: viene del webhook de Stripe. Si ya existe un Order con
// ese sessionId, este checkout ya se procesó antes (reintento de Stripe) —
// se devuelve el pedido existente en vez de crear uno duplicado y volver
// a descontar stock.
export async function checkout(userId, stripeSessionId = null) {
  if (stripeSessionId) {
    const existing = await prisma.order.findUnique({
      where: { stripeSessionId },
      include: { items: { include: { product: true } } },
    });
    if (existing) return existing;
  }

  const cart = await getCart(userId);

  if (!cart.items || cart.items.length === 0) {
    throw new AppError("Tu carrito está vacío.", 400);
  }

  // Todo dentro de una única transacción: si algo falla (ej. sin stock),
  // se deshace todo y no queda nada a medias (ni stock descontado, ni pedido creado).
  const order = await prisma.$transaction(async (tx) => {
    let total = 0;
    const orderItemsData = [];

    for (const item of cart.items) {
      // Releemos el producto DENTRO de la transacción para evitar condiciones de carrera
      const product = await tx.product.findUnique({ where: { id: item.productId } });

      if (!product) {
        throw new AppError(`El producto ${item.productId} ya no existe.`, 404);
      }
      if (product.stock < item.quantity) {
        throw new AppError(`Sin stock suficiente de "${product.name}".`, 409);
      }

      await tx.product.update({
        where: { id: product.id },
        data: { stock: { decrement: item.quantity } },
      });

      // Precio EFECTIVO en el instante exacto del checkout: si hay oferta
      // activa se paga el precio de oferta, si no el normal. Este valor
      // queda fijado para siempre en priceAtPurchase, sin importar que el
      // precio del producto cambie después (subidas, bajadas, fin de oferta).
      const chargedPrice = effectivePrice(product);
      const wasOnSale = product.salePrice != null;

      total += chargedPrice * item.quantity;
      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        priceAtPurchase: chargedPrice,
        // Solo se rellena si había oferta activa; así un pedido comprado
        // a precio normal no arrastra un originalPrice redundante.
        originalPrice: wasOnSale ? product.price : null,
      });
    }

    const newOrder = await tx.order.create({
      data: {
        userId,
        total,
        stripeSessionId,
        items: { create: orderItemsData },
      },
      include: { items: { include: { product: true } } },
    });

    // El carrito pasa a CHECKED_OUT (como pide el enunciado) en vez de vaciarse:
    // queda como registro histórico de lo que se compró, y la próxima vez que el
    // usuario añada algo se le creará un carrito ACTIVE nuevo automáticamente.
    await tx.cart.update({ where: { id: cart.id }, data: { status: "CHECKED_OUT" } });

    return newOrder;
  });

  return order;
}

export async function getOrderBySessionId(userId, sessionId) {
  const order = await prisma.order.findUnique({
    where: { stripeSessionId: sessionId },
    include: { items: { include: { product: true } } },
  });

  if (!order) return null;

  // No dejamos que un usuario consulte el pedido de otro adivinando/probando
  // session ids ajenos, aunque en la práctica son strings no adivinables.
  if (order.userId !== userId) {
    throw new AppError("No tienes permiso para ver este pedido.", 403);
  }

  return order;
}

export async function getOrders(userId) {
  return prisma.order.findMany({
    where: { userId },
    include: {
      items: { include: { product: true } },
      returnRequests: { include: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// Devolución del pedido COMPLETO (no por artículo individual, para mantenerlo simple).
// Repone el stock de cada producto y marca el pedido como RETURNED.
export async function returnOrder(orderId, requester) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    throw new AppError("Pedido no encontrado.", 404);
  }

  const isOwner = order.userId === requester.sub;
  const isAdmin = requester.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    throw new AppError("No tienes permiso para devolver este pedido.", 403);
  }

  if (order.status === "RETURNED") {
    throw new AppError("Este pedido ya fue devuelto.", 409);
  }

  return prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }

    return tx.order.update({
      where: { id: orderId },
      data: { status: "RETURNED" },
      include: { items: { include: { product: true } } },
    });
  });
}

// Cantidad ya devuelta o en trámite de un OrderItem concreto (PENDING + APPROVED),
// para no permitir devolver más unidades de las que realmente se compraron.
async function getRequestedQuantity(tx, orderItemId) {
  const requestItems = await tx.returnRequestItem.findMany({
    where: {
      orderItemId,
      returnRequest: { status: { in: ["PENDING", "APPROVED"] } },
    },
  });
  return requestItems.reduce((sum, ri) => sum + ri.quantity, 0);
}

// items = [{ orderItemId, quantity, reason }] — cada artículo puede tener su propio motivo
export async function requestReturn(orderId, items, requester) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError("Debes indicar al menos un artículo a devolver.", 400);
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    throw new AppError("Pedido no encontrado.", 404);
  }

  const isOwner = order.userId === requester.sub;
  const isAdmin = requester.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    throw new AppError("No tienes permiso para devolver este pedido.", 403);
  }

  return prisma.$transaction(async (tx) => {
    const requestItemsData = [];

    for (const { orderItemId, quantity, reason } of items) {
      if (!quantity || quantity <= 0) {
        throw new AppError("La cantidad a devolver debe ser mayor que 0.", 400);
      }

      const orderItem = order.items.find((oi) => oi.id === orderItemId);
      if (!orderItem) {
        throw new AppError(`El artículo ${orderItemId} no pertenece a este pedido.`, 404);
      }

      const alreadyRequested = await getRequestedQuantity(tx, orderItemId);
      const available = orderItem.quantity - alreadyRequested;

      if (quantity > available) {
        throw new AppError(
          `Solo puedes devolver ${available} unidad(es) más de "${orderItemId}".`,
          409,
        );
      }

      requestItemsData.push({ orderItemId, quantity, reason });
    }

    return tx.returnRequest.create({
      data: {
        orderId,
        items: { create: requestItemsData },
      },
      include: {
        items: { include: { orderItem: { include: { product: true } } } },
      },
    });
  });
}

export async function getReturnRequests(status) {
  return prisma.returnRequest.findMany({
    where: status ? { status } : undefined,
    include: {
      order: { include: { user: { select: { email: true } } } },
      items: { include: { orderItem: { include: { product: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// Recalcula el estado del pedido tras aprobar una devolución: si TODAS las
// unidades de TODOS los artículos ya están devueltas -> RETURNED;
// si solo una parte -> PARTIALLY_RETURNED.
async function recalculateOrderStatus(tx, orderId) {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  let fullyReturnedCount = 0;
  let anyReturned = false;

  for (const item of order.items) {
    const approvedItems = await tx.returnRequestItem.findMany({
      where: { orderItemId: item.id, returnRequest: { status: "APPROVED" } },
    });
    const returnedQty = approvedItems.reduce((sum, ri) => sum + ri.quantity, 0);

    if (returnedQty > 0) anyReturned = true;
    if (returnedQty >= item.quantity) fullyReturnedCount += 1;
  }

  const newStatus =
    fullyReturnedCount === order.items.length
      ? "RETURNED"
      : anyReturned
        ? "PARTIALLY_RETURNED"
        : "COMPLETED";

  await tx.order.update({ where: { id: orderId }, data: { status: newStatus } });
}

export async function approveReturnRequest(requestId) {
  const request = await prisma.returnRequest.findUnique({
    where: { id: requestId },
    include: { items: { include: { orderItem: true } } },
  });

  if (!request) throw new AppError("Solicitud de devolución no encontrada.", 404);
  if (request.status !== "PENDING") throw new AppError("Esta solicitud ya fue resuelta.", 409);

  return prisma.$transaction(async (tx) => {
    for (const reqItem of request.items) {
      await tx.product.update({
        where: { id: reqItem.orderItem.productId },
        data: { stock: { increment: reqItem.quantity } },
      });
    }

    await recalculateOrderStatus(tx, request.orderId);

    return tx.returnRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED", resolvedAt: new Date() },
      include: { items: { include: { orderItem: { include: { product: true } } } } },
    });
  });
}

export async function rejectReturnRequest(requestId) {
  const request = await prisma.returnRequest.findUnique({ where: { id: requestId } });

  if (!request) throw new AppError("Solicitud de devolución no encontrada.", 404);
  if (request.status !== "PENDING") throw new AppError("Esta solicitud ya fue resuelta.", 409);

  return prisma.returnRequest.update({
    where: { id: requestId },
    data: { status: "REJECTED", resolvedAt: new Date() },
    include: { items: { include: { orderItem: { include: { product: true } } } } },
  });
}