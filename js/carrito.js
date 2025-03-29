// Carrito de compras
let carrito = [];

// Constantes
const WHATSAPP_NUMBER = '931574267';

// Elementos del DOM
const cartToggle = document.getElementById('cart-toggle');
const cartOverlay = document.getElementById('cart-overlay');
const closeCart = document.getElementById('close-cart');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartCount = document.getElementById('cart-count');
const checkoutWhatsApp = document.getElementById('checkout-whatsapp');

// Crear notificación
const notification = document.createElement('div');
notification.className = 'cart-notification';
document.body.appendChild(notification);

// Crear botón vaciar carrito
const emptyCartBtn = document.createElement('button');
emptyCartBtn.id = 'empty-cart';
emptyCartBtn.textContent = 'Vaciar Carrito';
emptyCartBtn.className = 'btn btn-empty';
document.querySelector('.cart-total').insertBefore(emptyCartBtn, checkoutWhatsApp);

// Event listeners
if (cartToggle) cartToggle.addEventListener('click', toggleCart);
if (closeCart) closeCart.addEventListener('click', toggleCart);
if (checkoutWhatsApp) checkoutWhatsApp.addEventListener('click', enviarPedidoWhatsApp);
emptyCartBtn.addEventListener('click', vaciarCarrito);

// Delegación de eventos
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('add-to-cart')) {
        const productId = parseInt(e.target.getAttribute('data-id'));
        agregarAlCarrito(productId);
    }
    
    if (e.target.classList.contains('remove-item')) {
        const productId = parseInt(e.target.getAttribute('data-id'));
        eliminarDelCarrito(productId);
    }
});

// Mostrar notificación
function mostrarNotificacion(mensaje, tipo = 'success') {
    notification.textContent = mensaje;
    notification.className = 'cart-notification';
    notification.classList.add(tipo === 'error' ? 'error' : 'success');
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

// Vaciar carrito
function vaciarCarrito() {
    if (carrito.length === 0) {
        mostrarNotificacion('El carrito ya está vacío', 'error');
        return;
    }
    
    if (confirm('¿Estás seguro de que quieres vaciar todo el carrito?')) {
        carrito = [];
        actualizarCarrito();
        renderizarCarrito();
        actualizarBotonesAgregar();
        mostrarNotificacion('Carrito vaciado');
    }
}

// Toggle carrito
function toggleCart() {
    cartOverlay.style.display = cartOverlay.style.display === 'flex' ? 'none' : 'flex';
    if (cartOverlay.style.display === 'flex') {
        renderizarCarrito();
    }
}

// Agregar al carrito
function agregarAlCarrito(productId) {
    const productos = cargarProductos();
    const producto = productos.find(p => p.id === productId);
    
    if (!producto) return;

    if (producto.stock <= 0) {
        mostrarNotificacion('¡Producto agotado!', 'error');
        return;
    }

    const itemExistente = carrito.find(item => item.id === productId);
    
    if (itemExistente) {
        if (itemExistente.cantidad < producto.stock) {
            itemExistente.cantidad++;
            mostrarNotificacion(`+1 ${producto.nombre}`);
        } else {
            mostrarNotificacion('¡Stock agotado!', 'error');
            return;
        }
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: 1,
            imagen: producto.imagen
        });
        mostrarNotificacion(`${producto.nombre} añadido`);
    }
    
    actualizarCarrito();
    renderizarCarrito();
    actualizarBotonesAgregar();
}

// Eliminar del carrito
function eliminarDelCarrito(productId) {
    const producto = carrito.find(item => item.id === productId);
    if (!producto) return;

    carrito = carrito.filter(item => item.id !== productId);
    actualizarCarrito();
    renderizarCarrito();
    actualizarBotonesAgregar();
    mostrarNotificacion(`${producto.nombre} eliminado`);
}

// Actualizar carrito
function actualizarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    cartCount.textContent = totalItems;
}

// Actualizar botones "Añadir al carrito"
function actualizarBotonesAgregar() {
    const productos = cargarProductos();
    const botones = document.querySelectorAll('.add-to-cart');
    
    botones.forEach(boton => {
        const productId = parseInt(boton.getAttribute('data-id'));
        const producto = productos.find(p => p.id === productId);
        
        if (producto && producto.stock <= 0) {
            boton.disabled = true;
            boton.textContent = 'Sin stock';
            boton.classList.add('out-of-stock');
        }
    });
}

