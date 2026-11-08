const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(cors()); // Permite que tu HTML (frontend) se conecte con este servidor
app.use(express.json());

// Configuración de tu base de datos SQL Server
const dbConfig = {
    user: 'denzel',      
    password: 'Cazaputas42', 
    server: 'localhost',     
    database: 'LicoreriaDonCharles',
    options: {
        encrypt: false, 
        trustServerCertificate: true 
    }
};

// ==========================================
// RUTAS DE LICORES
// ==========================================
app.get('/api/licores', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request().query('SELECT * FROM Licores');
        res.json(result.recordset);
    } catch (err) {
        console.error("Error en la base de datos:", err);
        res.status(500).send("Error al obtener los licores");
    }
});

app.post('/api/admin/licores', async (req, res) => {
    const { nombre, categoria, precio, volumen, grado, stock, descripcion, imagenUrl } = req.body;
    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('nombre', sql.NVarChar, nombre)
            .input('categoria', sql.NVarChar, categoria)
            .input('precio', sql.Decimal(10, 2), precio)
            .input('volumen', sql.Int, volumen || 0)
            .input('grado', sql.Decimal(5, 2), grado || 0)
            .input('stock', sql.Int, stock || 0)
            .input('descripcion', sql.NVarChar, descripcion || '')
            .input('imagenUrl', sql.NVarChar, imagenUrl || '')
            .query(`
                INSERT INTO Licores (Nombre, Categoria, Precio, Volumen_ml, GradoAlcoholico, Stock, Descripcion, ImagenUrl) 
                VALUES (@nombre, @categoria, @precio, @volumen, @grado, @stock, @descripcion, @imagenUrl)
            `);
        res.status(201).json({ mensaje: 'Producto creado con éxito' });
    } catch (err) {
        console.error("Error al crear:", err);
        res.status(500).json({ mensaje: 'Error al crear el producto' });
    }
});

app.put('/api/admin/licores/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, categoria, precio, volumen, grado, stock, descripcion, imagenUrl } = req.body;
    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id', sql.Int, id)
            .input('nombre', sql.NVarChar, nombre)
            .input('categoria', sql.NVarChar, categoria)
            .input('precio', sql.Decimal(10, 2), precio)
            .input('volumen', sql.Int, volumen || 0)
            .input('grado', sql.Decimal(5, 2), grado || 0)
            .input('stock', sql.Int, stock || 0)
            .input('descripcion', sql.NVarChar, descripcion || '')
            .input('imagenUrl', sql.NVarChar, imagenUrl || '')
            .query(`
                UPDATE Licores 
                SET Nombre = @nombre, Categoria = @categoria, 
                    Precio = @precio, Volumen_ml = @volumen, GradoAlcoholico = @grado, 
                    Stock = @stock, Descripcion = @descripcion, ImagenUrl = @imagenUrl
                WHERE IdLicor = @id 
            `);
        res.json({ mensaje: 'Producto actualizado' });
    } catch (err) {
        console.error("Error al actualizar:", err);
        res.status(500).json({ mensaje: 'Error al actualizar el producto' });
    }
});

app.delete('/api/admin/licores/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Licores WHERE IdLicor = @id'); 
        res.json({ mensaje: 'Producto dado de baja' });
    } catch (err) {
        console.error("Error al eliminar:", err);
        res.status(500).json({ mensaje: 'Error al eliminar el producto' });
    }
});


// ==========================================
// NUEVAS RUTAS CRUD: USUARIOS (CLIENTES Y TRABAJADORES)
// ==========================================

// LEER todos los usuarios (Sin usar la columna Estado)
app.get('/api/admin/usuarios', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        const result = await pool.request().query("SELECT * FROM Usuarios");
        res.json(result.recordset);
    } catch (err) {
        console.error("Error obteniendo usuarios:", err);
        res.status(500).json({ mensaje: 'Error al obtener usuarios' });
    }
});

// CREAR nuevo usuario desde el panel admin
app.post('/api/admin/usuarios', async (req, res) => {
    const { correo, password, idRol } = req.body;
    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('correo', sql.NVarChar, correo)
            .input('contrasena', sql.NVarChar, password)
            .input('idRol', sql.Int, idRol)
            .query(`
                INSERT INTO Usuarios (Correo, Contrasena, ID_Rol, Fecha_Creacion) 
                VALUES (@correo, @contrasena, @idRol, GETDATE())
            `);
        res.status(201).json({ mensaje: 'Usuario creado' });
    } catch (err) {
        console.error("Error creando usuario:", err);
        res.status(500).json({ mensaje: 'Error al crear usuario' });
    }
});

