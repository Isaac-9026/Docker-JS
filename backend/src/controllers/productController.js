const pool = require('../config/db');

// Consulta base con el cálculo dinámico del estado del stock
const BASE_SELECT = `
    SELECT id, nombre, descripcion, categoria, 
           precio::float, stock, stock_minimo, fecha_creacion,
           CASE 
               WHEN stock = 0 THEN 'Agotado'
               WHEN stock <= stock_minimo THEN 'Stock bajo'
               ELSE 'Disponible'
           END AS estado_stock
    FROM productos
`;

// 1. Listar productos (con soporte para búsqueda y filtros)
const getProducts = async (req, res) => {
    try {
        const { search, categoria, estado } = req.query;
        let query = BASE_SELECT + ' WHERE 1=1';
        const params = [];

        // Filtro por búsqueda (nombre o descripción)
        if (search) {
            params.push(`%${search.trim()}%`);
            query += ` AND (nombre ILIKE $${params.length} OR descripcion ILIKE $${params.length})`;
        }

        // Filtro por categoría exacta
        if (categoria) {
            params.push(categoria.trim());
            query += ` AND categoria = $${params.length}`;
        }

        // Filtro por estado del stock
        if (estado) {
            if (estado === 'Agotado') {
                query += ' AND stock = 0';
            } else if (estado === 'Stock bajo') {
                query += ' AND stock <= stock_minimo AND stock > 0';
            } else if (estado === 'Disponible') {
                query += ' AND stock > stock_minimo';
            }
        }

        query += ' ORDER BY id DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ error: 'Error interno del servidor al obtener productos' });
    }
};

// 2. Obtener resumen del inventario
const getProductSummary = async (req, res) => {
    try {
        const query = `
            SELECT 
                COUNT(*)::int AS total_productos,
                COALESCE(SUM(stock), 0)::int AS total_stock,
                COALESCE(SUM(precio * stock), 0)::float AS valor_inventario,
                COUNT(CASE WHEN stock > stock_minimo THEN 1 END)::int AS disponibles,
                COUNT(CASE WHEN stock <= stock_minimo AND stock > 0 THEN 1 END)::int AS stock_bajo,
                COUNT(CASE WHEN stock = 0 THEN 1 END)::int AS agotados
            FROM productos
        `;
        const result = await pool.query(query);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener resumen:', error);
        res.status(500).json({ error: 'Error al obtener el resumen del inventario' });
    }
};

// 3. Obtener lista de categorías únicas
const getCategories = async (req, res) => {
    try {
        const query = 'SELECT DISTINCT categoria FROM productos WHERE categoria IS NOT NULL ORDER BY categoria ASC';
        const result = await pool.query(query);
        const categories = result.rows.map(row => row.categoria);
        res.json(categories);
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({ error: 'Error al obtener las categorías' });
    }
};

// 4. Obtener un producto por ID
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const query = BASE_SELECT + ' WHERE id = $1';
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener producto por ID:', error);
        res.status(500).json({ error: 'Error al obtener el producto' });
    }
};

// 5. Registrar un nuevo producto
const createProduct = async (req, res) => {
    try {
        const { nombre, descripcion, categoria, precio, stock, stock_minimo } = req.body;

        // Validaciones básicas
        if (!nombre || !categoria || precio === undefined || stock === undefined || stock_minimo === undefined) {
            return res.status(400).json({ error: 'Todos los campos obligatorios deben ser completados' });
        }

        if (Number(precio) < 0 || Number(stock) < 0 || Number(stock_minimo) < 0) {
            return res.status(400).json({ error: 'El precio, stock y stock mínimo deben ser mayores o iguales a 0' });
        }

        const insertQuery = `
            INSERT INTO productos (nombre, descripcion, categoria, precio, stock, stock_minimo)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
        `;
        const insertResult = await pool.query(insertQuery, [
            nombre.trim(),
            descripcion ? descripcion.trim() : null,
            categoria.trim(),
            Number(precio),
            parseInt(stock, 10),
            parseInt(stock_minimo, 10)
        ]);

        const newProductId = insertResult.rows[0].id;
        const productResult = await pool.query(BASE_SELECT + ' WHERE id = $1', [newProductId]);

        res.status(201).json(productResult.rows[0]);
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({ error: 'Error al crear el producto' });
    }
};

// 6. Actualizar un producto existente
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, categoria, precio, stock, stock_minimo } = req.body;

        if (!nombre || !categoria || precio === undefined || stock === undefined || stock_minimo === undefined) {
            return res.status(400).json({ error: 'Todos los campos obligatorios deben ser completados' });
        }

        if (Number(precio) < 0 || Number(stock) < 0 || Number(stock_minimo) < 0) {
            return res.status(400).json({ error: 'El precio, stock y stock mínimo deben ser mayores o iguales a 0' });
        }

        const updateQuery = `
            UPDATE productos
            SET nombre = $1, descripcion = $2, categoria = $3, precio = $4, stock = $5, stock_minimo = $6
            WHERE id = $7
            RETURNING id
        `;
        const result = await pool.query(updateQuery, [
            nombre.trim(),
            descripcion ? descripcion.trim() : null,
            categoria.trim(),
            Number(precio),
            parseInt(stock, 10),
            parseInt(stock_minimo, 10),
            id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        const productResult = await pool.query(BASE_SELECT + ' WHERE id = $1', [id]);
        res.json(productResult.rows[0]);
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
};

// 7. Eliminar un producto
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM productos WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json({ message: 'Producto eliminado exitosamente', id: Number(id) });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
};

module.exports = {
    getProducts,
    getProductSummary,
    getCategories,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
