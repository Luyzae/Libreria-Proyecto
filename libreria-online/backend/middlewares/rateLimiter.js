// backend/middlewares/rateLimiter.js
const rateLimit = require('express-rate-limit');


const loginLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 2, 
  message: {
    message: 'Demasiados intentos de inicio de sesión, por favor intenta nuevamente después de 1 minuto.'
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});


module.exports = loginLimiter;
