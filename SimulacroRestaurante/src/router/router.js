// ============================================================================
// ARCHIVO: router.js
// PROPÓSITO: Sistema de enrutamiento (routing) para SPA - Maneja la navegación
// ============================================================================
// Este es el CEREBRO de la navegación: mapea URLs (hashes) a vistas
// ============================================================================

/**
 * IMPORT: render function
 * -----------------------
 * ORIGEN: ../main.js
 * FLUJO: router.js -> main.js (importa la función render)
 * PROPÓSITO: Función que inyecta contenido en el DOM
 * POR QUÉ: Separación de responsabilidades - router decide QUÉ mostrar, render decide CÓMO mostrarlo
 */
import { render } from '../main.js';

/**
 * IMPORTS: View functions (Vistas de la aplicación)
 * --------------------------------------------------
 * ORIGEN: Carpeta ../views/
 * FLUJO: router.js <- views/*.js (importa las funciones de vista)
 * PROPÓSITO: Cada vista es una función que devuelve contenido DOM para renderizar
 * 
 * POR QUÉ FUNCIONES:
 * - Cada vista es asíncrona (puede cargar datos de APIs)
 * - Son reutilizables (se pueden llamar desde cualquier parte)
 * - Siguen el patrón de componentes funcionales
 */
import { menuView } from '../views/menu.js';           // Vista del menú de productos
import { LoginView } from '../views/login.js';          // Vista de inicio de sesión
import { RegisterView } from '../views/register.js';    // Vista de registro
import { orderView } from "../views/order.js";          // Vista de pedidos del usuario
import { AdminDashboardView } from '../views/adminDashboardView.js'; // Panel de administración

/**
 * IMPORT: getCurrentUser function
 * -------------------------------
 * ORIGEN: ../services/authService.js
 * PROPÓSITO: Obtener el usuario autenticado actual desde localStorage
 * SE USA: Para proteger rutas (verificar si el usuario puede acceder)
 */
import { getCurrentUser } from '../services/authService.js';

/**
 * OBJETO: routes
 * --------------
 * ESTRUCTURA: { hash: función_de_vista }
 * PROPÓSITO: Mapear cada ruta (hash) con su vista correspondiente
 * 
 * CÓMO FUNCIONA:
 * - Usuario navega a #menu -> se ejecuta menuView()
 * - Usuario navega a #login -> se ejecuta LoginView()
 * 
 * CÓMO REUTILIZAR EN OTROS PROYECTOS:
 * 1. Crear archivo router.js similar
 * 2. Definir tus rutas: const routes = { '#home': HomeView, '#about': AboutView }
 * 3. Crear las funciones de vista correspondientes
 * 4. Usar la misma lógica del router() function
 */
const routes = {
    '#menu': menuView,               // Ruta del menú principal
    '#login': LoginView,             // Ruta de autenticación
    '#register': RegisterView,       // Ruta de registro de usuarios
    '#orders': orderView,            // Ruta de pedidos del usuario
    '#dashboard': AdminDashboardView, // Ruta del panel de administración (solo admin)
    '#profile': async () => '<h1>Profile View (Work in Progress)</h1>' // Placeholder para perfil
};

/**
 * FUNCIÓN EXPORTADA: router()
 * ----------------------------
 * PROPÓSITO: Función principal del sistema de enrutamiento
 * 
 * FLUJO COMPLETO:
 * 1. Se detecta cambio en URL (hashchange event en main.js)
 * 2. Se ejecuta router()
 * 3. router() lee el hash actual (#menu, #login, etc.)
 * 4. Busca la función de vista correspondiente en el objeto 'routes'
 * 5. Ejecuta la función de vista (puede ser async para cargar datos)
 * 6. Obtiene el contenido DOM de la vista
 * 7. Llama a render() para mostrar el contenido
 * 8. Actualiza el estilo del navbar (link activo)
 * 
 * MANEJO DE ERRORES:
 * - Si la vista no existe -> muestra página 404
 * - Si hay error al cargar -> muestra página 404
 * 
 * CÓMO REUTILIZAR:
 * - Copiar esta función en cualquier proyecto SPA
 * - Adaptar el objeto 'routes' con tus propias rutas
 * - Mantener la estructura try-catch para manejar errores
 */
