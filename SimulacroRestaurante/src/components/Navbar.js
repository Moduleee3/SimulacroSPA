// ============================================================================
// ARCHIVO: Navbar.js
// PROPÓSITO: Componente de navegación principal (header con menú)
// ============================================================================
// PATRÓN: Component Pattern - Función que retorna elemento DOM
// SE USA EN: main.js (se inyecta en todas las vistas excepto login/register)
// ============================================================================

/**
 * IMPORTS
 * -------
 * ORIGEN: ../services/authService.js
 * PROPÓSITO: Obtener usuario actual y función de logout
 * FLUJO: authService.js → Navbar.js → *muestra datos de usuario*
 */
import { logout } from '../services/authService.js';
import { getCurrentUser } from '../services/authService.js';

/**
 * FUNCIÓN EXPORTADA: Navbar()
 * ---------------------------
 * PROPÓSITO: Crear y retornar el elemento header con navegación
 * 
 * RETORNA: HTMLElement (elemento <header>)
 * 
 * SE USA EN:
 * - main.js: Función render() lo inyecta en todas las vistas protegidas
 * 
 * CARACTERÍSTICAS:
 * - Muestra logo y nombre de la app
 * - Links de navegación: Menu, My Orders, Profile
 * - Botón de Logout
 * - Si es admin: muestra link adicional "Admin"
 * 
 * FLUJO DE RENDERIZADO:
 * 1. Crea elemento <header>
 * 2. Inyecta HTML base con logo y links
 * 3. Obtiene usuario actual desde localStorage
 * 4. Si es admin: agrega link "Admin"
 * 5. Agrega botón "Logout"
 * 6. Asigna evento click al botón logout
 * 7. Retorna el elemento completo
 * 
 * CONDICIONAL DE ADMIN:
 * - Verifica user.role === 'admin'
 * - Si es admin: inserta link #dashboard antes del logout
 * - Si no es admin: solo muestra logout
 * 
 * CÓMO REUTILIZAR EN OTROS PROYECTOS:
 * 1. Copiar esta función
 * 2. Adaptar los links según tus rutas
 * 3. Modificar el HTML del logo según tu diseño
 * 4. Agregar más condiciones de roles si necesitas
 * 5. Considerar hacer el navbar responsive (mobile menu)
 */
export function Navbar() {
    // 1. Crear elemento header (contenedor principal del navbar)
    const header = document.createElement('header');
    header.classList.add('header');
    
    // 2. Inyectar HTML base del navbar
    //    Incluye: logo, nombre de la app, y links básicos de navegación
    header.innerHTML = `
        <div class="header-content">
            <div class="logo">
                <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 9H9V2H15V9H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M3 11V13H21V11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M8 13L6 22H18L16 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="logo-text">RestorApp</span>
            </div>
            <nav class="nav">
                <a href="#menu" class="nav-link active">Menu</a>
                <a href="#orders" class="nav-link">My Orders</a>
                <a href="#profile" class="nav-link">Profile</a>
            </nav>
        </div>
    `;

    // 3. Obtener usuario autenticado actual
    //    Si no hay usuario (imposible llegar aquí sin auth), retorna null
    const user = getCurrentUser();
    
    // 4. Obtener referencia al elemento <nav> donde agregaremos items dinámicos
    const nav = header.querySelector('.nav');

    // 5. Crear botón de logout (se insertará después)
    //    Lo creamos aquí para poder insertarlo al final del nav
    const logoutBtn = document.createElement('button');
    logoutBtn.id = 'logoutBtn';
    logoutBtn.classList.add('nav-link'); // Mismo estilo que los links
    logoutBtn.style.marginLeft = '1rem'; // Separación visual
    logoutBtn.style.color = 'var(--color-error)'; // Color rojo para logout
    logoutBtn.textContent = 'Log out';

    // 6. LÓGICA CONDICIONAL: Si es admin, agregar link de Admin Dashboard
    //    ORDEN: Menu, Orders, Profile, Admin, Logout
    if (user && user.role === 'admin') {
        // Crear link al panel de administración
        const adminLink = document.createElement('a');
        adminLink.href = '#dashboard'; // Ruta del dashboard
        adminLink.classList.add('nav-link');
        adminLink.textContent = 'Admin';
        
        // Insertar link Admin antes del logout
        nav.appendChild(adminLink);
        
        // Insertar logout al final
        nav.appendChild(logoutBtn);
    } else {
        // Si no es admin, solo agregar logout al final
        nav.appendChild(logoutBtn);
    }

    // 7. ASIGNAR EVENTO CLICK al botón de logout
    //    Cuando usuario hace click en "Log out"
    logoutBtn.addEventListener('click', () => {
        // Llamar a logout() de authService
        // Esta función:
        // 1. Elimina usuario de localStorage
        // 2. Redirige a #login
        logout();
    });

    // 8. Retornar el elemento header completo y funcional
    //    Este elemento se inyectará en el DOM desde main.js
    return header;
}
