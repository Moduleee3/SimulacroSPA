/**
 * ===================================================================
 * VISTA DE PEDIDOS DEL USUARIO (Order View)
 * ===================================================================
 * 
 * PROPÓSITO:
 * Esta vista muestra un historial de pedidos realizados por el usuario
 * actual. Presenta una lista de tarjetas de pedido (OrderCard) filtradas
 * por el ID del usuario logueado, junto con un sidebar con el perfil y
 * estadísticas del usuario.
 * 
 * PATRÓN DE DISEÑO:
 * - Component Pattern: Reutiliza componentes como LoadingView y OrderCard
 * - Service Layer: Usa JsonService para comunicarse con la API REST
 * - Profile Layout: Layout de dos columnas (contenido + sidebar)
 * 
 * IMPORTS (de dónde vienen y por qué):
 * - LoadingView: '../components/Loading.js' - Muestra spinner mientras se cargan los pedidos
 * - JsonService: '../services/JsonService.js' - Servicio para llamadas CRUD a la API
 * - OrderCard: '../components/orderCard.js' - Componente que renderiza cada pedido individual
 * - getCurrentUser: '../services/authService.js' - Obtiene el usuario logueado de localStorage
 * 
 * EXPORTS (hacia dónde va):
 * - orderView(): Función exportada que se importa en 'src/router/router.js'
 *   El router la mapea a la ruta '#orders' para que se ejecute cuando
 *   el usuario navega a esa URL
 * 
 * FLUJO DE DATOS:
 * 1. Usuario navega a #orders → Router llama a orderView()
 * 2. orderView() obtiene usuario actual con getCurrentUser()
 * 3. Construye estructura HTML del layout (contenido + sidebar)
 * 4. Muestra LoadingView() mientras hace fetch a API
 * 5. Fetch a 'http://localhost:3000/orders' para obtener todos los pedidos
 * 6. Filtra pedidos por userId para mostrar solo los del usuario actual
 * 7. Genera HTML de cada pedido usando OrderCard(order.id) en Promise.all
 * 8. Reemplaza loading por las tarjetas de pedido renderizadas
 * 9. Muestra error si falla la conexión con la API
 * 
 * CÓMO REUTILIZAR EN OTROS PROYECTOS:
 * 
 * 1. VISTA DE HISTORIAL GENÉRICO:
 *    - Cambiar el fetch URL por tu endpoint de datos (ej: '/api/transactions')
 *    - Reemplazar OrderCard por tu componente de tarjeta personalizado
 *    - Adaptar el filtrado según tu lógica de negocio
 * 
 * 2. PROFILE LAYOUT REUTILIZABLE:
 *    - La estructura de dos columnas (content + sidebar) es útil para
 *      dashboards de usuario, perfiles, historial de actividades
 *    - El sidebar muestra avatar, nombre, email, rol y estadísticas
 *    - Puedes cambiar las estadísticas (TOTAL ORDERS, LOYALTY PTS) por
 *      métricas relevantes a tu proyecto
 * 
 * 3. PATRÓN DE CARGA ASÍNCRONA:
 *    - Renderizar primero la estructura HTML con LoadingView()
 *    - Luego hacer fetch de datos asíncronos
 *    - Actualizar el DOM con los datos reales
 *    - Este patrón mejora la UX mostrando feedback inmediato
 * 
 * 4. FILTRADO POR USUARIO:
 *    - Si tienes un sistema multiusuario, usa este patrón para filtrar
 *      datos por el usuario actual: `data.filter(item => item.userId === currentUser.id)`
 *    - Asegúrate de tener currentUser disponible desde tu sistema de auth
 * 
 * CONSIDERACIONES:
 * - Este componente NO hace paginación, carga todos los pedidos del usuario
 * - Si hay muchos pedidos, considera implementar lazy loading o paginación
 * - El sidebar tiene enlaces no funcionales (Payment Methods, Saved Addresses)
 *   que podrías conectar a rutas reales
 * - Las estadísticas del sidebar son hardcodeadas (12 orders, 450 pts)
 *   y deberían calcularse dinámicamente desde la API
 * 
 * ===================================================================
 */

import { LoadingView } from '../components/Loading.js';
import JsonService from '../services/JsonService.js';
import { OrderCard } from '../components/orderCard.js';
import { getCurrentUser } from '../services/authService.js';

/**
 * FUNCIÓN PRINCIPAL: orderView()
 * 
 * Genera y retorna la vista completa de historial de pedidos del usuario.
 * Es una función asíncrona porque necesita esperar a que se carguen los
 * pedidos desde la API antes de renderizarlos.
 * 
 * @returns {Promise<HTMLElement>} Elemento <main> con toda la vista renderizada
 * 
 * USO EN ROUTER:
 * En 'src/router/router.js' se mapea así:
 * const routes = {
 *   '#orders': orderView,
 *   // ...
 * };
 * Cuando el usuario navega a #orders, el router ejecuta await orderView()
 * y el resultado se pasa a la función render() que lo monta en el DOM.
 */
