/**
 * ===================================================================
 * VISTA PRINCIPAL DEL MENÚ (Menu View) - CORAZÓN DE LA APLICACIÓN
 * ===================================================================
 * 
 * PROPÓSITO:
 * Vista más compleja de la app. Combina catálogo de productos, carrito
 * de compras, búsqueda, filtros, y panel de administración (CRUD).
 * Es la "tienda" donde usuarios compran y admins gestionan productos.
 * 
 * FUNCIONALIDADES PRINCIPALES:
 * 1. CATÁLOGO: Grid de productos con Card components
 * 2. CARRITO: Sidebar con items, cantidades, total, y checkout
 * 3. BÚSQUEDA: Input de texto para filtrar productos
 * 4. FILTROS: Botones por categoría (All, Burgers, Sides, Drinks)
 * 5. CRUD ADMIN: Modal para crear/editar/eliminar productos (solo admin)
 * 6. PERSISTENCIA: localStorage para mantener carrito entre sesiones
 * 
 * PATRÓN DE DISEÑO:
 * - Component Pattern: Usa Card para renderizar cada producto
 * - State Management: Estado del carrito en memoria + localStorage
 * - Event Delegation: Click handlers en contenedores para performance
 * - Modal Pattern: Formulario flotante para CRUD de productos
 * - Role-Based UI: Muestra botones admin solo si user.role === 'admin'
 * 
 * IMPORTS:
 * - Card: '../components/Card.js' - Tarjeta de producto reutilizable
 * - LoadingView: '../components/Loading.js' - Spinner durante carga
 * - JsonService: '../services/JsonService.js' - API REST wrapper
 * - getCurrentUser: '../services/authService.js' - Usuario logueado
 * 
 * EXPORTS:
 * - menuView(): Función async que genera toda la vista
 *   Se importa en router.js y se mapea a la ruta '#menu'
 * 
 * FLUJO DE DATOS COMPLETO:
 * 1. Router llama a menuView() cuando usuario va a #menu
 * 2. menuView() construye HTML del layout (productos + carrito)
 * 3. Carga productos desde API con jsonService.getProducts()
 * 4. Renderiza productos usando Card() en Promise.all
 * 5. Carga carrito desde localStorage
 * 6. Usuario interactúa:
 *    a) Busca/filtra → renderProducts() actualiza grid
 *    b) Añade al carrito → addToCart() actualiza sidebar y localStorage
 *    c) Modifica cantidades → updateSidebarUI() recalcula totales
 *    d) Confirma pedido → handleConfirmOrder() crea order en API
 *    e) Admin CRUD → openProductModal() + submit actualiza productos
 * 
 * REUTILIZACIÓN:
 * Este patrón es ideal para:
 * - E-commerce / tiendas online
 * - Catálogos con carrito de compras
 * - Gestión de inventario con roles
 * - Cualquier app con lista + filtros + CRUD
 * 
 * ===================================================================
 */

import { Card } from '../components/Card.js';
import { LoadingView } from "../components/Loading.js";
import JsonService from "../services/JsonService.js";  // ← CORREGIDO: JsonService con J mayúscula
import { getCurrentUser } from "../services/authService.js";

/**
 * FUNCIÓN PRINCIPAL: menuView()
 * 
 * Construye y retorna la vista completa del menú con todas sus funcionalidades.
 * Es async porque necesita esperar a cargar productos de la API.
 * 
 * @returns {Promise<HTMLElement>} Elemento <main> con layout completo
 */
