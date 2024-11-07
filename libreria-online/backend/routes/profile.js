const express = require('express');
const prisma = require('../prisma'); 
const authenticateToken = require('../middlewares/authenticateToken'); // Middleware de autenticación
const upload = require('../middlewares/uploadImage');  // Importar el middleware de Multer para subida de imágenes

const router = express.Router();

// Obtener el perfil del usuario autenticado
router.get('/perfil', authenticateToken, async (req, res) => {
    try {
        const perfil = await prisma.perfiles_custom.findFirst({
            where: { id_usuario: req.user.id_usuario }, 
        });

        if (!perfil) {
            return res.status(404).json({ message: 'Perfil no encontrado.' });
        }

        res.status(200).json(perfil);
    } catch (error) {
        console.error('Error al obtener el perfil:', error);
        res.status(500).json({ message: 'Error al obtener el perfil.', error });
    }
});

// Crear o actualizar el perfil del usuario autenticado con imagen
router.post('/perfil', authenticateToken, upload.single('foto_perfil'), async (req, res) => {
    const { nombre_perfil, pais, biografia, imagen_fondo, id_tema } = req.body;

    try {
        // Obtener la ruta de la imagen si se subió un archivo
        let foto_perfil = null;
        if (req.file) {
            foto_perfil = req.file.path; // Guardar la ruta del archivo subido
        }

        // Intentar encontrar un perfil existente
        let perfil = await prisma.perfiles_custom.findFirst({
            where: { id_usuario: req.user.id_usuario },
        });

        if (!perfil) {
            // Si no existe, crear uno nuevo
            perfil = await prisma.perfiles_custom.create({
                data: {
                    id_usuario: req.user.id_usuario,
                    nombre_perfil,
                    pais,
                    foto_perfil,  // Guardar la ruta de la imagen
                    biografia,
                    imagen_fondo,
                    id_tema,
                    fecha_modificacion: new Date()
                }
            });
        } else {
            // Si existe, actualizar los campos
            perfil = await prisma.perfiles_custom.update({
                where: { id_perfil: perfil.id_perfil },
                data: {
                    nombre_perfil,
                    pais,
                    foto_perfil,  // Actualizar la ruta de la imagen si se subió una nueva
                    biografia,
                    imagen_fondo,
                    id_tema,
                    fecha_modificacion: new Date()
                }
            });
        }

        res.status(200).json({ message: 'Perfil actualizado correctamente.', perfil });
    } catch (error) {
        console.error('Error al crear/actualizar el perfil:', error);
        res.status(500).json({ message: 'Error al crear/actualizar el perfil.', error });
    }
});

module.exports = router;
