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
      req.body.quantity
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

export async function checkout(req, res, next) {
  try {
    const order = await cartService.checkout(req.user.sub);
    return ok(res, { order }, 201);
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
