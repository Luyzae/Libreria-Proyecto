-- CreateTable
CREATE TABLE `carrito_compras` (
    `id_carrito` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NULL,
    `id_producto` INTEGER NULL,
    `cantidad` INTEGER NOT NULL,
    `precio_unitario` DECIMAL(10, 2) NULL,
    `cupon` VARCHAR(50) NULL,
    `descuento` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `envio` DECIMAL(10, 2) NULL,
    `fecha_agregado` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `id_estado` INTEGER NULL,

    INDEX `id_estado`(`id_estado`),
    INDEX `id_producto`(`id_producto`),
    INDEX `id_usuario`(`id_usuario`),
    PRIMARY KEY (`id_carrito`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categorias` (
    `id_categoria` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_categoria` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id_categoria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comentarios_libro` (
    `id_comentario` INTEGER NOT NULL AUTO_INCREMENT,
    `id_producto` INTEGER NULL,
    `id_usuario` INTEGER NULL,
    `comentario` TEXT NOT NULL,
    `fecha_comentario` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `id_producto`(`id_producto`),
    INDEX `id_usuario`(`id_usuario`),
    PRIMARY KEY (`id_comentario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comentarios_perfil` (
    `id_comentario` INTEGER NOT NULL AUTO_INCREMENT,
    `id_perfil` INTEGER NULL,
    `id_usuario_autor` INTEGER NULL,
    `comentario` TEXT NOT NULL,
    `fecha_comentario` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `id_perfil`(`id_perfil`),
    INDEX `id_usuario_autor`(`id_usuario_autor`),
    PRIMARY KEY (`id_comentario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `estados_pedidos` (
    `id_estado` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_estado` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id_estado`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `facturacion_cliente` (
    `id_facturacion` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NULL,
    `rut_run` VARCHAR(20) NOT NULL,
    `nombre` VARCHAR(255) NOT NULL,
    `apellidos` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `telefono` VARCHAR(20) NOT NULL,
    `direccion_facturacion` VARCHAR(255) NOT NULL,
    `comuna` VARCHAR(50) NULL,

    INDEX `id_usuario`(`id_usuario`),
    PRIMARY KEY (`id_facturacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pedidos` (
    `id_pedido` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NULL,
    `id_facturacion` INTEGER NULL,
    `total` DECIMAL(10, 2) NULL,
    `fecha_pedido` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `estado` VARCHAR(50) NULL DEFAULT 'pendiente',
    `metodo_pago` VARCHAR(50) NULL,

    INDEX `id_facturacion`(`id_facturacion`),
    INDEX `id_usuario`(`id_usuario`),
    PRIMARY KEY (`id_pedido`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `perfiles_custom` (
    `id_perfil` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NULL,
    `nombre_perfil` VARCHAR(255) NULL,
    `pais` VARCHAR(100) NULL,
    `foto_perfil` VARCHAR(255) NULL,
    `biografia` VARCHAR(500) NULL,
    `imagen_fondo` VARCHAR(255) NULL,
    `id_tema` INTEGER NULL,
    `fecha_modificacion` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `id_tema`(`id_tema`),
    INDEX `id_usuario`(`id_usuario`),
    PRIMARY KEY (`id_perfil`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `productos` (
    `id_producto` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(255) NOT NULL,
    `autor` VARCHAR(255) NOT NULL,
    `editorial` VARCHAR(255) NULL,
    `isbn` VARCHAR(20) NULL,
    `precio` DECIMAL(10, 2) NOT NULL,
    `stock` INTEGER NOT NULL,
    `descripcion` TEXT NULL,
    `id_categoria` INTEGER NULL,
    `imagen_portada` VARCHAR(255) NULL,
    `peso` DECIMAL(5, 2) NULL,
    `dimensiones` VARCHAR(50) NULL,
    `idioma` VARCHAR(100) NULL,
    `anio_edicion` YEAR NULL,
    `fecha_publicacion` DATE NULL,
    `fecha_registro` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `isbn`(`isbn`),
    INDEX `id_categoria`(`id_categoria`),
    PRIMARY KEY (`id_producto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `temas_colores` (
    `id_tema` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_tema` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id_tema`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `id_usuario` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(255) NOT NULL,
    `email_telefono` VARCHAR(255) NOT NULL,
    `contraseña` VARCHAR(255) NOT NULL,
    `verificado` BOOLEAN NULL DEFAULT false,
    `token_verificacion` VARCHAR(255) NULL,
    `fecha_expiracion_token` TIMESTAMP(0) NULL DEFAULT (now() + interval 1 day),
    `fecha_registro` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `token_recuperacion` VARCHAR(255) NULL,
    `fecha_expiracion_recuperacion` TIMESTAMP(0) NULL,

    UNIQUE INDEX `email_telefono`(`email_telefono`),
    PRIMARY KEY (`id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refresh_tokens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expiracion` DATETIME(3) NOT NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,

    UNIQUE INDEX `refresh_tokens_token_key`(`token`),
    INDEX `refresh_tokens_id_usuario_idx`(`id_usuario`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `carrito_compras` ADD CONSTRAINT `carrito_compras_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `carrito_compras` ADD CONSTRAINT `carrito_compras_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos`(`id_producto`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `carrito_compras` ADD CONSTRAINT `carrito_compras_ibfk_3` FOREIGN KEY (`id_estado`) REFERENCES `estados_pedidos`(`id_estado`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `comentarios_libro` ADD CONSTRAINT `comentarios_libro_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `productos`(`id_producto`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `comentarios_libro` ADD CONSTRAINT `comentarios_libro_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `comentarios_perfil` ADD CONSTRAINT `comentarios_perfil_ibfk_1` FOREIGN KEY (`id_perfil`) REFERENCES `perfiles_custom`(`id_perfil`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `comentarios_perfil` ADD CONSTRAINT `comentarios_perfil_ibfk_2` FOREIGN KEY (`id_usuario_autor`) REFERENCES `usuarios`(`id_usuario`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `facturacion_cliente` ADD CONSTRAINT `facturacion_cliente_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pedidos` ADD CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pedidos` ADD CONSTRAINT `pedidos_ibfk_2` FOREIGN KEY (`id_facturacion`) REFERENCES `facturacion_cliente`(`id_facturacion`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `perfiles_custom` ADD CONSTRAINT `perfiles_custom_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `perfiles_custom` ADD CONSTRAINT `perfiles_custom_ibfk_2` FOREIGN KEY (`id_tema`) REFERENCES `temas_colores`(`id_tema`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `productos` ADD CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categorias`(`id_categoria`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;
