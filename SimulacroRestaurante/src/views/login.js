// ============================================================================
// ARCHIVO: login.js
// PROPÓSITO: Vista de inicio de sesión (Login)
// ============================================================================
// PATRÓN: View Pattern - Función que retorna elemento DOM con lógica de eventos
// SE USA EN: router.js cuando el usuario navega a #login
// ============================================================================

/**
 * IMPORT: login function
 * ----------------------
 * ORIGEN: ../services/authService.js
 * PROPÓSITO: Autenticar usuario con email y contraseña
 * FLUJO: LoginView → authService.login() → API → localStorage
 */
import {login} from '../services/authService.js';

/**
 * FUNCIÓN EXPORTADA: LoginView()
 * -------------------------------
 * PROPÓSITO: Crear y retornar la vista completa de login
 * 
 * RETORNA: HTMLElement (main)
 *   - Elemento <main> con formulario de login completo
 * 
 * SE USA EN:
 *   - router.js: const view = LoginView()
 *   - Es la primera vista que ve el usuario
 * 
 * CARACTERÍSTICAS:
 *   - Formulario con email y password
 *   - Logo y branding de la app
 *   - Mensajes de error/éxito
 *   - Link a página de registro
 *   - Validación de campos
 * 
 * FLUJO COMPLETO:
 * 1. Usuario navega a #login (o entra por primera vez)
 * 2. router.js ejecuta LoginView()
 * 3. Se crea el DOM con el formulario
 * 4. Se asignan eventos (submit del form)
 * 5. Usuario llena email/password y hace submit
 * 6. handleLogin() valida y llama a authService.login()
 * 7. Si éxito: guarda sesión y redirige a #menu
 * 8. Si error: muestra mensaje de error
 * 
 * EVENTOS:
 * - submit: Se ejecuta handleLogin()
 * 
 * SEGURIDAD:
 * - event.preventDefault() evita recarga de página
 * - Validación de campos vacíos
 * - Mensajes de error específicos
 * 
 * CÓMO REUTILIZAR EN OTROS PROYECTOS:
 * 1. Copiar estructura del formulario
 * 2. Adaptar campos según tus necesidades (username, phone, etc.)
 * 3. Modificar authService.login() según tu backend
 * 4. Personalizar estilos y mensajes
 * 5. Agregar opciones: "Recordarme", "Olvidé contraseña"
 */
export function LoginView() {
    // 1. Crear contenedor principal de la vista
    const main = document.createElement('main');
    main.classList.add('container');
    
    // 2. Inyectar HTML completo del formulario de login
    //    Incluye: logo, título, campos de email/password, botón, mensajes
    main.innerHTML = `
     <div class="card">
        <!-- Branding de la aplicación -->
        <div class="brand">
            <div class="icon-circle">
                <!-- Icono SVG del restaurante -->
                <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 9H9V2H15V9H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M3 11V13H21V11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M8 13L6 22H18L16 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <h1 class="title">RestorApp</h1>
            <p class="subtitle">Login to your account</p>
        </div>

        <!-- Formulario de login -->
        <form class="form" id ="loginForm">
            <!-- Campo de Email -->
            <div class="field">
                <label for="email" class="label">Email Address</label>
                <div class="input-wrapper">
                    <!-- Icono de email -->
                    <svg class="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M22 6L12 13L2 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <input type="email" id="email" class="input" placeholder="name@example.com">
                </div>
            </div>

            <!-- Campo de Password -->
            <div class="field">
                <label for="password" class="label">Password</label>
                <div class="input-wrapper">
                    <!-- Icono de candado -->
                    <svg class="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <input type="password" id="password" class="input" placeholder="••••••••">
                </div>
            </div>

            <!-- Botón de submit -->
            <button type="submit" class="button primary">
            <a href="#menu"></a>Sign In</button>
            
            <!-- Mensaje de error (oculto por defecto) -->
            <p class="auth-error hidden" id="auth-error">
              Credenciales inválidas. Intenta nuevamente.
            </p>
            
            <!-- Mensaje de éxito (oculto por defecto) -->
            <p class="auth-success hidden" id="auth-success">
              ¡Inicio de sesión exitoso!
            </p>

            <!-- Link a página de registro -->
            <p class="footer-text">
                Don't have an account? <a href="#register" class="link">Sign up</a>
            </p>
        </form>
    </div>

    <!-- Footer informativo -->
    <footer class="page-footer">
        RestorApp Academic Simulation
    </footer>
`;
    
    // 3. Asignar eventos al formulario
    //    IMPORTANTE: Se usa setTimeout para asegurar que el DOM esté listo
    //    POR QUÉ: El innerHTML se inyecta de forma síncrona, pero los event listeners
    //             deben esperar a que el navegador procese el HTML
    setTimeout(() => {
        attachEventListeners();
    }, 0);

    // 4. Retornar el elemento main completo con todo el HTML y eventos
    return main;
}

/**
 * FUNCIÓN HELPER: attachEventListeners()
 * ---------------------------------------
 * PROPÓSITO: Asignar evento submit al formulario de login
 * 
 * POR QUÉ SEPARAR ESTA FUNCIÓN:
 * - Organización del código
 * - Facilita debugging
 * - Reutilización si necesitas re-asignar eventos
 * 
 * FLUJO:
 * 1. Busca el formulario por ID
 * 2. Si existe, asigna evento submit
 * 3. El evento ejecutará handleLogin()
 */
