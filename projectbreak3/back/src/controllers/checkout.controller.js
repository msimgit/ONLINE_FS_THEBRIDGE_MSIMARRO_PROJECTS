// controllers/checkout.controller.js
import Stripe from "stripe";
import prisma from "../config/prismaClient.js";
import { env } from "../config/env.js";
import { fail, ok } from "../utils/response.js";

const stripe = new Stripe(env.stripeSecretKey);

export async function createCheckoutSession(req, res, next) {
  try {
    const { items } = req.body; // [{ productId, quantity }]

    if (!Array.isArray(items) || items.length === 0) {
      return fail(res, "El carrito está vacío.", 400);
    }

    // Recalculamos precios reales desde la BD, nunca confiamos en el frontend
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const lineItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product)
        throw new Error(`Producto no encontrado: ${item.productId}`);

      // Precio EFECTIVO: si hay oferta activa, se cobra ese, no el normal.
      // Debe coincidir exactamente con lo que cart.service.js.checkout()
      // guardará como priceAtPurchase al confirmar el pedido en
      // CheckoutSuccessPage — si no, Stripe cobraría un importe distinto
      // al que queda registrado como "pagado" en la base de datos.
      const chargedPrice = product.salePrice ?? product.price;

      return {
        price_data: {
          currency: "eur",
          product_data: { name: product.name },
          unit_amount: Math.round(chargedPrice * 100), // Stripe usa céntimos
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: `${env.clientUrl}/checkout/success`,
      cancel_url: `${env.clientUrl}/cart`,
      metadata: { userId: req.user.sub }, // útil para asociar el pedido luego
    });

    return ok(res, { url: session.url });
  } catch (err) {
    next(err);
  }
}