// EDITAR usuario desde el panel admin
app.put('/api/admin/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    const { correo, idRol } = req.body;
    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id', sql.Int, id)
            .input('correo', sql.NVarChar, correo)
            .input('idRol', sql.Int, idRol)
            .query(`
                UPDATE Usuarios 
                SET Correo = @correo, ID_Rol = @idRol 
                WHERE ID_Usuario = @id
            `);
        res.json({ mensaje: 'Usuario actualizado' });
    } catch (err) {
        console.error("Error actualizando usuario:", err);
        res.status(500).json({ mensaje: 'Error al actualizar usuario' });
    }
});

// ELIMINAR usuario (Borrado definitivo porque no usamos 'Estado')
app.delete('/api/admin/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id', sql.Int, id)
            .query("DELETE FROM Usuarios WHERE ID_Usuario = @id");
        res.json({ mensaje: 'Usuario eliminado' });
    } catch (err) {
        console.error("Error eliminando usuario:", err);
        res.status(500).json({ mensaje: 'Error al eliminar usuario' });
    }
});


// ==========================================
// AUTENTICACIÓN (LOGIN Y REGISTRO)
// ==========================================
// Ruta para registrar un nuevo cliente
app.post('/api/registro', async (req, res) => {
    // Ahora extraemos también la dirección del cuerpo de la petición
    const { correo, password, direccion } = req.body; 

    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('correo', sql.NVarChar, correo)
            .input('contrasena', sql.NVarChar, password)
            .input('direccion', sql.NVarChar, direccion)
            // ID_Rol = 5 corresponde al Cliente
            .query(`
                INSERT INTO Usuarios (Correo, Contrasena, ID_Rol, Direccion) 
                VALUES (@correo, @contrasena, 5, @direccion)
            `);
        res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ error: 'Error al registrar el usuario' });
    }
});

app.post('/api/login', async (req, res) => {
    const { correo, password } = req.body;
    try {
        let pool = await sql.connect(dbConfig);
        
        let result = await pool.request()
            .input('correo', sql.NVarChar, correo)
            .input('contrasena', sql.NVarChar, password)
            .query('SELECT ID_Usuario, Correo, ID_Rol FROM Usuarios WHERE Correo = @correo AND Contrasena = @contrasena');
            
        if (result.recordset.length > 0) {
            res.status(200).json({ 
                mensaje: 'Login exitoso', 
                usuario: result.recordset[0] 
            });
        } else {
            res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' });
        }
    } catch (err) {
        console.error("Error en el login:", err);
        res.status(500).json({ mensaje: 'Error al conectar con la base de datos' });
    }
});

// ==========================================
// RUTAS DE VENTAS (HISTORIAL)
// ==========================================
app.post('/api/ventas', async (req, res) => {
    const { total, idUsuario, carrito } = req.body; // Ahora recibimos el carrito
    try {
        let pool = await sql.connect(dbConfig);
        
        // 1. Registrar la venta
        await pool.request()
            .input('total', sql.Decimal(10, 2), total)
            .input('idUsuario', sql.Int, idUsuario)
            .query('INSERT INTO Ventas (Total, ID_Usuario) VALUES (@total, @idUsuario)');

        // 2. Descontar el stock de cada producto vendido
        if (carrito && carrito.length > 0) {
            for (let item of carrito) {
                await pool.request()
                    .input('cantidad', sql.Int, item.cantidad)
                    .input('id', sql.Int, item.IdLicor)
                    .query('UPDATE Licores SET Stock = Stock - @cantidad WHERE IdLicor = @id');
            }
        }

        res.status(201).json({ mensaje: 'Venta registrada y stock actualizado' });
    } catch (err) {
        console.error("Error al registrar venta:", err);
        res.status(500).json({ mensaje: 'Error al registrar la venta' });
    }
});

