const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Rutas especiales (deben ir antes de /:id para evitar colisiones)
router.get('/summary', productController.getProductSummary);
router.get('/categories', productController.getCategories);

// Rutas CRUD principales
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
