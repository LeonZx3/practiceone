// Función para cargar productos (simulando una API)
function cargarProductos() {
    // En una implementación real, esto vendría de una API o base de datos
    const productos = [
        {
            id: 1,
            nombre: "Filtro de Aire",
            precio: 25.99,
            imagen: "images/productos/filtro-aire.jpg",
            stock: 10
        },
        {
            id: 2,
            nombre: "Aceite Motor 5W-30",
            precio: 32.50,
            imagen: "images/productos/aceite-motor.jpg",
            stock: 5
        },
        {
            id: 3,
            nombre: "Pastillas de Freno",
            precio: 45.75,
            imagen: "images/productos/pastillas-freno.jpg",
            stock: 0
        },
        {
            id: 4,
            nombre: "Batería 12V",
            precio: 89.99,
            imagen: "images/productos/bateria.jpg",
            stock: 3
        }
    ];

    return productos;
}

// Función para renderizar productos
function renderizarProductos() {
    const productos = cargarProductos();
    const productosContainer = document.getElementById('productos-container');
    
    if (productosContainer) {
        productosContainer.innerHTML = '';
        
        productos.forEach(producto => {
            const productoHTML = `
                <div class="product-card">
                    <div class="product-image">
                        <img src="${producto.imagen}" alt="${producto.nombre}">
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${producto.nombre}</h3>
                        <p class="product-price">$${producto.precio.toFixed(2)}</p>
                        <span class="product-stock ${producto.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                            ${producto.stock > 0 ? 'Disponible' : 'AGOTADO'}
                        </span>
                        <button class="btn add-to-cart" data-id="${producto.id}" ${producto.stock <= 0 ? 'disabled' : ''}>
                            ${producto.stock > 0 ? 'Añadir al carrito' : 'Agotado'}
                        </button>
                    </div>
                </div>
            `;
            
            productosContainer.innerHTML += productoHTML;
        });
    }
}

// Inicialización cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    renderizarProductos();
    
    // Aquí puedes añadir más inicializaciones si es necesario
});