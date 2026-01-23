const rateLimit = require("express-rate-limit");

exports.ordersLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 30, // 30 intentos por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Demasiadas solicitudes, inténtalo más tarde"
  }
});