
document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos del DOM
    const btnAddProduct = document.getElementById('btn-add-product');
    const modalOverlay = document.getElementById('product-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnCancelModal = document.getElementById('btn-cancel-modal');
    const productForm = document.getElementById('product-form');

    // Funciones del Modal
    const openModal = () => {
        modalOverlay.classList.add('active');
        document.getElementById('modal-title').textContent = 'Registrar Producto';
        productForm.reset();
        document.getElementById('product-id').value = '';
    };

    const closeModal = () => {
        modalOverlay.classList.remove('active');
    };

    // Listeners de eventos
    btnAddProduct.addEventListener('click', openModal);
    btnCloseModal.addEventListener('click', closeModal);
    btnCancelModal.addEventListener('click', closeModal);

    // Cerrar modal al hacer click en el fondo oscuro
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

   
    productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('Formulario enviado');
        closeModal();
    });

});
