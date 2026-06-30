// Sprint 7 - formato de respuesta estándar en JSON (adaptado al success/data de PB2).
// Formato estándar exigido en el Project Break 2 para que React consuma la API
// fácilmente: { success: true, data } y { success: false, error }

export function ok(res, data, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function fail(res, message, status = 400) {
  return res.status(status).json({ success: false, error: message });
}