app.get('/api/ventas', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        // Hacemos un JOIN para obtener el correo del trabajador en lugar de solo su ID
        const result = await pool.request().query(`
            SELECT v.IdVenta, v.Total, v.Fecha, u.Correo as Trabajador 
            FROM Ventas v
            INNER JOIN Usuarios u ON v.ID_Usuario = u.ID_Usuario
            ORDER BY v.Fecha DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error("Error al obtener historial:", err);
        res.status(500).json({ mensaje: 'Error al obtener historial' });
    }
});

// ==========================================
// RUTAS DE PEDIDOS WEB (CLIENTES)
// ==========================================
// Crear pedido y guardar sus detalles
app.post('/api/pedidos', async (req, res) => {
    const { idCliente, total, carrito } = req.body;
    try {
        let pool = await sql.connect(dbConfig);
        
        // Crear el pedido
        const result = await pool.request()
            .input('idCliente', sql.Int, idCliente)
            .input('total', sql.Decimal(10, 2), total)
            .query(`
                INSERT INTO Pedidos (ID_Cliente, Total, Estado) 
                OUTPUT INSERTED.IdPedido
                VALUES (@idCliente, @total, 'Alistando su pedido')
            `);
            
        const idPedido = result.recordset[0].IdPedido;

        // Descontar stock Y guardar los detalles del pedido
        if (carrito && carrito.length > 0) {
            for (let item of carrito) {
                // Descontar stock
                await pool.request()
                    .input('cantidad', sql.Int, item.cantidad)
                    .input('id', sql.Int, item.IdLicor)
                    .query('UPDATE Licores SET Stock = Stock - @cantidad WHERE IdLicor = @id');
                
                // Guardar en DetallePedidos
                await pool.request()
                    .input('idPedido', sql.Int, idPedido)
                    .input('idLicor', sql.Int, item.IdLicor)
                    .input('cantidad', sql.Int, item.cantidad)
                    .input('precio', sql.Decimal(10, 2), item.Precio)
                    .query('INSERT INTO DetallePedidos (IdPedido, IdLicor, Cantidad, PrecioUnitario) VALUES (@idPedido, @idLicor, @cantidad, @precio)');
            }
        }
        res.status(201).json({ mensaje: 'Pedido creado', idPedido });
    } catch (err) {
        console.error("Error al crear pedido:", err);
        res.status(500).json({ mensaje: 'Error al procesar el pedido' });
    }
});

// Consultar el último pedido activo del cliente
app.get('/api/pedidos/cliente/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT TOP 1 * FROM Pedidos WHERE ID_Cliente = @id ORDER BY Fecha DESC');
            
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).json({ mensaje: 'No hay pedidos recientes' });
        }
    } catch (err) {
        res.status(500).json({ mensaje: 'Error al consultar estado' });
    }
});

// ==========================================
// RUTAS DE TRABAJADOR (PEDIDOS WEB)
// ==========================================
// 1. Trabajador ve pedidos recién creados
app.get('/api/trabajador/pedidos', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        const result = await pool.request().query(`
            SELECT p.*, u.Correo as Cliente 
            FROM Pedidos p
            INNER JOIN Usuarios u ON p.ID_Cliente = u.ID_Usuario
            WHERE p.Estado = 'Alistando su pedido'
            ORDER BY p.Fecha ASC
        `);
        
        const pedidos = result.recordset;
        
        // Buscar los detalles de cada pedido
        for (let pedido of pedidos) {
            const detalles = await pool.request()
                .input('idPedido', sql.Int, pedido.IdPedido)
                .query(`
                    SELECT d.Cantidad, l.Nombre 
                    FROM DetallePedidos d
                    INNER JOIN Licores l ON d.IdLicor = l.IdLicor
                    WHERE d.IdPedido = @idPedido
                `);
            pedido.Detalles = detalles.recordset;
        }
        
        res.json(pedidos);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error al cargar pedidos web' });
    }
});

// 2. Trabajador marca el pedido como empacado y genera el ticket de venta
app.put('/api/trabajador/pedido/:id', async (req, res) => {
    const { id } = req.params; // ID del Pedido
    const { idTrabajador } = req.body; // ID del trabajador que empaqueta

    try {
        let pool = await sql.connect(dbConfig);
        
        // Paso A: Obtener el total del pedido para la venta
        const pedidoResult = await pool.request()
            .input('idPedido', sql.Int, id)
            .query('SELECT Total FROM Pedidos WHERE IdPedido = @idPedido');
            
        if (pedidoResult.recordset.length === 0) {
            return res.status(404).json({ mensaje: 'Pedido no encontrado' });
        }
        const totalPedido = pedidoResult.recordset[0].Total;

        // Paso B: Registrar la venta en la tabla Ventas para el reporte financiero
        await pool.request()
            .input('total', sql.Decimal(10, 2), totalPedido)
            .input('idUsuario', sql.Int, idTrabajador)
            .query('INSERT INTO Ventas (Total, ID_Usuario) VALUES (@total, @idUsuario)');

        // Paso C: Actualizar el estado del pedido para el delivery
        await pool.request()
            .input('id', sql.Int, id)
            .query(`UPDATE Pedidos SET Estado = 'Esperando repartidor' WHERE IdPedido = @id`);
            
        res.json({ mensaje: 'Pedido empacado y venta registrada exitosamente' });
    } catch (err) {
        console.error("Error al procesar pedido web:", err);
        res.status(500).json({ mensaje: 'Error al actualizar pedido' });
    }
});

// ==========================================
// ACTUALIZACIÓN DE RUTA DELIVERY
// ==========================================
// Reemplaza tu ruta /api/delivery/disponibles actual por esta:
app.get('/api/delivery/disponibles', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        const result = await pool.request().query(`
            SELECT p.*, u.Correo as Cliente 
            FROM Pedidos p
            INNER JOIN Usuarios u ON p.ID_Cliente = u.ID_Usuario
            WHERE p.Estado = 'Esperando repartidor' AND p.ID_Delivery IS NULL
            ORDER BY p.Fecha ASC
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error al obtener pedidos' });
    }
});

