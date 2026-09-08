const express = require('express');
const cors = require('cors');

const app = express();
// Usamos una variable de entorno para el puerto o 3000 por defecto
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // Permite peticiones desde el frontend
app.use(express.json()); // Permite interpretar cuerpos JSON en peticiones POST/PUT

const pool = require('./config/db');

// Ruta de prueba (Health check)
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Servidor backend funcionando correctamente.' 
    });
});

// Ruta para verificar la conectividad con PostgreSQL
app.get('/api/health/db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ 
            status: 'ok', 
            message: 'Conexión a la base de datos exitosa', 
            serverTime: result.rows[0].now 
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error', 
            message: 'Error al conectar con la base de datos', 
            error: error.message 
        });
    }
});

// Arrancar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