function attachEventListeners() {
    // Buscar el formulario en el DOM
    const form = document.getElementById('loginForm');

    if (form) {
        console.log('[LOGIN] Formulario encontrado');
        // Asignar evento submit al formulario
        form.addEventListener('submit', handleLogin);
    }
}
/**
 * FUNCIÓN ASYNC: handleLogin(event)
 * ----------------------------------
 * PROPÓSITO: Manejar el envío del formulario de login
 * 
 * PARÁMETROS:
 *   - event: Event - Evento submit del formulario
 * 
 * FLUJO COMPLETO:
 * 1. Prevenir recarga de página (preventDefault)
 * 2. Obtener valores de email y password
 * 3. Validar que no estén vacíos
 * 4. Llamar a authService.login()
 * 5. Si éxito:
 *    - Mostrar mensaje de éxito
 *    - Esperar 1 segundo
 *    - Redirigir a #menu
 * 6. Si error:
 *    - Mostrar mensaje de error
 * 
 * VALIDACIONES:
 * - Campos no vacíos
 * - Email con formato válido (input type="email" lo valida)
 * 
 * LOGS DE DEBUGGING:
 * - Se usan console.log para seguir el flujo
 * - Útil para depurar problemas de autenticación
 */
async function handleLogin(event) {
    // 1. Prevenir comportamiento por defecto (recargar página)
    event.preventDefault();

    // 2. Obtener valores del formulario
    //    .trim() elimina espacios al inicio y final
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    // Log para debugging
    console.log('[LOGIN] Datos de login:', {email});
    
    // 3. VALIDACIÓN: Verificar que los campos no estén vacíos
    if (!email || !password) {
        console.warn('[LOGIN] Validación fallida: Campos vacíos');
        showError('Por favor completa todos los campos');
        return; // Detener ejecución si falta algún campo
    }
    
    // Log de progreso
    console.log('[LOGIN] Enviando credenciales al servidor...');

    // 4. Llamar al servicio de autenticación
    //    Esta función hace la petición a la API
    const result = await login(email, password);

    // 5. MANEJO DE RESPUESTA
    if (result.success) {
        // LOGIN EXITOSO
        console.log('[LOGIN] Login exitoso:', result.user);
        showSuccess('¡Inicio de sesión exitoso! Redirigiendo...');

        // Esperar 1 segundo antes de redirigir (para que usuario vea el mensaje)
        console.log('[LOGIN] Esperando 1 segundos antes de redirigir...');
        setTimeout(() => {
            console.log('[LOGIN] Redirigiendo a menu...');
            window.location.hash = '#menu'; // Cambiar URL a #menu
            console.log('[LOGIN] Hash cambiado a #menu');
        }, 1000);
    } else {
        // LOGIN FALLIDO
        console.error('[LOGIN] Login fallido:', result.error);
        showError(result.error); // Mostrar mensaje de error
    }
}
/**
 * FUNCIÓN HELPER: showError(message)
 * -----------------------------------
 * PROPÓSITO: Mostrar mensaje de error en la UI
 * 
 * PARÁMETROS:
 *   - message: String - Mensaje de error a mostrar
 * 
 * FLUJO:
 * 1. Log del error en consola
 * 2. Obtener elementos del DOM (error y success)
 * 3. Mostrar elemento de error con el mensaje
 * 4. Ocultar elemento de éxito (si estaba visible)
 * 5. Auto-ocultar después de 5 segundos
 * 
 * ESTILOS:
 * - .auth-error: Fondo rojo, texto blanco
 * - .hidden: display: none
 * 
 * UX:
 * - Mensaje desaparece automáticamente
 * - Usuario no necesita cerrar manualmente
 */
function showError(message) {
    // Log del error para debugging
    console.error('[UI] Mostrando error:', message);

    // Obtener elementos de mensajes del DOM
    const errorElement = document.getElementById('auth-error');
    const successElement = document.getElementById('auth-success');

    // Mostrar mensaje de error
    if (errorElement) {
        errorElement.textContent = message; // Cambiar texto
        errorElement.classList.remove('hidden'); // Hacer visible
    }

    // Ocultar mensaje de éxito (si estaba visible)
    if (successElement) {
        successElement.classList.add('hidden');
    }

    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        if (errorElement) {
            errorElement.classList.add('hidden');
        }
    }, 5000);
}

/**
 * FUNCIÓN HELPER: showSuccess(message)
 * -------------------------------------
 * PROPÓSITO: Mostrar mensaje de éxito en la UI
 * 
 * PARÁMETROS:
 *   - message: String - Mensaje de éxito a mostrar
 * 
 * FLUJO:
 * 1. Log del éxito en consola
 * 2. Obtener elementos del DOM
 * 3. Mostrar elemento de éxito con el mensaje
 * 4. Ocultar elemento de error (si estaba visible)
 * 
 * ESTILOS:
 * - .auth-success: Fondo verde, texto blanco
 * 
 * NOTA:
 * - No se auto-oculta porque redirige a otra página
 * - El mensaje solo se ve por 1 segundo antes de redirigir
 */
function showSuccess(message) {
    // Log del éxito para debugging
    console.log('[UI] Mostrando éxito:', message);

    const errorElement = document.getElementById('auth-error');
    const successElement = document.getElementById('auth-success');

    // Mostrar mensaje de éxito
    if (successElement) {
        successElement.textContent = message;
        successElement.classList.remove('hidden');
    }

    // Ocultar mensaje de error (si estaba visible)
    if (errorElement) {
        errorElement.classList.add('hidden');
    }
}