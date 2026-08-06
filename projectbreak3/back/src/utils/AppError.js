// Sprint 8 - manejo de errores HTTP con código de estado propio.
// Error "de negocio" con código HTTP asociado.
// Los servicios/controladores lanzan AppError y el errorHandler sabe qué status devolver.
export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}
