// backend/middlewares/authenticateToken.js
const jwt = require('jsonwebtoken');

// Cargar la clave secreta desde .env
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretclaveporDefecto';

const authenticateToken = (req, res, next) => {
  // Obtener el token desde las cookies
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
  }

  try {
    // Verificar el token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Adjuntar los datos del usuario decodificado a la solicitud
    req.user = decoded;

    // Continuar con la siguiente función o middleware
    next();
  } catch (error) {
    console.error('Error al autenticar el token:', error);
    return res.status(403).json({ message: 'Token inválido o expirado.' });
  }
};

module.exports = authenticateToken;
