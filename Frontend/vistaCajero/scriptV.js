document.addEventListener('DOMContentLoaded', function () {
    // Variables de estado
    let ordenesPendientes = [];
    let ordenesCompletadas = [];
    let ordenActual = null;
    let productos = [
        { id: 1, nombre: 'Hamburguesa Clásica', precio: 12.99, categoria: 'ALIMENTOS' },
        { id: 2, nombre: 'Hamburguesa Doble', precio: 15.99, categoria: 'ALIMENTOS' },
        { id: 3, nombre: 'Hamburguesa BBQ', precio: 14.50, categoria: 'ALIMENTOS' },
        { id: 4, nombre: 'Hamburguesa Veggie', precio: 11.99, categoria: 'ALIMENTOS' },
        { id: 5, nombre: 'Hamburguesa Picante', precio: 13.75, categoria: 'ALIMENTOS' },
        { id: 6, nombre: 'Hamburguesa Gourmet', precio: 18.99, categoria: 'ALIMENTOS' },
        { id: 7, nombre: 'Hamburguesa de Pollo', precio: 12.50, categoria: 'ALIMENTOS' },
        { id: 8, nombre: 'Papas Fritas', precio: 4.99, categoria: 'SNACK' },
        { id: 9, nombre: 'Aros de Cebolla', precio: 5.50, categoria: 'SNACK' },
        { id: 10, nombre: 'Nuggets de Pollo', precio: 6.99, categoria: 'SNACK' },
        { id: 11, nombre: 'Refresco', precio: 3.50, categoria: 'BEBIDAS' },
        { id: 12, nombre: 'Agua Mineral', precio: 2.50, categoria: 'BEBIDAS' },
        { id: 13, nombre: 'Jugo Natural', precio: 4.00, categoria: 'BEBIDAS' }
    ];

    // Elementos del DOM
    const seccionCatalogo = document.querySelector('.seccion-catalogo');
    const seccionDetallesOrden = document.querySelector('.detalles-orden');
    const ventanaOrdenes = document.querySelector('.ventana-ordenes');
    const listaProductos = document.getElementById('lista-productos');
    const totalPrecio = document.getElementById('total-precio');
    const botonesCategoria = document.querySelectorAll('.buttons-categoria');
    const contenidoOrdenes = document.querySelector('.ventana-ordenes .contenido');

    mostrarVentanaOrdenes();
    cargarProductos('ALIMENTOS');

    botonesCategoria.forEach(boton => {
        boton.addEventListener('click', function () {
            const categoria = this.querySelector('.nombre-categoria').textContent;
            cargarProductos(categoria);
        });
    });

    function cargarProductos(categoria) {
        const catalogo = document.querySelector('.catalogo');
        catalogo.innerHTML = '';

        const productosFiltrados = productos.filter(p => p.categoria === categoria);

        if (productosFiltrados.length === 0) {
            catalogo.innerHTML = '<p>No hay productos en esta categoría</p>';
            return;
        }

        productosFiltrados.forEach(producto => {
            const productoElement = document.createElement('div');
            productoElement.className = 'producto';
            productoElement.innerHTML = `
                <img src="..." alt="${producto.nombre}" />
                <h4>Nombre: ${producto.nombre} $${producto.precio.toFixed(2)}</h4>
                <p>Descripción: ${producto.nombre}</p>
                <button class="btn-anadir" data-id="${producto.id}">Añadir</button>
            `;
            catalogo.appendChild(productoElement);
        });

        document.querySelectorAll('.btn-anadir').forEach(btn => {
            btn.addEventListener('click', function () {
                const productoId = parseInt(this.getAttribute('data-id'));
                const producto = productos.find(p => p.id === productoId);
                agregarProductoAOrden(producto);
            });
        });
    }

    function agregarProductoAOrden(producto) {
        if (!ordenActual) {
            ordenActual = {
                id: generarIdOrden(),
                fecha: new Date(),
                productos: [],
                total: 0,
                estado: 'pendiente'
            };
            ordenesPendientes.push(ordenActual);
            mostrarDetallesOrden();
            actualizarVentanaOrdenes();
        }

        const productoExistente = ordenActual.productos.find(p => p.id === producto.id);

        if (productoExistente) {
            productoExistente.cantidad += 1;
            productoExistente.subtotal = productoExistente.cantidad * producto.precio;
        } else {
            ordenActual.productos.push({
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: 1,
                subtotal: producto.precio
            });
        }

        ordenActual.total = ordenActual.productos.reduce((sum, p) => sum + p.subtotal, 0);
        actualizarDetallesOrden();
    }

    function mostrarDetallesOrden() {
        ventanaOrdenes.style.display = 'none';
        seccionDetallesOrden.style.display = 'block';

        const detallesHeader = document.querySelector('.detalles-header div');
        detallesHeader.innerHTML = `
            <h3>Detalles orden ${ordenActual.id}</h3>
            <div class="fecha-hora">${formatearFecha(ordenActual.fecha)} 🕐 ${formatearHora(ordenActual.fecha)}</div>
        `;
    }

    function actualizarDetallesOrden() {
        listaProductos.innerHTML = '';

        ordenActual.productos.forEach(producto => {
            const item = document.createElement('div');
            item.className = 'item-producto';
            item.setAttribute('data-id', producto.id);
            item.innerHTML = `
                <div class="info-producto">
                    <div class="nombre-producto">${producto.nombre}</div>
                    <div class="precio-producto">$${producto.precio.toFixed(2)}</div>
                </div>
                <div class="controles-cantidad">
                    <button class="btn-cantidad" data-action="decrement" data-id="${producto.id}">-</button>
                    <span class="cantidad">${producto.cantidad.toString().padStart(2, '0')}</span>
                    <button class="btn-cantidad" data-action="increment" data-id="${producto.id}">+</button>
                    <button class="eliminar-btn" data-id="${producto.id}">🗑️</button>
                </div>
            `;
            listaProductos.appendChild(item);
        });

        totalPrecio.textContent = `$${ordenActual.total.toFixed(2)}`;

        document.querySelectorAll('.btn-cantidad').forEach(btn => {
            btn.addEventListener('click', function () {
                const productoId = parseInt(this.getAttribute('data-id'));
                const action = this.getAttribute('data-action');
                cambiarCantidad(productoId, action === 'increment' ? 1 : -1);
            });
        });

        document.querySelectorAll('.eliminar-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const productoId = parseInt(this.getAttribute('data-id'));
                eliminarProducto(productoId);
            });
        });
    }

    function cambiarCantidad(productoId, cambio) {
        const producto = ordenActual.productos.find(p => p.id === productoId);
        if (!producto) return;

        producto.cantidad += cambio;
        if (producto.cantidad <= 0) {
            eliminarProducto(productoId);
            return;
        }

        producto.subtotal = producto.cantidad * producto.precio;
        ordenActual.total = ordenActual.productos.reduce((sum, p) => sum + p.subtotal, 0);
        actualizarDetallesOrden();
    }

    function eliminarProducto(productoId) {
        ordenActual.productos = ordenActual.productos.filter(p => p.id !== productoId);
        if (ordenActual.productos.length === 0) {
            cancelarOrden();
            return;
        }

        ordenActual.total = ordenActual.productos.reduce((sum, p) => sum + p.subtotal, 0);
        actualizarDetallesOrden();
    }

    function mostrarVentanaOrdenes() {
        seccionDetallesOrden.style.display = 'none';
        ventanaOrdenes.style.display = 'block';
        actualizarVentanaOrdenes();
    }

    function actualizarVentanaOrdenes() {
        contenidoOrdenes.innerHTML = '';
        if (ordenesPendientes.length === 0) {
            contenidoOrdenes.innerHTML = '<p>No hay órdenes pendientes</p>';
            return;
        }

        ordenesPendientes.forEach(orden => {
            const ordenItem = document.createElement('div');
            ordenItem.className = 'orden-item';
            if (ordenActual && orden.id === ordenActual.id) {
                ordenItem.classList.add('orden-actual');
            }
            ordenItem.innerHTML = `
                <div class="orden-codigo">${orden.id}</div>
                <div class="orden-info">
                    <div class="orden-fecha">${formatearFechaCorta(orden.fecha)}</div>
                    <div class="orden-hora">${formatearHora(orden.fecha)}</div>
                </div>
            `;
            ordenItem.addEventListener('click', () => {
                ordenActual = orden;
                mostrarDetallesOrden();
            });
            contenidoOrdenes.appendChild(ordenItem);
        });
    }

    function agregarOrden() {
        ordenActual = {
            id: generarIdOrden(),
            fecha: new Date(),
            productos: [],
            total: 0,
            estado: 'pendiente'
        };
        ordenesPendientes.push(ordenActual);
        mostrarDetallesOrden();
        actualizarVentanaOrdenes();
    }

    function cancelarOrden() {
        if (!ordenActual) return;
        const index = ordenesPendientes.findIndex(o => o.id === ordenActual.id);
        if (index !== -1) {
            ordenesPendientes.splice(index, 1);
        }
        ordenActual = null;
        mostrarVentanaOrdenes();
    }

    function aceptarOrden() {
        if (!ordenActual) return;
        ordenActual.estado = 'completada';
        ordenActual.fechaCompletada = new Date();

        const index = ordenesPendientes.findIndex(o => o.id === ordenActual.id);
        if (index !== -1) {
            ordenesPendientes.splice(index, 1);
        }

        ordenesCompletadas.push(ordenActual);
        ordenActual = null;
        mostrarVentanaOrdenes();
    }

    function imprimirTicket() {
        if (!ordenActual) return;
        const ticketContent = `
======================
ORDEN: ${ordenActual.id}
FECHA: ${formatearFecha(ordenActual.fecha)} ${formatearHora(ordenActual.fecha)}
======================
${ordenActual.productos.map(p => `${p.nombre} x${p.cantidad} $${p.subtotal.toFixed(2)}`).join('\n')}
======================
TOTAL: $${ordenActual.total.toFixed(2)}
======================
¡GRACIAS POR SU COMPRA!
        `;
        console.log(ticketContent);
        alert('Ticket impreso (ver consola para detalles)');
    }

    function mostrarHistorial() {
        const tbody = document.getElementById('tbodyHistorial');
        tbody.innerHTML = '';

        if (ordenesCompletadas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">No hay órdenes completadas</td></tr>';
        } else {
            ordenesCompletadas.forEach(orden => {
                const fila = document.createElement('tr');
                fila.classList.add('content-row');
                const descripcion = orden.productos.map(p => `${p.nombre} x${p.cantidad}`).join(', ');
                fila.innerHTML = `
                    <td>${orden.id}</td>
                    <td>${descripcion}</td>
                    <td>$${orden.total.toFixed(2)}</td>
                    <td>${formatearFecha(orden.fechaCompletada)} ${formatearHora(orden.fechaCompletada)}</td>
                    <td>Cliente</td>
                `;
                tbody.appendChild(fila);
            });
        }

        document.getElementById('modalHistorial').style.display = 'flex';
    }

    // Funciones auxiliares
    function generarIdOrden() {
        return 'ORD' + (Math.floor(Math.random() * 900) + 100).toString();
    }

    function formatearFecha(fecha) {
        const d = new Date(fecha);
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    }

    function formatearFechaCorta(fecha) {
        const d = new Date(fecha);
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear().toString().slice(-2)}`;
    }

    function formatearHora(fecha) {
        const d = new Date(fecha);
        const horas = d.getHours().toString().padStart(2, '0');
        const minutos = d.getMinutes().toString().padStart(2, '0');
        return `${horas}:${minutos}`;
    }

    // Event listeners globales
    document.querySelector('.cerrar-btn').addEventListener('click', mostrarVentanaOrdenes);
    document.querySelector('.btn-cerrar').addEventListener('click', mostrarVentanaOrdenes);
    document.querySelector('.btn-agregar').addEventListener('click', agregarOrden);
    document.querySelector('.btn-cancelar').addEventListener('click', cancelarOrden);
    document.querySelector('.btn-aceptar').addEventListener('click', aceptarOrden);
    document.querySelector('.btn-imprimir').addEventListener('click', imprimirTicket);
    document.querySelector('.btn-historial').addEventListener('click', mostrarHistorial);
});

// Cerrar modal del historial
function cerrarHistorial() {
    document.getElementById('modalHistorial').style.display = 'none';
}
