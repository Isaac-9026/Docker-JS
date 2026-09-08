const API_URL = 'http://localhost:3000/api/products';

document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos del DOM
    const btnAddProduct = document.getElementById('btn-add-product');
    const modalOverlay = document.getElementById('product-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnCancelModal = document.getElementById('btn-cancel-modal');
    const productForm = document.getElementById('product-form');
    const tableBody = document.getElementById('products-table-body');
    
    // Filtros y Búsqueda
    const searchInput = document.getElementById('search-input');
    const filterCategory = document.getElementById('filter-category');
    const filterStatus = document.getElementById('filter-status');
    const categoryDatalist = document.getElementById('category-list');

    // Tarjetas de Resumen
    const sumTotal = document.getElementById('summary-total');
    const sumDisponibles = document.getElementById('summary-disponibles');
    const sumBajo = document.getElementById('summary-bajo');
    const sumAgotados = document.getElementById('summary-agotados');

    // Estado global de productos
    let products = [];

    // --- FUNCIONES DE LA API ---

    // 1. Obtener productos de la base de datos
    const fetchProducts = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Error al conectar con la API');
            products = await response.json();
            
            populateCategories();
            applyFilters();
            updateSummary();
        } catch (error) {
            console.error('Error:', error);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center" style="color: var(--status-danger); padding: 2rem;">
                        <i class="fa-solid fa-triangle-exclamation" style="font-size: 1.5rem; margin-bottom: 0.5rem; display: block;"></i>
                        No se pudo conectar con el servidor backend (<code>${API_URL}</code>).<br>
                        <small>Asegúrate de que el backend esté corriendo con <code>npm start</code> en la carpeta <code>backend</code>.</small>
                    </td>
                </tr>
            `;
        }
    };

    // 2. Guardar producto (Crear o Actualizar)
    const saveProduct = async (productData, id) => {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/${id}` : API_URL;

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
            if (!response.ok) throw new Error('Error al guardar el producto');
            await fetchProducts();
            closeModal();
        } catch (error) {
            console.error('Error:', error);
            alert('Hubo un error al guardar el producto.');
        }
    };

    // 3. Eliminar producto
    window.deleteProduct = async (id) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;
        try {
            const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Error al eliminar');
            await fetchProducts();
        } catch (error) {
            console.error('Error:', error);
            alert('No se pudo eliminar el producto');
        }
    };

    // 4. Preparar edición en el modal
    window.editProduct = (id) => {
        const product = products.find(p => p.id === id);
        if (!product) return;

        document.getElementById('product-id').value = product.id;
        document.getElementById('nombre').value = product.nombre;
        document.getElementById('descripcion').value = product.descripcion || '';
        document.getElementById('categoria').value = product.categoria;
        document.getElementById('precio').value = product.precio;
        document.getElementById('stock').value = product.stock;
        document.getElementById('stock_minimo').value = product.stock_minimo;

        document.getElementById('modal-title').textContent = 'Editar Producto';
        modalOverlay.classList.add('active');
    };

    // --- FILTROS Y BÚSQUEDA DINÁMICA ---

    const populateCategories = () => {
        const categories = [...new Set(products.map(p => p.categoria).filter(Boolean))];
        
        // Guardar valor actual seleccionado para no perderlo
        const currentSelected = filterCategory.value;
        
        // Llenar el select de filtros
        filterCategory.innerHTML = '<option value="">Todas las categorías</option>';
        categories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            filterCategory.appendChild(opt);
        });
        filterCategory.value = currentSelected;

        // Llenar el datalist del formulario modal
        if (categoryDatalist) {
            categoryDatalist.innerHTML = '';
            categories.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat;
                categoryDatalist.appendChild(opt);
            });
        }
    };

    const applyFilters = () => {
        const searchTerm = (searchInput.value || '').toLowerCase().trim();
        const selectedCat = filterCategory.value;
        const selectedStatus = filterStatus.value;

        const filtered = products.filter(p => {
            const matchSearch = 
                p.nombre.toLowerCase().includes(searchTerm) ||
                (p.descripcion && p.descripcion.toLowerCase().includes(searchTerm)) ||
                p.categoria.toLowerCase().includes(searchTerm);
            
            const matchCategory = !selectedCat || p.categoria === selectedCat;
            const matchStatus = !selectedStatus || p.estado_stock === selectedStatus;

            return matchSearch && matchCategory && matchStatus;
        });

        renderTable(filtered);
    };

    // Listeners de búsqueda y filtrado en tiempo real
    searchInput.addEventListener('input', applyFilters);
    filterCategory.addEventListener('change', applyFilters);
    filterStatus.addEventListener('change', applyFilters);

    // --- RENDERIZADO DE LA TABLA ---

    const renderTable = (itemsToRender = products) => {
        tableBody.innerHTML = '';

        if (itemsToRender.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center" style="padding: 2.5rem; color: var(--text-muted);">
                        <i class="fa-solid fa-folder-open" style="font-size: 2rem; margin-bottom: 0.5rem; display: block; opacity: 0.5;"></i>
                        No se encontraron productos con los filtros seleccionados
                    </td>
                </tr>
            `;
            return;
        }

        itemsToRender.forEach(p => {
            const tr = document.createElement('tr');
            
            let badgeClass = 'success';
            if (p.estado_stock === 'Stock bajo') badgeClass = 'warning';
            if (p.estado_stock === 'Agotado') badgeClass = 'danger';

            tr.innerHTML = `
                <td style="font-weight: 600; color: var(--text-muted);">#${p.id}</td>
                <td>
                    <div style="font-weight: 600; color: var(--text-main);">${p.nombre}</div>
                    <small style="color: var(--text-muted); font-size: 0.8rem;">${p.descripcion || 'Sin descripción'}</small>
                </td>
                <td><span style="background: var(--bg-body); padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.85rem; border: 1px solid var(--border-color);">${p.categoria}</span></td>
                <td style="font-weight: 600;">$${Number(p.precio).toFixed(2)}</td>
                <td>
                    <span style="font-weight: 600;">${p.stock}</span>
                    <small style="color: var(--text-muted); font-size: 0.75rem;">(mín: ${p.stock_minimo})</small>
                </td>
                <td><span class="badge ${badgeClass}">${p.estado_stock}</span></td>
                <td>
                    <button class="btn-icon" onclick="editProduct(${p.id})" title="Editar">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="deleteProduct(${p.id})" title="Eliminar">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    };

    // Actualizar métricas del resumen superior
    const updateSummary = () => {
        const total = products.length;
        const disponibles = products.filter(p => p.estado_stock === 'Disponible').length;
        const bajo = products.filter(p => p.estado_stock === 'Stock bajo').length;
        const agotados = products.filter(p => p.estado_stock === 'Agotado').length;

        sumTotal.textContent = total;
        sumDisponibles.textContent = disponibles;
        sumBajo.textContent = bajo;
        sumAgotados.textContent = agotados;
    };

    // --- MODAL EVENTOS ---
    const openModal = () => {
        modalOverlay.classList.add('active');
        document.getElementById('modal-title').textContent = 'Registrar Producto';
        productForm.reset();
        document.getElementById('product-id').value = '';
    };

    const closeModal = () => {
        modalOverlay.classList.remove('active');
    };

    btnAddProduct.addEventListener('click', openModal);
    btnCloseModal.addEventListener('click', closeModal);
    btnCancelModal.addEventListener('click', closeModal);

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    // Envío del Formulario (Crear o Editar)
    productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const id = document.getElementById('product-id').value;
        const productData = {
            nombre: document.getElementById('nombre').value,
            descripcion: document.getElementById('descripcion').value,
            categoria: document.getElementById('categoria').value,
            precio: parseFloat(document.getElementById('precio').value),
            stock: parseInt(document.getElementById('stock').value),
            stock_minimo: parseInt(document.getElementById('stock_minimo').value)
        };

        saveProduct(productData, id);
    });

    // Iniciar carga de datos
    fetchProducts();
});
