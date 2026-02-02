/**
 * ===================================================================
 * VISTA DEL DASHBOARD DE ADMINISTRADOR (Admin Dashboard View)
 * ===================================================================
 * 
 * PROPÓSITO:
 * Panel de control exclusivo para usuarios con rol 'admin'. Muestra
 * métricas del negocio (productos activos, pedidos totales, ingresos)
 * y una tabla con los últimos 10 pedidos del sistema completo.
 * 
 * PATRÓN DE DISEÑO:
 * - Route Guard: Verifica que el usuario sea admin antes de renderizar
 * - Dashboard Pattern: Métricas + tabla de datos en un solo panel
 * - Service Layer: Usa API_URLS para hacer fetch directo a endpoints
 * - Component Pattern: Reutiliza LoadingView para feedback visual
 * 
 * IMPORTS (de dónde vienen y por qué):
 * - getCurrentUser: '../services/authService.js' - Obtiene usuario logueado y verifica rol
 * - API_URLS: '../utils/constants.js' - URLs centralizadas de la API (PRODUCTS, ORDERS)
 * - LoadingView: '../components/Loading.js' - Spinner mostrado mientras cargan las métricas
 * 
 * EXPORTS (hacia dónde va):
 * - AdminDashboardView(): Función exportada que se importa en 'src/router/router.js'
 *   El router la mapea a la ruta '#admin' pero SOLO es accesible si se pasa
 *   el middleware requireAdmin() que verifica el rol del usuario
 * 
 * FLUJO DE DATOS:
 * 1. Usuario navega a #admin → Router ejecuta requireAdmin() (middleware)
 * 2. requireAdmin() verifica que user.role === 'admin', si no redirige a #menu
 * 3. Si pasa la verificación, router llama a AdminDashboardView()
 * 4. AdminDashboardView() hace verificación adicional por seguridad
 * 5. Construye estructura HTML del dashboard (métricas + tabla + sidebar)
 * 6. Llama a loadDashboardData() que hace fetch paralelo a PRODUCTS y ORDERS
 * 7. loadDashboardData() calcula métricas:
 *    - Total de productos: products.length
 *    - Total de pedidos: orders.length
 *    - Ingresos totales: sum de orders[].total
 * 8. Renderiza métricas en tarjetas visuales con iconos SVG
 * 9. Ordena pedidos por fecha (más recientes primero)
 * 10. Renderiza los primeros 10 pedidos en tabla HTML
 * 11. Muestra errores si falla alguna petición a la API
 * 
 * CÓMO REUTILIZAR EN OTROS PROYECTOS:
 * 
 * 1. DASHBOARD DE ADMINISTRADOR GENÉRICO:
 *    - Reemplazar los endpoints de API por los tuyos (productos, ventas, usuarios, etc.)
 *    - Cambiar las métricas calculadas según tu modelo de negocio
 *    - El patrón de "fetch paralelo + calcular + renderizar" es universal
 * 
 * 2. TARJETAS DE MÉTRICAS (Metric Cards):
 *    - Las tarjetas de métricas son reutilizables para cualquier dashboard
 *    - Estructura: icono + etiqueta + valor
 *    - Clases de color: 'primary', 'warning', 'success' para diferentes tipos
 *    - Puedes extraerlas como componente independiente
 * 
 * 3. TABLA DE DATOS CON BADGES:
 *    - La tabla con badges de estado es útil para mostrar listas de transacciones
 *    - Los badges cambian de color según el estado (pending, completed, cancelled)
 *    - Fácil de adaptar para pedidos, facturas, tickets, etc.
 * 
 * 4. VERIFICACIÓN DE ROLES (Role-Based Access):
 *    - El patrón de verificar user.role en la propia vista es una capa extra
 *      de seguridad además del middleware del router
 *    - Si el rol no coincide, redirige y muestra mensaje de acceso denegado
 *    - Importante: la seguridad real debe estar en el backend, esto es solo UX
 * 
 * 5. FETCH PARALELO CON PROMISE.ALL:
 *    - Promise.all([fetch1, fetch2]) ejecuta múltiples peticiones en paralelo
 *    - Más rápido que hacer fetch secuenciales (await fetch1; await fetch2)
 *    - Ideal cuando necesitas datos de múltiples endpoints para una misma vista
 * 
 * 6. ORDENAMIENTO Y LIMITACIÓN DE DATOS:
 *    - .sort() con fechas: `new Date(a.createdAt).getTime()` para comparar
 *    - .slice(0, 10) para limitar a los primeros 10 elementos
 *    - Patrón útil para "Top 10", "Últimos N", "Mejores N", etc.
 * 
 * CONSIDERACIONES DE SEGURIDAD:
 * - Esta vista NO debe ser accesible sin verificación de rol en backend
 * - La verificación en frontend es solo para UX, puede ser bypasseada
 * - Los endpoints /products y /orders deberían validar tokens JWT con rol admin
 * - Nunca confiar solo en localStorage para control de acceso real
 * 
 * MEJORAS POSIBLES:
 * - Agregar filtros por fecha (hoy, semana, mes)
 * - Paginación para la tabla de pedidos
 * - Exportar datos a CSV o PDF
 * - Gráficas de tendencias con Chart.js o similar
 * - Notificaciones de pedidos nuevos en tiempo real (WebSockets)
 * 
 * ===================================================================
 */

