const { Pool } = require('pg');
require('dotenv').config();

// Creamos un grupo (pool) de conexiones reutilizables
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'inventory_db',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
});

// Evento para verificar conexión exitosa
pool.on('connect', () => {
    console.log('Conexión establecida con la base de datos PostgreSQL');
});

// Evento para capturar errores inesperados en clientes inactivos
pool.on('error', (err) => {
    console.error('Error inesperado en el cliente de PostgreSQL:', err);
    process.exit(-1);
});

module.exports = pool;