// Renderizar carrito
function renderizarCarrito() {
    if (!cartItems) return;

    cartItems.innerHTML = '';
    
    if (carrito.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
        cartTotal.textContent = '$0.00';
        emptyCartBtn.style.display = 'none';
        return;
    }

    emptyCartBtn.style.display = 'block';
    const fragment = document.createDocumentFragment();
    let total = 0;

    carrito.forEach(item => {
        const productos = cargarProductos();
        const producto = productos.find(p => p.id === item.id);
        const sinStock = producto && producto.stock <= 0;

        const subtotal = item.precio * item.cantidad;
        total += subtotal;

        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        if (sinStock) {
            itemElement.classList.add('out-of-stock');
        }
        
        // Dentro de la función renderizarCarrito(), cambia esto:
        itemElement.innerHTML = `
        <div class="cart-item-img-container">
            <img src="${item.imagen || 'images/default-product.jpg'}" alt="${item.nombre}">
        </div>
        <div class="cart-item-info">
            <h4 class="cart-item-title">${item.nombre} ${sinStock ? '<span class="stock-label">(Agotado)</span>' : ''}</h4>
            <p class="cart-item-price">$${item.precio.toFixed(2)} x ${item.cantidad} = $${subtotal.toFixed(2)}</p>
        </div>
        <button class="cart-item-remove remove-item" data-id="${item.id}" aria-label="Eliminar producto">
            <i class="fas fa-trash"></i>
        </button>
        `;
        fragment.appendChild(itemElement);
    });

    cartItems.appendChild(fragment);
    cartTotal.textContent = `$${total.toFixed(2)}`;
}

// Enviar pedido por WhatsApp - Versión mejorada para conversaciones nuevas
function enviarPedidoWhatsApp() {
    if (carrito.length === 0) {
        mostrarNotificacion('El carrito está vacío', 'error');
        return;
    }
    
    // Crear mensaje estructurado
    let mensaje = '¡Hola! Quiero hacer un pedido:\n\n';
    mensaje += '📋 *Detalle del Pedido:*\n';
    mensaje += '────────────────\n';
    
    carrito.forEach(item => {
        mensaje += `➡ ${item.nombre}\n`;
        mensaje += `   Cantidad: ${item.cantidad}\n`;
        mensaje += `   Precio unitario: $${item.precio.toFixed(2)}\n`;
        mensaje += `   Subtotal: $${(item.cantidad * item.precio).toFixed(2)}\n\n`;
    });

    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    mensaje += '────────────────\n';
    mensaje += `💰 *Total a pagar:* $${total.toFixed(2)}\n\n`;
    mensaje += 'Por favor, confirmen disponibilidad y forma de pago. ¡Gracias!';
    
    // Opción 1: Intentar abrir WhatsApp normalmente
    const urlNormal = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
    
    // Opción 2: URL alternativa para web
    const urlWeb = `https://web.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(mensaje)}`;
    
    // Primero intentamos con la versión normal
    const ventanaWhatsApp = window.open(urlNormal, '_blank');
    
    // Si falla (se cierra inmediatamente), intentamos con la versión web
    setTimeout(() => {
        if (!ventanaWhatsApp || ventanaWhatsApp.closed) {
            const ventanaWeb = window.open(urlWeb, '_blank');
            
            // Si ambas fallan, mostramos instrucciones
            if (!ventanaWeb || ventanaWeb.closed) {
                mostrarNotificacion('Por favor copia el mensaje y envíalo manualmente', 'error');
                copiarAlPortapapeles(mensaje);
            }
        }
    }, 500);
}

// Función auxiliar para copiar al portapapeles
function copiarAlPortapapeles(texto) {
    const textarea = document.createElement('textarea');
    textarea.value = texto;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    
    mostrarNotificacion('Mensaje copiado al portapapeles', 'success');
}

// Cargar carrito al iniciar
document.addEventListener('DOMContentLoaded', function() {
    try {
        const carritoGuardado = localStorage.getItem('carrito');
        if (carritoGuardado) {
            carrito = JSON.parse(carritoGuardado) || [];
            actualizarCarrito();
        }
        actualizarBotonesAgregar();
    } catch (e) {
        console.error('Error al cargar el carrito:', e);
        localStorage.removeItem('carrito');
        carrito = [];
    }
});

// Función para cargar productos (debes implementarla según tu sistema)
function cargarProductos() {
    return [
        { id: 1, nombre: 'Motor de nevera', precio: 130, stock: 3, imagen: 'images/filtro-aire.png' },
        { id: 2, nombre: 'Motor de lavadora', precio: 85, stock: 5, imagen: 'images/lavador.png' },
        { id: 3, nombre: 'Turbina de aire', precio: 70, stock: 5, imagen: 'images/turbina.jpeg' },
        { id: 4, nombre: 'Capacitor', precio: 20, stock: 5, imagen: 'images/capacitor.png' },
        { id: 5, nombre: 'Aspa de Ventilador', precio: 5, stock: 5, imagen: 'images/aspa.jpg' }
    ];
}