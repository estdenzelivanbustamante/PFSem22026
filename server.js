const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(cors()); // Permite que tu HTML (frontend) se conecte con este servidor

// Configuración de tu base de datos SQL Server
const dbConfig = {
    user: 'denzel',       // Ej: 'sa'
    password: 'caza putas 42', // Tu contraseña de SQL Server
    server: 'localhost',      // O 'localhost\\SQLEXPRESS' si usas esa versión
    database: 'LicoreriaDonCharles',
    options: {
        encrypt: false, // Ponlo en true si usas Azure
        trustServerCertificate: true 
    }
};

// Crear la "ruta" que tu página web va a consultar
app.get('/api/licores', async (req, res) => {
    try {
        // Conectar a la base de datos
        let pool = await sql.connect(dbConfig);
        // Pedir los licores
        let result = await pool.request().query('SELECT * FROM Licores');
        // Enviar los licores a la página web en formato JSON
        res.json(result.recordset);
    } catch (err) {
        console.error("Error en la base de datos:", err);
        res.status(500).send("Error al obtener los licores");
    }
});

// Encender el servidor en el puerto 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor API corriendo en http://localhost:${PORT}`);
});