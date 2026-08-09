// controllers/webhook.controller.js
// Única fuente fiable para confirmar que un pago se completó de verdad.
// Stripe llama aquí servidor-a-servidor cuando el pago se confirma; el
// navegador del cliente (CheckoutSuccessPage) ya NO tiene poder para
// crear pedidos, solo para consultarlos.
import Stripe from "stripe";
import { env } from "../config/env.js";
import * as cartService from "../services/cart.service.js";

const stripe = new Stripe(env.stripeSecretKey);

export async function handleStripeWebhook(req, res) {
  const signature = req.headers["stripe-signature"];

  let event;
  try {
    // req.body llega como Buffer sin parsear (ver app.js: express.raw()
    // en esta ruta específica, antes de express.json() global).
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      env.stripeWebhookSecret,
    );
  } catch (err) {
    console.error(`[Stripe Webhook] Firma inválida: ${err.message}`);
    // 400 aquí SÍ importa: le dice a Stripe "esto no es tuyo o está
    // corrupto", no "reinténtalo".
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.userId;

    if (!userId) {
      console.error(
        `[Stripe Webhook] Sesión ${session.id} sin metadata.userId; no se puede crear el pedido.`,
      );
      // 200 igualmente: no es un error transitorio, reintentar no lo arregla.
      return res.status(200).json({ received: true });
    }

    try {
      await cartService.checkout(userId, session.id);
    } catch (err) {
      // Motivos esperados y no graves: reintento de Stripe sobre un evento
      // ya procesado (stripeSessionId duplicado → checkout() lo detecta y
      // no crea nada nuevo), o carrito ya vacío por la misma razón.
      // Se registra por si acaso, pero no se devuelve error: forzar un
      // reintento aquí no arregla nada, el pedido ya existe o el problema
      // no es de red.
      console.error(
        `[Stripe Webhook] checkout() para session ${session.id}: ${err.message}`,
      );
    }
  }

  // Cualquier otro tipo de evento (pago fallido, sesión expirada...) se
  // reconoce igual con 200 sin acción — solo checkout.session.completed
  // nos interesa por ahora.
  return res.status(200).json({ received: true });
}