import { getCurrentUser } from '../services/authService.js';
import { API_URLS } from '../utils/constants.js';
import { LoadingView } from '../components/Loading.js';

/**
 * FUNCIÓN PRINCIPAL: AdminDashboardView()
 * 
 * Genera y retorna la vista completa del dashboard de administrador.
 * Es una función asíncrona porque llama a loadDashboardData() que hace
 * fetch de datos antes de poder renderizar las métricas y tabla.
 * 
 * FLUJO INTERNO:
 * 1. Obtiene usuario actual y verifica rol 'admin'
 * 2. Si no es admin, redirige a #menu y muestra mensaje de error
 * 3. Construye estructura HTML: header + metricsWrapper + table + sidebar
 * 4. Llama a loadDashboardData() para poblar métricas y tabla
 * 5. Retorna el elemento <main> completo
 * 
 * @returns {Promise<HTMLElement>} Elemento <main> con todo el dashboard renderizado
 * 
 * USO EN ROUTER:
 * En 'src/router/router.js' se protege con middleware:
 * const routes = {
 *   '#admin': () => requireAdmin(AdminDashboardView),
 *   // ...
 * };
 */
export async function AdminDashboardView() {
    // ==== OBTENER Y VERIFICAR USUARIO ADMIN ====
    const user = getCurrentUser();

    // ==== PROTECCIÓN DE ACCESO (ROUTE GUARD) ====
    // Verificación adicional en la vista por si se bypasea el router
    // Si el usuario no está logueado O no es admin:
    // - Redirige al menú principal (#menu)
    // - Retorna vista de acceso denegado
    // IMPORTANTE: Esto es solo frontend, el backend debe validar también
    if (!user || user.role !== 'admin') {
        window.location.hash = '#menu';
        const main = document.createElement('main');
        main.classList.add('container');
        main.innerHTML = '<p>Acceso no autorizado.</p>';
        return main;
    }

    // ==== CONTENEDOR PRINCIPAL ====
    // 'layout': CSS Grid de dos columnas
    // 'dashboard-layout': Modificador específico para dashboards de admin
    const main = document.createElement('main');
    main.classList.add('layout', 'dashboard-layout');

    // ==== COLUMNA DE CONTENIDO (MÉTRICAS + TABLA) ====
    const content = document.createElement('section');
    content.classList.add('content');

    const header = document.createElement('div');
    header.classList.add('section-header');
    header.innerHTML = `
        <h1 class="page-title">Admin Dashboard</h1>
        <span class="profile-role">Admin panel</span>
    `;

    const metricsWrapper = document.createElement('div');
    metricsWrapper.classList.add('metrics');
    metricsWrapper.innerHTML = LoadingView();

    const tableContainer = document.createElement('div');
    tableContainer.classList.add('table-container');
    tableContainer.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th class="id">ID</th>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th class="price">Total</th>
                </tr>
            </thead>
            <tbody id="admin-orders-body">
                <tr>
                    <td colspan="5" style="text-align:center;padding:1.5rem;">
                        Cargando pedidos...
                    </td>
                </tr>
            </tbody>
        </table>
    `;

    content.appendChild(header);
    content.appendChild(metricsWrapper);
    content.appendChild(tableContainer);

    const sidebar = document.createElement('aside');
    sidebar.classList.add('sidebar');
    sidebar.innerHTML = `
        <div class="profile-card">
            <div class="avatar">
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(
        user.name || 'Admin'
    )}&background=00D26B&color=fff&size=120" alt="${user.name}">
                <div class="avatar-badge">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            </div>
            <h2 class="profile-name">${user.name}</h2>
            <p class="profile-email">${user.email}</p>
            <span class="profile-role">Admin</span>
        </div>

        <nav class="menu-list">
            <a href="#menu" class="menu-item">
                <span>Volver al menú</span>
            </a>
            <a href="#orders" class="menu-item">
                <span>Ver pedidos de usuario</span>
            </a>
        </nav>

        <footer class="page-footer">
            RestorApp Admin Console<br>
            Academic Simulation
        </footer>
    `;

    // ==== ENSAMBLAR LAYOUT ====
    main.appendChild(content);
    main.appendChild(sidebar);

    // ==== CARGA ASÍNCRONA DE DATOS ====
    // Llamamos a la función auxiliar que hace fetch y puebla las métricas y tabla
    // Le pasamos referencias a los contenedores DOM para que los actualice
    loadDashboardData(metricsWrapper, tableContainer.querySelector('#admin-orders-body'));

    // ==== RETORNO ====
    // Devolvemos el elemento <main> inmediatamente
    // loadDashboardData() actualizará el contenido de forma asíncrona
    return main;
}

/**
 * ===================================================================
 * FUNCIÓN AUXILIAR: loadDashboardData()
 * ===================================================================
 * 
 * PROPÓSITO:
 * Carga datos desde la API (productos y pedidos) y actualiza el DOM
 * con métricas calculadas y tabla de pedidos recientes.
 * 
 * PARÁMETROS:
 * @param {HTMLElement} metricsContainer - Contenedor donde se renderizarán las tarjetas de métricas
 * @param {HTMLElement} ordersTbody - <tbody> de la tabla donde se insertarán las filas de pedidos
 * 
 * FLUJO:
 * 1. Hace fetch paralelo a API_URLS.PRODUCTS y API_URLS.ORDERS con Promise.all
 * 2. Calcula métricas: total productos, total pedidos, ingresos totales
 * 3. Genera HTML de tarjetas de métricas con iconos y valores
 * 4. Ordena pedidos por fecha (más recientes primero)
 * 5. Toma los primeros 10 pedidos y genera filas de tabla
 * 6. Actualiza el DOM con las métricas y tabla
 * 7. Si hay error, muestra mensajes de error en ambos contenedores
 * 
 * REUTILIZACIÓN:
 * - Patrón común para dashboards: fetch paralelo → calcular → renderizar
 * - Fácil de adaptar cambiando los endpoints y cálculos
 * - Las tarjetas de métricas pueden extraerse como componente separado
 */
async function loadDashboardData(metricsContainer, ordersTbody) {
    try {
        // ==== FETCH PARALELO DE DATOS ====
        // Promise.all ejecuta ambos fetch simultáneamente (más rápido que secuencial)
        // Desestructuramos el resultado en productsRes y ordersRes
        const [productsRes, ordersRes] = await Promise.all([
            fetch(API_URLS.PRODUCTS),  // Endpoint de productos desde constants.js
            fetch(API_URLS.ORDERS)     // Endpoint de pedidos desde constants.js
        ]);

        // ==== VALIDACIÓN DE RESPUESTAS HTTP ====
        // Si alguna petición falla (status 4xx o 5xx), lanzamos error
        if (!productsRes.ok || !ordersRes.ok) {
            throw new Error('Error al cargar datos del servidor');
        }

        // ==== PARSEO DE JSON ====
        // Convertimos las respuestas HTTP a objetos JavaScript
        const products = await productsRes.json();  // Array de productos
        const orders = await ordersRes.json();      // Array de pedidos

        // ==== CÁLCULO DE MÉTRICAS ====
        // Estas son métricas básicas del negocio mostradas en tarjetas
        const totalProducts = products.length;  // Cantidad de productos en catálogo
        const totalOrders = orders.length;      // Cantidad total de pedidos recibidos
        
        // Ingresos totales: suma de todos los totales de pedidos
        // .reduce() itera sobre orders y acumula la suma
        // (o.total || 0) previene errores si total es undefined/null
        const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);

        // ==== RENDERIZADO DE TARJETAS DE MÉTRICAS ====
        // Cada tarjeta tiene: icono SVG + etiqueta + valor numérico
        // Clases de icono (primary, warning, success) determinan el color
        metricsContainer.innerHTML = `
            <div class="metric-card">
                <div class="metric-icon primary">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M3 3H21V21H3V3Z" stroke="currentColor" stroke-width="2"/>
                        <path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="2"
                              stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <div class="metric-info">
                    <p class="metric-label">Productos activos</p>
                    <p class="metric-value">${totalProducts}</p>
                </div>
            </div>
            <div class="metric-card">
                <div class="metric-icon warning">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M4 4H20V20H4V4Z" stroke="currentColor" stroke-width="2"/>
                        <path d="M8 9H16" stroke="currentColor" stroke-width="2"
                              stroke-linecap="round"/>
                        <path d="M8 13H13" stroke="currentColor" stroke-width="2"
                              stroke-linecap="round"/>
                    </svg>
                </div>
                <div class="metric-info">
                    <p class="metric-label">Pedidos totales</p>
                    <p class="metric-value">${totalOrders}</p>
                </div>
            </div>
            <div class="metric-card">
                <div class="metric-icon success">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M12 1V23" stroke="currentColor" stroke-width="2"
                              stroke-linecap="round"/>
                        <path d="M5 8C6.5 6 8.5 5 12 5C15.5 5 17.5 6 19 8" stroke="currentColor"
                              stroke-width="2" stroke-linecap="round"/>
                        <path d="M5 16C6.5 18 8.5 19 12 19C15.5 19 17.5 18 19 16" stroke="currentColor"
                              stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </div>
                <div class="metric-info">
                    <p class="metric-label">Ingresos totales</p>
                    <p class="metric-value">$ ${totalRevenue.toFixed(2)}</p>
                </div>
            </div>
        `;

        // ==== ORDENAMIENTO DE PEDIDOS POR FECHA ====
        // Creamos una copia del array con spread operator [...orders]
        // .sort() ordena de más reciente a más antiguo (descendente)
        // .getTime() convierte Date a timestamp numérico para comparación
        // Si createdAt no existe, usa 0 (fecha de 1970) como fallback
        const sortedOrders = [...orders].sort((a, b) => {
            const da = new Date(a.createdAt || 0).getTime();
            const db = new Date(b.createdAt || 0).getTime();
            return db - da;  // Orden descendente (más reciente primero)
        });

        // ==== GENERACIÓN DE FILAS DE TABLA ====
        // .slice(0, 10): toma solo los primeros 10 pedidos
        // .map(): convierte cada pedido en una fila <tr> HTML
        // .join(''): une todas las filas en un string HTML
        const rowsHtml = sortedOrders
            .slice(0, 10)
            .map(o => {
                // Extraer datos del pedido con valores por defecto
                const customerName = o.user?.name || 'Invitado';  // Nombre del cliente
                
                // Formatear fecha a formato local (ej: "01/02/2026, 10:30:15")
                // Si no hay fecha, muestra "-"
                const date = o.createdAt
                    ? new Date(o.createdAt).toLocaleString()
                    : '-';
                
                const status = o.status || 'pending';  // Estado del pedido
                const total = (o.total || 0).toFixed(2);  // Total formateado a 2 decimales

                // ==== FILA DE TABLA ====
                // Cada columna muestra un dato del pedido
                // El badge de estado usa la clase ${status} para colores dinámicos
                // CSS tiene reglas como .status-badge.pending, .status-badge.completed, etc.
                return `
                    <tr>
                        <td class="id">#${o.id}</td>
                        <td>${customerName}</td>
                        <td>${date}</td>
                        <td>
                            <span class="status-badge ${status}">
                                ${status}
                            </span>
                        </td>
                        <td class="price">$ ${total}</td>
                    </tr>
                `;  // Fin de fila de tabla
            })
            .join('');  // Une todas las filas en un string HTML

        // ==== ACTUALIZAR TABLA EN EL DOM ====
        // Si hay pedidos, insertamos las filas generadas
        // Si no hay pedidos (rowsHtml vacío), mostramos mensaje informativo
        ordersTbody.innerHTML = rowsHtml || `
            <tr>
                <td colspan="5" style="text-align:center;padding:1.5rem;">
                    No hay pedidos registrados.
                </td>
            </tr>`;
            
    } catch (error) {
        // ==== MANEJO DE ERRORES ====
        // Si falla cualquier fetch o procesamiento:
        // - Logueamos error en consola para debugging
        // - Mostramos mensajes de error amigables en la UI
        console.error('Admin dashboard error:', error);
        
        // Error en métricas: reemplazamos todo el contenedor
        metricsContainer.innerHTML = `
            <p class="error">No se pudieron cargar las métricas.</p>
        `;
        
        // Error en tabla: mostramos fila de error
        ordersTbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;padding:1.5rem;color:red;">
                    Error cargando pedidos.
                </td>
            </tr>`;
    }  // Fin del try-catch
}  // Fin de loadDashboardData()
