// backend/routes/auth.js
const prisma = require('../prisma'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../utils/emailService');
const { sendRecoveryEmail } = require('../utils/emailService');
const express = require('express');
const router = express.Router();
const loginLimiter = require('../middlewares/rateLimiter');

const JWT_SECRET = process.env.JWT_SECRET || 'superclaveporDefecto'; 

// Ruta para registrar usuarios
router.post('/register', [
    body('nombre').notEmpty().withMessage('El nombre es requerido'),
    body('email').isEmail().withMessage('Debe ser un correo electrónico válido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
  ], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const { nombre, email, password } = req.body;
  
    try {
      // Verificar si el usuario ya existe
      const usuarioExistente = await prisma.usuarios.findUnique({
        where: { email_telefono: email}, 
      });
      if (usuarioExistente) {
        return res.status(400).json({ message: 'El usuario ya está registrado' });
      }
  
      // Encriptar la contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Generar el token de verificación
      const token = Math.floor(100000 + Math.random() * 900000).toString(); // 6 dígitos

      // Encriptar el código corto para almacenarlo en la base de datos
      const encryptedCode = await bcrypt.hash(token, 10);
  
      // Insertar el nuevo usuario en la base de datos junto con el token
      await prisma.usuarios.create({
        data: {
          nombre: nombre,
          email_telefono: email,
          contrase_a: hashedPassword,
          verificado: false,
          token_verificacion: encryptedCode,
          fecha_expiracion_token: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      });
      
      // Generar el JWT de verificación con el email y expiración
      const verificationJWT = jwt.sign({ email }, JWT_SECRET, { expiresIn: '15m' });

      // Almacenar el JWT de verificación en una cookie segura y httpOnly
      res.cookie('verificationToken', verificationJWT, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 15 * 60 * 1000, // 15 minutos de expiración
      });
      
      // Enviar el correo de verificación
      await sendVerificationEmail(email, token);

      // Enviar el JWT de verificación en la respuesta
      res.status(201).json({ message: 'Usuario registrado exitosamente. Revisa tu correo.'});
  
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Error al registrar el usuario', error });
    }
  });

// Ruta para verificar el correo electrónico del usuario
router.post('/verify', [
  body('code').notEmpty().withMessage('El código de verificación es requerido')
], async (req, res) => {
  const { code } = req.body;

  // Obtener el JWT de la cookie
  const verificationJWT = req.cookies.verificationToken;

  if (!verificationJWT) {
    return res.status(401).json({ message: 'Token de verificación faltante.' });
  }

  try {
    // Decodificar el JWT para obtener el email
    const decoded = jwt.verify(verificationJWT, JWT_SECRET);
    const email = decoded.email;

    const usuario = await prisma.usuarios.findUnique({
      where: { email_telefono: email }
    });

    if (!usuario) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    // Verificar si el código coincide con el encriptado
    const isMatch = await bcrypt.compare(code, usuario.token_verificacion);
    if (!isMatch) {
      return res.status(400).json({ message: 'Código de verificación incorrecto' });
    }

    // Actualizar la verificación
    await prisma.usuarios.update({
      where: { id_usuario: usuario.id_usuario },
      data: {
        verificado: true,
        token_verificacion: null,
        fecha_expiracion_token: null
      }
    });

    await prisma.perfiles_custom.create({
      data: {
        id_usuario: usuario.id_usuario,
        nombre_perfil: usuario.nombre,
        fecha_modificacion: new Date()
      }
    });

    // Limpiar la cookie de verificación
    res.clearCookie('verificationToken', { httpOnly: true, secure: true, sameSite: 'Strict' });

    res.status(200).json({ message: 'Cuenta verificada exitosamente' });
  } catch (error) {
    console.error('Error al verificar el usuario:', error);
    res.status(403).json({ message: 'Token de verificación inválido o expirado.' });
  }
});



// Ruta para iniciar sesión
router.post('/login', loginLimiter,[
    body('email').isEmail().withMessage('Debe ser un correo electrónico válido'),
    body('password').notEmpty().withMessage('La contraseña es requerida')
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const { email, password } = req.body;
  
    try {
      // Verificar si el usuario existe
      const usuario = await prisma.usuarios.findUnique({
        where: { email_telefono: email },
      });
      if (!usuario) {
        return res.status(400).json({ message: 'Usuario no encontrado' });
      }
  
      // Verificar si la cuenta está verificada
      if (!usuario.verificado) {
        return res.status(403).json({ message: 'La cuenta no está verificada. Por favor verifica tu correo electrónico.' });
      }

      // Comparar la contraseña ingresada con la almacenada en la base de datos
      const isMatch = await bcrypt.compare(password, usuario.contrase_a);
      if (!isMatch) {
        return res.status(400).json({ message: 'Contraseña incorrecta' });
      }

      // Eliminar el refresh token anterior 
      await prisma.refresh_tokens.deleteMany({
        where: { id_usuario: usuario.id_usuario },
      });
  
      // Generar el JWT (token de acceso) con una expiración de 1 hora
      const token = jwt.sign({ id_usuario: usuario.id_usuario, email: usuario.email_telefono }, JWT_SECRET, { expiresIn: '1h' });

      // Generar el refresh token
      const refreshToken = crypto.randomBytes(40).toString('hex');

      // Guardar el refresh token en la base de datos
      await prisma.refresh_tokens.create({
        data: {
          id_usuario: usuario.id_usuario,
          token: refreshToken,
          expiracion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),  // 30 días
        },
      });

        // Enviar el JWT en una cookie segura
        res.cookie('token', token, {
          httpOnly: true,
          secure: false, // Cambiado a false para entorno local sin HTTPS
          sameSite: 'Lax', // Cambia a 'Lax' para pruebas locales
          maxAge: 3600000 // 1 hora
      });

        // Enviar el refresh token en el cuerpo de la respuesta (ya que este puede ser manejado desde el frontend)
        res.status(200).json({
          message: 'Inicio de sesión exitoso',
          refreshToken,  // Envía solo el refresh token al frontend
      });
  
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      res.status(500).json({ message: 'Error al iniciar sesión', error });
    }
  });