export async function menuView() {
    // ==== CONTENEDOR PRINCIPAL ====
    // Layout de dos columnas: productos (izq) + carrito (der)
    const main = document.createElement('main');
    main.classList.add('layout');  // CSS Grid de 2 columnas

    // ==== COLUMNA DE CONTENIDO (PRODUCTOS) ====
    // Aquí van: header, buscador, filtros, grid de productos
    const contentColumn = document.createElement('section');
    contentColumn.classList.add('content');

    // ==== VERIFICACIÓN DE ROL ====
    // Obtenemos usuario actual para mostrar UI específica según rol
    const currentUser = getCurrentUser();
    const isAdmin = currentUser && currentUser.role === 'admin';

    // Cabecera con título y botón de "Add product" sólo si es admin
    contentColumn.innerHTML = `
        <div class="section-header">
            <h1 class="page-title">Our Menu</h1>
            ${isAdmin
        ? `<button class="button primary" id="openProductModalBtn">+ Add product</button>`
        : ''}
        </div>
    `;

    // ==== BUSCADOR ====
    const searchSection = document.createElement('div');
    searchSection.classList.add('search-wrapper');
    searchSection.innerHTML = `
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <input type="search" class="search" placeholder="Search food..." id="searchInput">
    `;

    // ==== FILTROS POR CATEGORÍA ====
    const filterGroup = document.createElement('div');
    filterGroup.classList.add('filter-group');
    filterGroup.id = 'filterContainer';
    filterGroup.innerHTML = `
        <button class="filter-button active" data-category="All">All</button>
        <button class="filter-button" data-category="Burgers">Burgers</button>
        <button class="filter-button" data-category="Sides">Sides</button>
        <button class="filter-button" data-category="Drinks">Drinks</button>
    `;

    // ==== GRID DE PRODUCTOS ====
    const productGrid = document.createElement('div');
    productGrid.classList.add('grid');
    // Mientras carga productos mostramos "loading"
    productGrid.innerHTML = LoadingView();

    // Añadimos secciones a la columna de contenido
    contentColumn.appendChild(searchSection);
    contentColumn.appendChild(filterGroup);
    contentColumn.appendChild(productGrid);

    // ==== SIDEBAR (CARRITO) ====
    const sidebarColumn = document.createElement('aside');
    sidebarColumn.classList.add('sidebar');
    sidebarColumn.innerHTML = `
        <div class="sidebar-header">
            <h2 class="sidebar-title">Your Order</h2>
            <span class="order-count" id="cartCount">0</span>
            <button class="link-button" id="clearCartBtn">Clear all</button>
        </div>
        <div class="order-items" id="cartItemsContainer">
            <p style="text-align:center; color: var(--color-text-secondary);">Your cart is empty</p>
        </div>
        <div class="order-summary">
            <div class="summary-row total">
                <span class="summary-label">Total</span>
                <span class="summary-value" id="cartTotal">$0.00</span>
            </div>
        </div>
        <button class="button primary" id="confirmOrderBtn" style="width:100%; margin-top:1rem;">
            Confirm Order
        </button>
        <p id="orderMessage" style="text-align:center; margin-top:10px; font-size: 0.9rem;"></p>
    `;

    // Añadimos columnas al layout principal
    main.appendChild(contentColumn);
    main.appendChild(sidebarColumn);

    // ==== SERVICIO DE API ====
    // Instanciamos JsonService para hacer peticiones a la API REST
    const jsonService = new JsonService();

    // ==============================
    // ESTADO EN MEMORIA (STATE MANAGEMENT)
    // ==============================
    // Estas variables mantienen el estado de la aplicación en esta vista
    let cart = loadCartFromStorage();  // Carrito: array de {product, quantity}
    let allProducts = [];              // Productos cargados desde API
    let editingProduct = null;         // Producto en edición (modal CRUD)

    // ==============================
    // FUNCIONES DEL CARRITO (Shopping Cart Logic)
    // ==============================

    /**
     * loadCartFromStorage()
     * ---------------------
     * PROPÓSITO: Recuperar carrito guardado de sesiones anteriores
     * 
     * FLUJO:
     * 1. Lee clave 'shoppingCart' de localStorage
     * 2. Si existe, parsea JSON a array
     * 3. Si no existe o hay error, retorna array vacío
     * 
     * REUTILIZACIÓN: Patrón universal para persistencia cliente
     */
    function loadCartFromStorage() {
        try {
            const stored = localStorage.getItem('shoppingCart');
            return stored ? JSON.parse(stored) : [];
        } catch {
            // Protección contra localStorage corrupto
            return [];
        }
    }

    /**
     * saveCartToStorage()
     * -------------------
     * PROPÓSITO: Persistir carrito actual para mantenerlo entre sesiones
     * 
     * SE LLAMA: Cada vez que cart cambia (añadir, eliminar, modificar)
     * REUTILIZACIÓN: Guardar cualquier estado en localStorage
     */
    function saveCartToStorage() {
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
    }

    /**
     * calculateCartTotals()
     * ---------------------
     * PROPÓSITO: Calcular métricas del carrito para mostrar en UI
     * 
     * RETORNA: { totalItems: number, totalPrice: number }
     * - totalItems: Suma de todas las cantidades
     * - totalPrice: Suma de precio × cantidad de cada item
     * 
     * REUTILIZACIÓN: Patrón reduce() para agregaciones
     */
    function calculateCartTotals() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
        );
        return { totalItems, totalPrice };
    }

    // Devuelve el HTML de un item del carrito
    function buildCartItemHTML(item) {
        const product = item.product;
        return `
            <div class="order-item">
                <img src="${product.img || 'https://via.placeholder.com/80'}"
                     alt="${product.name}"
                     class="item-image">
                <div class="item-details">
                    <h4 class="item-name">${product.name}</h4>
                    <p class="item-price">$${product.price}</p>
                    <div class="quantity-control">
                        <button class="quantity-button decrease" data-id="${product.id}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-button increase" data-id="${product.id}">+</button>
                        <button class="remove-button remove" data-id="${product.id}">Remove</button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * updateSidebarUI() - CORE DE LA UX DEL CARRITO
     * ----------------------------------------------
     * PROPÓSITO: Sincronizar UI del sidebar con estado del carrito
     * 
     * ACTUALIZA:
     * - Badge de contador (círculo rojo con número)
     * - Total en dólares
     * - Lista de items con controles de cantidad
     * 
     * SE LLAMA: Después de CUALQUIER cambio en cart[]
     * IMPORTANTE: También guarda en localStorage automáticamente
     */
    function updateSidebarUI() {
        const container = sidebarColumn.querySelector('#cartItemsContainer');
        const countBadge = sidebarColumn.querySelector('#cartCount');
        const totalLabel = sidebarColumn.querySelector('#cartTotal');

        // PERSISTENCIA: Cada cambio se guarda automáticamente
        saveCartToStorage();

        const { totalItems, totalPrice } = calculateCartTotals();
        countBadge.textContent = totalItems;
        totalLabel.textContent = `$${totalPrice.toFixed(2)}`;

        // Si el carrito está vacío, mostramos mensaje "Your cart is empty"
        if (cart.length === 0) {
            container.innerHTML = `
                <p style="text-align:center; color: var(--color-text-secondary);">
                    Your cart is empty
                </p>`;
            return;
        }

        // Si hay items, los pintamos todos
        container.innerHTML = cart.map(buildCartItemHTML).join('');
    }

    /**
     * addToCart(productId)
     * --------------------
     * PROPÓSITO: Agregar producto al carrito o incrementar cantidad
     * 
     * LÓGICA:
     * 1. Buscar producto en allProducts[] por ID
     * 2. Si ya está en cart[], incrementar quantity
     * 3. Si es nuevo, agregar con quantity: 1
     * 4. Actualizar UI y localStorage
     * 
     * LLAMADO DESDE: Click en botón "Add to Cart" de cada Card
     * REUTILIZACIÓN: Patrón estándar para carritos de compra
     */
    function addToCart(productId) {
        const product = allProducts.find(p => p.id == productId);
        if (!product) return;  // Producto no encontrado

        const existingItem = cart.find(item => item.product.id == productId);
        if (existingItem) {
            // Ya existe: incrementar cantidad
            existingItem.quantity += 1;
        } else {
            // Nuevo: agregar al carrito
            cart.push({ product, quantity: 1 });
        }

        updateSidebarUI();  // Refrescar UI
    }

    // ==============================
    // CONFIRMAR PEDIDO (CHECKOUT)
    // ==============================

    /**
     * handleConfirmOrder() - CHECKOUT COMPLETO
     * ----------------------------------------
     * PROPÓSITO: Procesar pedido y enviarlo a la API
     * 
     * VALIDACIONES:
     * 1. Carrito no vacío
     * 2. Usuario autenticado (si no, redirige a login)
     * 
     * FLUJO:
     * 1. Construir objeto orderData con items y totales
     * 2. Llamar a jsonService.createOrder()
     * 3. Si éxito: vaciar carrito, mostrar mensaje
     * 4. Si error: mostrar mensaje de error
     * 
     * REUTILIZACIÓN: Patrón de checkout para e-commerce
     */
    async function handleConfirmOrder() {
        const messageEl = sidebarColumn.querySelector('#orderMessage');
        const btn = sidebarColumn.querySelector('#confirmOrderBtn');
        const user = getCurrentUser();

        // No se puede hacer pedido con carrito vacío
        if (cart.length === 0) {
            messageEl.textContent = 'Add items to cart first.';
            messageEl.style.color = 'var(--color-warning)';
            return;
        }

        // Si no hay usuario logueado, redirigimos a login
        if (!user) {
            alert('You must be logged in to order.');
            window.location.hash = '#login';
            return;
        }

        // Estructura del pedido que se enviará a la API
        const orderData = {
            userId: user.id,
            user: { name: user.name, email: user.email },
            items: cart.map(item => ({
                productId: item.product.id,
                name: item.product.name,
                price: item.product.price,
                quantity: item.quantity
            })),
            total: cart.reduce(
                (sum, item) => sum + item.product.price * item.quantity,
                0
            ),
            status: 'pending'
        };

        const originalText = btn.textContent;
        btn.textContent = 'Processing...';
        btn.disabled = true;

        try {
            await jsonService.createOrder(orderData);
            // Si el pedido se crea bien, vaciamos carrito y actualizamos UI
            cart = [];
            updateSidebarUI();
            messageEl.textContent = 'Order placed successfully!';
            messageEl.style.color = 'var(--color-success)';
            setTimeout(() => {
                messageEl.textContent = '';
            }, 3000);
        } catch (error) {
            console.error('Order error:', error);
            messageEl.textContent = 'Error placing order.';
            messageEl.style.color = 'var(--color-error)';
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    }

    // ==============================
    // RENDERIZADO DE PRODUCTOS (CORE DE LA VISTA)
    // ==============================

    /**
     * renderProducts(categoryFilter, searchTerm)
     * ------------------------------------------
     * PROPÓSITO: Filtrar y renderizar productos en el grid
     * 
     * PARÁMETROS:
     * @param {string} categoryFilter - 'All' o categoría específica
     * @param {string} searchTerm - Texto de búsqueda (opcional)
     * 
     * FLUJO:
     * 1. Mostrar LoadingView() mientras filtra
     * 2. Filtrar allProducts[] por categoría Y búsqueda
     * 3. Generar HTML de cada producto con Card()
     * 4. Actualizar productGrid.innerHTML
     * 
     * SE LLAMA:
     * - Al cargar la vista (sin filtros)
     * - Al cambiar categoría (click en filtro)
     * - Al escribir en buscador (input event)
     * - Después de CRUD de productos (crear/editar/eliminar)
     * 
     * REUTILIZACIÓN: Patrón de filtrado + renderizado para listas
     */
    async function renderProducts(categoryFilter = 'All', searchTerm = '') {
        // Mientras hacemos filtro/petición, mostramos pantalla de carga
        productGrid.innerHTML = LoadingView();

        try {
            // Filtramos en memoria según categoría y texto de búsqueda
            const filteredProducts = allProducts.filter(product => {
                const matchesCategory =
                    categoryFilter === 'All' || product.category === categoryFilter;

                const matchesSearch = product.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());

                return matchesCategory && matchesSearch;
            });

            // Si no hay resultados, mensaje vacío
            if (filteredProducts.length === 0) {
                productGrid.innerHTML = `<p class="subtitle">No items found.</p>`;
                return;
            }

            // Para cada producto generamos su tarjeta (Card devuelve HTML)
            const cardPromises = filteredProducts.map(product =>
                Card(product.id, isAdmin)
            );
            const cardsHtml = await Promise.all(cardPromises);
            productGrid.innerHTML = cardsHtml.join('');
        } catch (error) {
            console.error('Error displaying products', error);
            productGrid.innerHTML = `<p class="error">Error loading menu.</p>`;
        }
    }

    // ==============================
    // MODAL DE PRODUCTO (CRUD ADMIN)
    // ==============================

    /**
     * openProductModal(product)
     * -------------------------
     * PROPÓSITO: Mostrar modal para crear o editar producto (solo admin)
     * 
     * PARÁMETROS:
     * @param {Object|null} product - Si null: modo creación, si objeto: modo edición
     * 
     * FLUJO:
     * 1. Guardar product en editingProduct (variable de estado)
     * 2. Crear backdrop (fondo oscuro) y modal
     * 3. Rellenar formulario con datos del producto (si es edición)
     * 4. Insertar modal en document.body
     * 5. Asignar event listeners con attachProductModalEvents()
     * 
     * REUTILIZACIÓN: Patrón de modal para formularios CRUD
     */
    function openProductModal(product = null) {
        editingProduct = product;

        const backdrop = document.createElement('div');
        backdrop.classList.add('modal-backdrop');
        backdrop.id = 'productModalBackdrop';

        const title = product ? 'Edit product' : 'Add product';

        // Valores iniciales del formulario: si es edición, rellenamos con datos del producto
        const values = {
            name: product?.name || '',
            price: product?.price || '',
            description: product?.description || '',
            img: product?.img || '',
            category: product?.category || 'Burgers',
            stock: product?.stock ?? 0
        };

        backdrop.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h2 class="modal-title">${title}</h2>
                    <button class="modal-close" id="closeProductModalBtn">&times;</button>
                </div>
                <form id="productForm" class="form">
                    <div class="field">
                        <label class="label" for="productName">Name</label>
                        <div class="input-wrapper">
                            <input class="input" type="text" id="productName" value="${values.name}">
                        </div>
                    </div>
                    <div class="field">
                        <label class="label" for="productPrice">Price</label>
                        <div class="input-wrapper">
                            <input class="input" type="number" step="0.01" id="productPrice" value="${values.price}">
                        </div>
                    </div>
                    <div class="field">
                        <label class="label" for="productCategory">Category</label>
                        <div class="input-wrapper">
                            <select class="input select" id="productCategory">
                                <option value="Burgers" ${values.category === 'Burgers' ? 'selected' : ''}>Burgers</option>
                                <option value="Sides" ${values.category === 'Sides' ? 'selected' : ''}>Sides</option>
                                <option value="Drinks" ${values.category === 'Drinks' ? 'selected' : ''}>Drinks</option>
                            </select>
                        </div>
                    </div>
                    <div class="field">
                        <label class="label" for="productStock">Stock</label>
                        <div class="input-wrapper">
                            <input class="input" type="number" id="productStock" value="${values.stock}">
                        </div>
                    </div>
                    <div class="field">
                        <label class="label" for="productImg">Image URL</label>
                        <div class="input-wrapper">
                            <input class="input" type="text" id="productImg" value="${values.img}">
                        </div>
                    </div>
                    <div class="field">
                        <label class="label" for="productDescription">Description</label>
                        <div class="input-wrapper">
                            <textarea class="input" id="productDescription" rows="3">${values.description}</textarea>
                        </div>
                    </div>
                    <p id="productFormError" class="auth-error hidden"></p>
                    <div class="modal-actions">
                        <button type="button" class="button tertiary" id="cancelProductModalBtn">Cancel</button>
                        <button type="submit" class="button primary" id="saveProductBtn">
                            ${product ? 'Save changes' : 'Create product'}
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(backdrop);
        attachProductModalEvents();
    }

    // Cierra el modal y limpia el estado de edición
    function closeProductModal() {
        const backdrop = document.getElementById('productModalBackdrop');
        if (backdrop) backdrop.remove();
        editingProduct = null;
    }

    // Asigna todos los listeners del modal (cerrar, cancelar, submit)
    function attachProductModalEvents() {
        const backdrop = document.getElementById('productModalBackdrop');
        if (!backdrop) return;

        const closeBtn = backdrop.querySelector('#closeProductModalBtn');
        const cancelBtn = backdrop.querySelector('#cancelProductModalBtn');
        const form = backdrop.querySelector('#productForm');
        const errorEl = backdrop.querySelector('#productFormError');

        const handleClose = () => closeProductModal();

        closeBtn.addEventListener('click', handleClose);
        cancelBtn.addEventListener('click', handleClose);

        // Cerrar haciendo click fuera del modal
        backdrop.addEventListener('click', e => {
            if (e.target === backdrop) {
                closeProductModal();
            }
        });

        // Envío del formulario de producto (crear/editar)
        form.addEventListener('submit', async e => {
            e.preventDefault();
            errorEl.classList.add('hidden');
            errorEl.textContent = '';

            // Leemos valores del formulario
            const name = form.querySelector('#productName').value.trim();
            const price = parseFloat(form.querySelector('#productPrice').value);
            const category = form.querySelector('#productCategory').value;
            const stock = parseInt(form.querySelector('#productStock').value || '0', 10);
            const img = form.querySelector('#productImg').value.trim();
            const description = form.querySelector('#productDescription').value.trim();

            // Validación mínima
            if (!name || isNaN(price)) {
                errorEl.textContent = 'Name and price are required.';
                errorEl.classList.remove('hidden');
                return;
            }

            const payload = {
                name,
                price,
                category,
                stock,
                img,
                description
            };

            try {
                if (editingProduct) {
                    // Modo edición: actualizamos el producto en API y en memoria
                    const updated = await jsonService.updateProduct(editingProduct.id, {
                        ...editingProduct,
                        ...payload
                    });

                    const index = allProducts.findIndex(p => p.id === editingProduct.id);
                    if (index !== -1) {
                        allProducts[index] = updated;
                    }
                } else {
                    // Modo creación: creamos en API y lo añadimos a la lista local
                    const created = await jsonService.createProduct(payload);
                    allProducts.push(created);
                }

                // Volvemos a renderizar productos con el filtro y búsqueda actuales
                const activeCategory =
                    filterGroup.querySelector('.filter-button.active').dataset.category;
                const currentSearch = searchSection.querySelector('#searchInput').value;

                await renderProducts(activeCategory, currentSearch);
                closeProductModal();
            } catch (err) {
                console.error(err);
                errorEl.textContent = 'Error saving product.';
                errorEl.classList.remove('hidden');
            }
        });
    }

    // ==============================
    // EVENT LISTENERS (INTERACTIVIDAD)
    // ==============================

    /**
     * EVENT DELEGATION EN PRODUCT GRID
     * --------------------------------
     * PATRÓN: Un solo listener en el contenedor para todos los productos
     * VENTAJA: Performance - no crear listener por cada Card
     * 
     * MANEJA:
     * 1. Click en "Add to Cart" → addToCart()
     * 2. Click en "Edit" (admin) → openProductModal(product)
     * 3. Click en "Delete" (admin) → deleteProduct() + re-render
     * 
     * TÉCNICA: e.target.closest() para encontrar botón clickeado
     */
    productGrid.addEventListener('click', async e => {
        // Añadir al carrito
        const addBtn = e.target.closest('.add-to-cart-btn');
        if (addBtn) {
            const id = addBtn.dataset.id;
            addToCart(id);
            return;
        }

        // Si no es admin, no permitimos editar/eliminar
        if (!isAdmin) return;

        // Editar producto
        const editBtn = e.target.closest('.edit-product-btn');
        if (editBtn) {
            const id = editBtn.dataset.id;
            const product = allProducts.find(p => String(p.id) === String(id));
            if (product) openProductModal(product);
            return;
        }

        // Eliminar producto
        const deleteBtn = e.target.closest('.delete-product-btn');
        if (deleteBtn) {
            const id = deleteBtn.dataset.id;
            const confirmDelete = window.confirm('Delete this product?');
            if (!confirmDelete) return;

            try {
                await jsonService.deleteProduct(id);
                // Quitamos el producto eliminado de la lista local
                allProducts = allProducts.filter(p => String(p.id) !== String(id));

                const activeCategory =
                    filterGroup.querySelector('.filter-button.active').dataset.category;
                const currentSearch = searchSection.querySelector('#searchInput').value;

                await renderProducts(activeCategory, currentSearch);
            } catch (err) {
                console.error(err);
                alert('Error deleting product');
            }
        }
    });

    /**
     * EVENT DELEGATION EN SIDEBAR (CARRITO)
     * -------------------------------------
     * MANEJA TODOS LOS CLICKS DEL CARRITO:
     * 
     * 1. Botones de cantidad:
     *    - "+" → Incrementar quantity
     *    - "-" → Decrementar quantity (o eliminar si llega a 0)
     * 2. Botón "Remove" → Eliminar item del carrito
     * 3. Botón "Clear all" → Vaciar todo el carrito
     * 4. Botón "Confirm Order" → Procesar checkout
     * 
     * IDENTIFICACIÓN: data-id en botones de items individuales
     * ACTUALIZACIÓN: Siempre llama a updateSidebarUI() al final
     */
    sidebarColumn.addEventListener('click', e => {
        const target = e.target;
        const id = target.getAttribute('data-id');

        // Click sin data-id: botones generales del sidebar
        if (!id) {
            if (target.id === 'clearCartBtn') {
                cart = [];
                updateSidebarUI();
            } else if (target.id === 'confirmOrderBtn') {
                handleConfirmOrder();
            }
            return;
        }

        // Click con data-id: botones de un item del carrito
        const itemIndex = cart.findIndex(item => item.product.id == id);
        if (itemIndex === -1) return;

        if (target.classList.contains('increase')) {
            cart[itemIndex].quantity++;
        } else if (target.classList.contains('decrease')) {
            if (cart[itemIndex].quantity > 1) {
                cart[itemIndex].quantity--;
            } else {
                // Si baja de 1, eliminamos el item
                cart.splice(itemIndex, 1);
            }
        } else if (target.classList.contains('remove')) {
            cart.splice(itemIndex, 1);
        }

        updateSidebarUI();
    });

    // ==== Filtros de categoría ====
    const filterButtons = filterGroup.querySelectorAll('.filter-button');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', e => {
            // Marcamos sólo el botón pulsado como activo
            filterButtons.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');

            const category = e.currentTarget.getAttribute('data-category');
            const searchTerm = searchSection.querySelector('#searchInput').value;
            renderProducts(category, searchTerm);
        });
    });

    // ==== Búsqueda por texto ====
    const searchInput = searchSection.querySelector('#searchInput');
    searchInput.addEventListener('input', e => {
        const activeCategory = filterGroup
            .querySelector('.filter-button.active')
            .getAttribute('data-category');
        renderProducts(activeCategory, e.target.value);
    });

    // ==== Botón "Add product" (sólo admin) ====
    if (isAdmin) {
        const openModalBtn = contentColumn.querySelector('#openProductModalBtn');
        if (openModalBtn) {
            openModalBtn.addEventListener('click', () => openProductModal(null));
        }
    }

    // ==============================
    // INICIALIZACIÓN DE LA VISTA
    // ==============================

    /**
     * BOOTSTRAP DE LA APLICACIÓN
     * -------------------------
     * Se ejecuta automáticamente al cargar la vista.
     * 
     * ORDEN CRÍTICO:
     * 1. Cargar productos de API → allProducts[]
     * 2. Renderizar productos en grid
     * 3. Actualizar UI del carrito con datos de localStorage
     * 4. Si falla, mostrar mensaje de error
     * 
     * NOTA: Todo esto ocurre antes de retornar main
     * El usuario ve LoadingView() hasta que termine
     */
    try {
        // PASO 1: Fetch de productos desde API
        allProducts = await jsonService.getProducts();
        
        // PASO 2: Renderizar todos los productos (sin filtros)
        await renderProducts();
        
        // PASO 3: Restaurar carrito de localStorage
        updateSidebarUI();
    } catch (error) {
        console.error('Products error:', error);
        productGrid.innerHTML = `<p class="error">Could not connect to API.</p>`;
    }

    // RETORNO: Vista completa lista para insertarse en el DOM
    return main;
}