export async function router() {
    // 1. Obtener el hash actual de la URL (#menu, #login, etc.)
    //    Si no hay hash (usuario acaba de entrar), usar '#register' como default
    const hash = window.location.hash || '#register';

    // 2. Buscar la función de vista correspondiente al hash en el objeto routes
    const viewFn = routes[hash];

    // 3. Verificar si existe una ruta definida para ese hash
    if (viewFn) {
        try {
            // 4. Ejecutar la función de vista (puede ser async para cargar datos de API)
            //    La vista puede devolver:
            //    - Un elemento DOM (createElement)
            //    - Un string HTML (para placeholders)
            const viewContent = await viewFn();

            // 5. Renderizar en el contenedor principal usando render() de main.js
            //    IMPORTANTE: render() espera un nodo DOM, no un string
            if (typeof viewContent === 'string') {
                // Si la vista devuelve HTML como string, lo convertimos a nodo DOM
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = viewContent;
                render(tempDiv);
            } else {
                // Si ya es un nodo DOM, lo pasamos directamente
                render(viewContent);
            }

            // 6. Actualizar el estado visual del navbar (marcar link activo)
            //    Mejora la UX mostrando al usuario dónde está
            updateActiveNavLink(hash);

        } catch (error) {
            // Si hay error al cargar la vista (ej: API caída), mostrar error 404
            console.error("Error loading view:", error);
            renderError404();
        }
    } else {
        // Si no existe ruta definida para ese hash, mostrar error 404
        renderError404();
    }
}

/**
 * FUNCIÓN HELPER: updateActiveNavLink(hash)
 * ------------------------------------------
 * PROPÓSITO: Actualizar estilo visual del navbar para indicar la ruta activa
 * PARÁMETROS:
 *   - hash: String con la ruta actual (ej: '#menu')
 * 
 * FLUJO:
 * 1. Selecciona todos los links del navbar (.nav-link)
 * 2. Compara el href de cada link con el hash actual
 * 3. Agrega clase 'active' al link que coincide
 * 4. Quita clase 'active' de los demás
 * 
 * POR QUÉ ES IMPORTANTE:
 * - Mejora UX: usuario sabe en qué página está
 * - Accesibilidad: indicador visual claro de navegación
 * 
 * CÓMO REUTILIZAR:
 * - Asegurar que tus links tengan clase 'nav-link'
 * - Definir estilos CSS para .nav-link.active
 * - Llamar esta función después de cada cambio de ruta
 */
function updateActiveNavLink(hash) {
    // Seleccionar todos los links de navegación del navbar
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Iterar sobre cada link
    navLinks.forEach(link => {
        // Si el href del link coincide con el hash actual
        if (link.getAttribute('href') === hash) {
            link.classList.add('active');  // Marcarlo como activo
        } else {
            link.classList.remove('active'); // Quitarle el estado activo
        }
    });
}

/**
 * FUNCIÓN HELPER: renderError404()
 * ---------------------------------
 * PROPÓSITO: Mostrar página de error 404 cuando la ruta no existe
 * 
 * SE EJECUTA CUANDO:
 * - Usuario navega a un hash no definido en 'routes'
 * - Hay un error al cargar una vista
 * 
 * FLUJO:
 * 1. Crea un contenedor div
 * 2. Agrega HTML con mensaje de error y botón de retorno
 * 3. Llama a render() para mostrarlo
 * 
 * CÓMO REUTILIZAR:
 * - Personalizar el HTML del mensaje de error
 * - Cambiar el link de retorno (#menu) por tu ruta principal
 * - Agregar estilos CSS para .page-title, .subtitle, etc.
 */
function renderError404() {
    // Crear contenedor del mensaje de error
    const div = document.createElement('div');
    div.classList.add('container');
    
    // Agregar HTML con mensaje de error y link de retorno
    div.innerHTML = `
        <h1 class="page-title">404</h1>
        <p class="subtitle">Page not found</p>
        <a href="#menu" class="button primary">Go back to Menu</a>
    `;
    
    // Renderizar el mensaje de error
    render(div);
}