// Ruta para renovar el JWT usando el refresh token
router.post('/token/refresh', async (req, res) => {
  const refreshToken = req.body.refreshToken || req.cookies.refreshToken;

  if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token es requerido' });
  }

  try {
      // Verificar si el refresh token existe en la base de datos
      const storedToken = await prisma.refresh_tokens.findUnique({
          where: { token: refreshToken },
      });

      if (!storedToken) {
          return res.status(403).json({ message: 'Refresh token no válido' });
      }

      // Verificar si el refresh token ha expirado
      if (new Date(storedToken.expiracion) < new Date()) {
          return res.status(403).json({ message: 'Refresh token expirado' });
      }

      // Obtener el usuario asociado al refresh token
      const usuario = await prisma.usuarios.findUnique({
          where: { id_usuario: storedToken.id_usuario },
      });

      if (!usuario) {
          return res.status(403).json({ message: 'Usuario no encontrado' });
      }

      // Generar un nuevo JWT
      const newToken = jwt.sign({ id_usuario: usuario.id_usuario, email: usuario.email_telefono }, JWT_SECRET, { expiresIn: '1h' });

      // Devolver el nuevo JWT en la cookie
      res.cookie('token', newToken, {
          httpOnly: true, 
          secure: true, 
          sameSite: 'Strict',
          maxAge: 3600000 // 1 hora
      });

      res.status(200).json({ message: 'Token renovado exitosamente' });

  } catch (error) {
      console.error('Error al renovar el token:', error);
      res.status(500).json({ message: 'Error al renovar el token', error });
  }
});

// Ruta para cerrar sesión (eliminar el refresh token y borrar la cookie)
router.post('/logout', async (req, res) => {
  const refreshToken = req.body.refreshToken || req.cookies.refreshToken;

  if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token es requerido' });
  }

  try {
      // Eliminar el refresh token de la base de datos
      await prisma.refresh_tokens.delete({
          where: { token: refreshToken },
      });

      // Borrar la cookie que almacena el JWT
      res.clearCookie('token', {
          httpOnly: true,
          secure: true,
          sameSite: 'Strict'
      });

      res.status(200).json({ message: 'Sesión cerrada exitosamente' });

  } catch (error) {
      console.error('Error al cerrar sesión:', error);
      res.status(500).json({ message: 'Error al cerrar sesión', error });
  }
});


// Recuperar contraseña
router.post('/password/recovery', async (req, res) => {
  const { email } = req.body;

  try {
    // Buscar al usuario por el correo electrónico
    const usuario = await prisma.usuarios.findUnique({
      where: { email_telefono: email },
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Generar un código de recuperación de 6 dígitos
    const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Encriptar el código antes de guardarlo en la base de datos
    const hashedRecoveryCode = crypto.createHash('sha256').update(recoveryCode).digest('hex');

    // Guardar el código de recuperación en la base de datos junto con la fecha de expiración (ej. 1 hora)
    await prisma.usuarios.update({
      where: { id_usuario: usuario.id_usuario },
      data: {
        token_recuperacion: hashedRecoveryCode,
        fecha_expiracion_recuperacion: new Date(Date.now() + 60 * 60 * 1000) // 1 hora de expiración
      }
    });

    // Enviar el código de recuperación al correo
    await sendRecoveryEmail(email, recoveryCode);

    res.status(200).json({ message: 'Correo de recuperación enviado. Revisa tu bandeja de entrada.' });

  } catch (error) {
    console.error('Error al solicitar la recuperación:', error);
    res.status(500).json({ message: 'Error al solicitar la recuperación.', error });
  }
});

// Restablecer la contraseña
router.post('/password/reset', async (req, res) => {
  const { recoveryCode, newPassword } = req.body;

  try {
    // Encriptar el código de 6 dígitos recibido para compararlo con el guardado en la base de datos
    const hashedRecoveryCode = crypto.createHash('sha256').update(recoveryCode).digest('hex');

    // Buscar al usuario por el código de recuperación y verificar la expiración
    const usuario = await prisma.usuarios.findFirst({
      where: {
        token_recuperacion: hashedRecoveryCode,
        fecha_expiracion_recuperacion: {
          gte: new Date(),
        }
      } 
    });

    if (!usuario) {
      return res.status(400).json({ message: 'Código de recuperación inválido o expirado.' });
    }

    // Encriptar la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Actualizar la contraseña del usuario
    await prisma.usuarios.update({
      where: { id_usuario: usuario.id_usuario },
      data: {
        contrase_a: hashedPassword,
        token_recuperacion: null, // Limpiar el código de recuperación
        fecha_expiracion_recuperacion: null
      }
    });

    res.status(200).json({ message: 'Contraseña actualizada correctamente.' });

  } catch (error) {
    console.error('Error al restablecer la contraseña:', error);
    res.status(500).json({ message: 'Error al restablecer la contraseña.', error });
  }
});


module.exports = router;