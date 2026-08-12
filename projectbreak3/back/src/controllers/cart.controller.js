// Sprint 12 - Carrito y Checkout.
import * as cartService from "../services/cart.service.js";
import { ok } from "../utils/response.js";

export async function getCart(req, res, next) {
  try {
    const cart = await cartService.getCart(req.user.sub);
    return ok(res, { cart });
  } catch (err) {
    next(err);
  }
}

export async function addItem(req, res, next) {
  try {
    const { productId, quantity } = req.body;
    const cart = await cartService.addItem(req.user.sub, productId, quantity);
    return ok(res, { cart }, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateItem(req, res, next) {
  try {
    const cart = await cartService.updateItemQuantity(
      req.user.sub,
      req.params.itemId,
      req.body.quantity,
    );
    return ok(res, { cart });
  } catch (err) {
    next(err);
  }
}

export async function removeItem(req, res, next) {
  try {
    const cart = await cartService.removeItem(req.user.sub, req.params.itemId);
    return ok(res, { cart });
  } catch (err) {
    next(err);
  }
}

// checkout eliminado: crear un pedido ya no es algo que el cliente pida
// directamente. Ahora lo dispara el webhook de Stripe (server-a-servidor)
// cuando el pago se confirma de verdad. Este endpoint solo CONSULTA si
// el pedido ya existe, para que CheckoutSuccessPage sepa qué mostrar.
export async function getOrderBySessionId(req, res, next) {
  try {
    const order = await cartService.getOrderBySessionId(
      req.user.sub,
      req.params.sessionId,
    );

    if (!order) {
      // No es un error: es normal que el webhook aún no haya llegado
      // (puede tardar un par de segundos respecto a la redirección del
      // navegador). El frontend reintenta con un pequeño retraso.
      return ok(res, { order: null });
    }

    return ok(res, { order });
  } catch (err) {
    next(err);
  }
}

export async function getOrders(req, res, next) {
  try {
    const orders = await cartService.getOrders(req.user.sub);
    return ok(res, { orders });
  } catch (err) {
    next(err);
  }
}

export async function returnOrder(req, res, next) {
  try {
    const order = await cartService.returnOrder(req.params.id, req.user);
    return ok(res, { order });
  } catch (err) {
    next(err);
  }
}

export async function requestReturn(req, res, next) {
  try {
    const { items } = req.body; // [{ orderItemId, quantity, reason }]
    const request = await cartService.requestReturn(req.params.id, items, req.user);
    return ok(res, { request }, 201);
  } catch (err) {
    next(err);
  }
}