// ==========================================
// RUTAS PARA EL PANEL DE DELIVERY (REPARTIDOR)
// ==========================================

// 1. Obtener los pedidos relevantes para el delivery
app.get('/api/pedidos/delivery', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query(`
            SELECT IdPedido, ID_Cliente, Total, Estado, ID_Delivery 
            FROM Pedidos 
            WHERE Estado = 'Esperando repartidor' OR Estado = 'En camino'
        `);
        res.json(result.recordset);
    } catch (error) {
        console.error('Error al obtener pedidos de delivery:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 2. Aceptar un pedido (Asigna el ID del delivery y lo pone 'En camino')
app.put('/api/pedidos/:id/aceptar', async (req, res) => {
    const { id } = req.params;
    const { idDelivery } = req.body;

    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('idPedido', sql.Int, id)
            .input('idDelivery', sql.Int, idDelivery)
            .query(`
                UPDATE Pedidos 
                SET ID_Delivery = @idDelivery, Estado = 'En camino' 
                WHERE IdPedido = @idPedido
            `);
        res.json({ message: 'Pedido asignado y en camino' });
    } catch (error) {
        console.error('Error al aceptar el pedido:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 3. Cambiar el estado general de un pedido (Ej: 'Entregado' o 'Cancelado')
app.put('/api/pedidos/:id/estado', async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('idPedido', sql.Int, id)
            .input('estado', sql.NVarChar, estado)
            .query(`
                UPDATE Pedidos 
                SET Estado = @estado 
                WHERE IdPedido = @idPedido
            `);
        res.json({ message: `Pedido actualizado a: ${estado}` });
    } catch (error) {
        console.error('Error al actualizar el estado:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener los detalles de un pedido específico
app.get('/api/pedidos/:id/detalles', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('idPedido', sql.Int, id)
            .query(`
                SELECT 
                    dp.Cantidad, 
                    dp.PrecioUnitario, 
                    l.Nombre AS Producto,
                    u.Correo AS ClienteCorreo
                FROM DetallePedidos dp
                INNER JOIN Licores l ON dp.IdLicor = l.IdLicor
                INNER JOIN Pedidos p ON dp.IdPedido = p.IdPedido
                INNER JOIN Usuarios u ON p.ID_Cliente = u.ID_Usuario
                WHERE dp.IdPedido = @idPedido
            `);
        res.json(result.recordset);
    } catch (error) {
        console.error('Error al obtener detalles del pedido:', error);
        res.status(500).json({ error: 'Error al obtener detalles' });
    }
});

// Encender el servidor en el puerto 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor API corriendo en http://localhost:${PORT}`);
});