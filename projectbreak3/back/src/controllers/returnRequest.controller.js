import * as cartService from "../services/cart.service.js";
import { ok } from "../utils/response.js";

export async function listReturnRequests(req, res, next) {
  try {
    const { status } = req.query;
    const requests = await cartService.getReturnRequests(status);
    return ok(res, { requests });
  } catch (err) {
    next(err);
  }
}

export async function approveReturnRequest(req, res, next) {
  try {
    const request = await cartService.approveReturnRequest(req.params.id);
    return ok(res, { request });
  } catch (err) {
    next(err);
  }
}

export async function rejectReturnRequest(req, res, next) {
  try {
    const request = await cartService.rejectReturnRequest(req.params.id);
    return ok(res, { request });
  } catch (err) {
    next(err);
  }
}