export async function orderView() {
    // ==== OBTENER USUARIO ACTUAL ====
    // getCurrentUser() lee de localStorage la sesión activa
    // Si no hay usuario logueado, retorna null
    const user = getCurrentUser();

    // ==== CONTENEDOR PRINCIPAL ====
    // Layout de dos columnas: 'layout' aplica CSS Grid
    // 'profile-layout' es un modificador específico para vistas de perfil
    const main = document.createElement('main');
    main.classList.add('layout', 'profile-layout');

    // ==== COLUMNA DE CONTENIDO (PEDIDOS) ====
    // Esta columna ocupará el espacio principal y mostrará la lista de pedidos
    const contentColumn = document.createElement('section');
    contentColumn.classList.add('content');

    const header = document.createElement('div');
    header.classList.add('section-header');
    header.innerHTML = `
        <h1 class="page-title">Recent Orders</h1>
        <a href="#orders" class="link">View All</a>
    `;

    const orderList = document.createElement('div');
    orderList.classList.add('list');
    orderList.innerHTML = LoadingView();

    contentColumn.appendChild(header);
    contentColumn.appendChild(orderList);


    const sidebarColumn = document.createElement('aside');
    sidebarColumn.classList.add('sidebar');
    sidebarColumn.innerHTML = ` <div class="profile-card">
                <div class="avatar">
                    <img src="https://ui-avatars.com/api/?name=Alex+Student&background=00D26B&color=fff&size=120" alt="Alex Student">
                    <div class="avatar-badge">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>
                <h2 class="profile-name">${user.name}</h2>
                <p class="profile-email">${user.email}</p>
                <span class="profile-role">${user.role}</span>

                <div class="stats">
                    <div class="stat">
                        <p class="stat-label">TOTAL ORDERS</p>
                        <p class="stat-value">12</p>
                    </div>
                    <div class="stat">
                        <p class="stat-label">LOYALTY PTS</p>
                        <p class="stat-value accent">450</p>
                    </div>
                </div>
            </div>

            <nav class="menu-list">
                <a href="#" class="menu-item">
                    <svg class="menu-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="3" width="7" height="7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <rect x="14" y="3" width="7" height="7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <rect x="14" y="14" width="7" height="7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <rect x="3" y="14" width="7" height="7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>Payment Methods</span>
                    <svg class="menu-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </a>
                <a href="#" class="menu-item">
                    <svg class="menu-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>Saved Addresses</span>
                    <svg class="menu-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </a>
                <a href="#" class="menu-item">
                    <svg class="menu-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>Preferences</span>
                    <svg class="menu-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </a>
            </nav>

            <footer class="page-footer">
                RestorApp Academic Simulation V1.0<br>
                Performance monitoring active.
            </footer>`
    // ==== ENSAMBLAR LAYOUT ====
    // Añadimos ambas columnas al contenedor principal
    main.appendChild(contentColumn);
    main.appendChild(sidebarColumn);

    // ==============================
    // CARGA ASÍNCRONA DE PEDIDOS
    // ==============================
    // Patrón: "Render first, load later"
    // Ya renderizamos la estructura con LoadingView, ahora cargamos datos reales
    try {
        // Instanciar servicio JSON (aunque en este caso no lo usamos directamente)
        const service = new JsonService();
        
        // Obtener usuario actual para filtrar pedidos
        const currentUser = getCurrentUser();
        
        // Fetch directo a la API de pedidos
        // Nota: Idealmente usaríamos service.getOrders() si estuviera disponible
        const response = await fetch('http://localhost:3000/orders');
        if (!response.ok) throw new Error('Error HTTP ' + response.status);

        // Parsear respuesta JSON a array de pedidos
        let orders = await response.json();

        // ==== FILTRADO POR USUARIO ====
        // Solo mostrar pedidos del usuario actual
        // Esto evita que un usuario vea pedidos de otros
        if (currentUser) {
            orders = orders.filter(o => o.userId === currentUser.id);
        }

        // ==== GENERACIÓN DE TARJETAS DE PEDIDO ====
        // Promise.all ejecuta OrderCard() para cada pedido en paralelo
        // OrderCard() es una función async que hace fetch del pedido y genera HTML
        // .map() transforma el array de pedidos en array de promesas
        // Promise.all espera a que todas se resuelvan y retorna array de strings HTML
        const cardsHtml = await Promise.all(
            orders.map(order => OrderCard(order.id))
        );

        // Reemplazar el loading spinner por las tarjetas reales
        // .join('') convierte el array de strings en un solo string HTML
        orderList.innerHTML = cardsHtml.join('');

    } catch (error) {
        // ==== MANEJO DE ERRORES ====
        // Si falla el fetch o cualquier operación asíncrona:
        // - Logueamos el error en consola para debugging
        // - Mostramos mensaje de error amigable al usuario
        console.error('Orders error:', error);
        orderList.innerHTML = `<p class="error">Could not connect to Orders API.</p>`;
    }

    // ==== RETORNO ====
    // Devolvemos el elemento <main> completo con toda la vista renderizada
    // El router lo insertará en el DOM principal de la aplicación
    return main;
}
