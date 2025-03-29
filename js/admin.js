// admin.js - Panel de administración para gestionar stock
document.addEventListener('DOMContentLoaded', function() {
    // Crear elementos del panel admin
    const adminToggleBtn = document.createElement('button');
    adminToggleBtn.id = 'admin-toggle';
    adminToggleBtn.className = 'admin-toggle-btn';
    adminToggleBtn.textContent = 'Modo Admin';
    document.body.appendChild(adminToggleBtn);

    const adminPanel = document.createElement('div');
    adminPanel.id = 'admin-panel';
    adminPanel.className = 'admin-panel';
    adminPanel.innerHTML = `
        <h3>Panel de Administración</h3>
        <div class="admin-controls">
            <button id="refresh-products">Actualizar Lista</button>
        </div>
        <div class="admin-products-list"></div>
    `;
    document.body.appendChild(adminPanel);

    // Variables de estado
    let isAdminMode = false;

    // Event listeners
    adminToggleBtn.addEventListener('click', toggleAdminMode);
    document.getElementById('refresh-products').addEventListener('click', loadAdminProducts);

    // Funciones principales
    function toggleAdminMode() {
        isAdminMode = !isAdminMode;
        adminPanel.style.display = isAdminMode ? 'block' : 'none';
        adminToggleBtn.textContent = isAdminMode ? 'Salir de Admin' : 'Modo Admin';
        adminToggleBtn.style.backgroundColor = isAdminMode ? '#e53935' : 'var(--dark-blue)';
        
        if (isAdminMode) {
            loadAdminProducts();
        }
    }

    function loadAdminProducts() {
        const productsList = document.querySelector('.admin-products-list');
        productsList.innerHTML = '';

        const productos = cargarProductos();
        
        productos.forEach(producto => {
            const productItem = document.createElement('div');
            productItem.className = 'admin-product-item';
            productItem.innerHTML = `
                <img src="${producto.imagen || 'images/default-product.jpg'}" alt="${producto.nombre}">
                <div class="admin-product-info">
                    <h4>${producto.nombre}</h4>
                    <p>Precio: $${producto.precio.toFixed(2)} | ID: ${producto.id}</p>
                </div>
                <div class="admin-product-controls">
                    <span>Stock:</span>
                    <input type="number" value="${producto.stock}" id="stock-${producto.id}" min="0">
                    <button class="save-btn" data-id="${producto.id}">Guardar</button>
                </div>
            `;
            productsList.appendChild(productItem);
        });

        // Event listeners para los botones de guardar
        document.querySelectorAll('.save-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                saveProductStock(productId);
            });
        });
    }

    function saveProductStock(productId) {
        const newStock = parseInt(document.getElementById(`stock-${productId}`).value);
        
        if (isNaN(newStock)) {
            showNotification('Por favor ingrese un número válido');
            return;
        }

        const productos = cargarProductos();
        const productoIndex = productos.findIndex(p => p.id === productId);

        if (productoIndex !== -1) {
            // Actualizar el stock
            productos[productoIndex].stock = newStock;
            
            // Guardar en localStorage (usando la misma clave que carrito.js)
            localStorage.setItem('productos', JSON.stringify(productos));
            
            // Mostrar notificación
            showNotification('Stock actualizado correctamente');
            
            // Actualizar la vista de productos
            if (typeof renderizarProductos === 'function') {
                renderizarProductos(productos);
            }
            
            // Actualizar el carrito por si algún producto ya no está disponible
            if (typeof actualizarCarrito === 'function') {
                actualizarCarrito();
            }
        }
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'admin-notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Función para renderizar productos (similar a la que necesitas en carrito.js)
    function renderizarProductos(productos) {
        const productsContainer = document.getElementById('productos-container');
        if (!productsContainer) return;
        
        productsContainer.innerHTML = productos.map(producto => `
            <div class="product-card" data-id="${producto.id}">
                <img src="${producto.imagen || 'images/default-product.jpg'}" alt="${producto.nombre}">
                <span class="stock-badge ${producto.stock <= 0 ? 'out-of-stock' : ''}">
                    ${producto.stock <= 0 ? 'AGOTADO' : `Stock: ${producto.stock}`}
                </span>
                <h3>${producto.nombre}</h3>
                <p class="product-price">$${producto.precio.toFixed(2)}</p>
                <button class="btn add-to-cart" data-id="${producto.id}" ${producto.stock <= 0 ? 'disabled' : ''}>
                    ${producto.stock <= 0 ? 'Agotado' : 'Añadir al carrito'}
                </button>
            </div>
        `).join('');
    }

    // Cargar productos iniciales si no existen
    if (!localStorage.getItem('productos')) {
        const productosIniciales = [
            { id: 1, nombre: 'Aire Acondicionado 12,000 BTU', precio: 1200, stock: 5, imagen: 'images/aire-1.jpg' },
            { id: 2, nombre: 'Aire Acondicionado 18,000 BTU', precio: 1800, stock: 3, imagen: 'images/aire-2.jpg' },
            { id: 3, nombre: 'Ventilador Industrial', precio: 350, stock: 8, imagen: 'images/ventilador-1.jpg' },
            { id: 4, nombre: 'Purificador de Aire', precio: 450, stock: 0, imagen: 'images/purificador-1.jpg' }
        ];
        localStorage.setItem('productos', JSON.stringify(productosIniciales));
    }
});