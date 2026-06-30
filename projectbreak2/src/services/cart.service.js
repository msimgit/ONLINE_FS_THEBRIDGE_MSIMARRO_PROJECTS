// Sprint 12 - Carrito y Checkout (transacción con prisma.$transaction).
import prisma from "../config/prismaClient.js";
import { AppError } from "../utils/AppError.js";

const cartInclude = {
  items: {
    include: { product: true },
  },
};

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
  return prisma.cart.findUnique({ where: { id: cartId }, include: cartInclude });
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

export async function checkout(userId) {
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

      total += product.price * item.quantity;
      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        priceAtPurchase: product.price,
      });
    }

    const newOrder = await tx.order.create({
      data: {
        userId,
        total,
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

export async function getOrders(userId) {
  return prisma.order.findMany({
    where: { userId },
    include: { items: { include: { product: true } } },
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
