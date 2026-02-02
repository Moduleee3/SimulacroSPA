// ============================================================================
// ARCHIVO: main.js
// PROPÓSITO: Punto de entrada principal de la aplicación SPA (Single Page Application)
// ============================================================================
// Este es el "cerebro" de la app: inicializa el router y gestiona el renderizado
// ============================================================================

/**
 * IMPORT: Navbar component
 * -------------------------
 * ORIGEN: ./components/Navbar.js
 * PROPÓSITO: Componente de navegación que se muestra en todas las vistas (excepto login/register)
 * Se importa como función que devuelve un elemento DOM
 */
import { Navbar } from "./components/Navbar.js";

/**
 * IMPORT: router function
 * ------------------------
 * ORIGEN: ./router/router.js
 * PROPÓSITO: Función que maneja el cambio de rutas (hash) y renderiza la vista correspondiente
 * Es el núcleo del sistema de navegación de la SPA
 */
import { router } from "./router/router.js";

/**
 * CONSTANTE: app
 * --------------
 * Referencia al div#app del HTML donde se monta toda la aplicación
 * Todo el contenido dinámico se inyecta aquí
 */
const app = document.getElementById('app');

/**
 * FUNCIÓN EXPORTADA: render(viewNode)
 * ------------------------------------
 * PROPÓSITO: Función central de renderizado que actualiza el contenido del DOM
 * PARÁMETROS:
 *   - viewNode: Elemento DOM (o string HTML) que representa la vista a mostrar
 * 
 * FLUJO:
 * 1. Limpia el contenedor principal (#app)
 * 2. Verifica la ruta actual para decidir si mostrar el Navbar
 * 3. Agrega Navbar si corresponde (no en login/register)
 * 4. Agrega el contenido de la vista
 * 
 * SE USA EN: router.js cuando cambia la ruta
 * 
 * CÓMO REUTILIZAR EN OTROS PROYECTOS:
 * - Adaptar la lógica de noNavbarRoutes según tus rutas
 * - Cambiar Navbar por tu componente de navegación
 * - Mantener la estructura: limpiar, agregar nav, agregar contenido
 */
export function render(viewNode) {
    // 1. Limpiar todo el contenido anterior del contenedor principal
    app.innerHTML = '';

    // 2. Identificar la ruta actual del navegador (después del #)
    //    Si no hay hash, asumimos que es #login
    const currentPath = window.location.hash || '#login';

    // 3. Definir en qué rutas NO queremos mostrar el Navbar
    //    (rutas de autenticación son más limpias sin navegación)
    const noNavbarRoutes = ['#login', '#register'];

    // 4. Solo agregar Navbar si la ruta actual NO está en la lista de exclusión
    if (!noNavbarRoutes.includes(currentPath)) {
        app.appendChild(Navbar());
    }

    // 5. Agregar el contenido de la vista actual
    app.appendChild(viewNode);
}

/**
 * EVENT LISTENERS: Inicialización del Router
 * -------------------------------------------
 * HASHCHANGE: Se dispara cuando cambia el hash de la URL (ej: #menu -> #orders)
 *             Permite navegación sin recargar la página (SPA)
 * 
 * LOAD: Se dispara cuando se carga la página por primera vez
 *       Asegura que se renderice la vista inicial
 * 
 * AMBOS llaman a router() que decide qué vista mostrar
 * 
 * CÓMO FUNCIONA EN UNA SPA:
 * - Usuario hace click en un link: <a href="#menu">Menu</a>
 * - El navegador cambia la URL pero NO recarga la página
 * - Se dispara 'hashchange' -> se ejecuta router()
 * - router() lee el nuevo hash y renderiza la vista correspondiente
 */
window.addEventListener('hashchange', router);
window.addEventListener('load', router);
