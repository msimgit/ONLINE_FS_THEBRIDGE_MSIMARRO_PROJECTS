// Sprint 11 - MongoDB (Reviews + Wishlist).
import * as wishlistService from "../services/wishlist.service.js";
import { ok } from "../utils/response.js";

export async function getWishlist(req, res, next) {
  try {
    const wishlist = await wishlistService.getWishlist(req.user.sub);
    return ok(res, { wishlist });
  } catch (err) {
    next(err);
  }
}

export async function addToWishlist(req, res, next) {
  try {
    const wishlist = await wishlistService.addToWishlist(req.user.sub, req.params.productId);
    return ok(res, { wishlist });
  } catch (err) {
    next(err);
  }
}

export async function removeFromWishlist(req, res, next) {
  try {
    const wishlist = await wishlistService.removeFromWishlist(req.user.sub, req.params.productId);
    return ok(res, { wishlist });
  } catch (err) {
    next(err);
  }
}
