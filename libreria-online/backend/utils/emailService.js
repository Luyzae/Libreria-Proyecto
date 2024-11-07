// backend/utils/emailService.js
const nodemailer = require('nodemailer');

// Cargar las variables de .env
const { EMAIL_USER, EMAIL_PASS } = process.env;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,  // Toma el correo desde .env
    pass: EMAIL_PASS,  // Toma la contraseña desde .env
  },
});

const sendVerificationEmail = (to, token) => {
  const mailOptions = {
    from: EMAIL_USER,
    to,
    subject: 'Verificación de cuenta',
    html: `
      <div style="font-family: Arial, sans-serif; text-align: center; color: #FFFFFF; background-color: #800020; padding: 20px; border-radius: 8px;">
        <h1 style="margin-top: 0;">¡HOLA!</h1>
        <p style="font-size: 16px;">Ingresa el siguiente código para continuar con tu solicitud</p>
        <div style="display: inline-block; padding: 15px 30px; margin: 20px 0; border: 2px solid #FFFFFF; border-radius: 8px; font-size: 32px; font-weight: bold; color: #FFFFFF;">
          ${token}
        </div>
        <p style="color: #FFFFFF; font-size: 14px;">Este código tiene una vigencia de 15 minutos.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

const sendRecoveryEmail = (to, recoveryCode) => {
  const mailOptions = {
    from: EMAIL_USER,
    to,
    subject: 'Recuperación de contraseña',
    html: `
      <div style="font-family: Arial, sans-serif; text-align: center; color: #FFFFFF; background-color: #800020; padding: 20px; border-radius: 8px;">
        <h1 style="margin-top: 0;">¡HOLA!</h1>
        <p style="font-size: 16px;">Ingresa el siguiente código para continuar con tu solicitud</p>
        <div style="display: inline-block; padding: 15px 30px; margin: 20px 0; border: 2px solid #FFFFFF; border-radius: 8px; font-size: 32px; font-weight: bold; color: #FFFFFF;">
          ${recoveryCode}
        </div>
        <p style="color: #FFFFFF; font-size: 14px;">Este código tiene una vigencia de 1 hora.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};


module.exports = { sendVerificationEmail, sendRecoveryEmail };
