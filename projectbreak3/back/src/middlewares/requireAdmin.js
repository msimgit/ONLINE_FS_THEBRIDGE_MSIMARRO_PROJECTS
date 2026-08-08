function requireAdmin(req, res, next) {
  if (req.user?.role !== "ADMIN") {
    return res
      .status(403)
      .json({ message: "Acceso denegado: se requiere rol ADMIN" });
  }
  next();
}

module.exports = requireAdmin;
