const express = require('express');
const cors = require('cors');

const app = express();
// Usamos una variable de entorno para el puerto o 3000 por defecto
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // Permite peticiones desde el frontend
app.use(express.json()); // Permite interpretar cuerpos JSON en peticiones POST/PUT

// Ruta de prueba (Health check)
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Servidor backend funcionando correctamente.' 
    });
});

// Arrancar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
