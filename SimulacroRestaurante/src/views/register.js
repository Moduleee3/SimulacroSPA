/**
 * ===================================================================
 * VISTA DE REGISTRO DE USUARIOS (Register View)
 * ===================================================================
 * 
 * PROPÓSITO:
 * Formulario de registro que permite a nuevos usuarios crear una cuenta
 * en la aplicación. Incluye validación de campos, confirmación de contraseña,
 * selección de rol (user/admin), y manejo de errores.
 * 
 * PATRÓN DE DISEÑO:
 * - Form Pattern: Formulario controlado con validación en cliente
 * - Event Delegation: Event listener en el formulario para submit
 * - Service Layer: Usa authService.register() para la lógica de registro
 * - Error Handling: Muestra mensajes de error claros al usuario
 * 
 * IMPORTS (de dónde vienen y por qué):
 * - register: '../services/authService.js' - Función que crea nuevo usuario en la API
 *   y valida que el email no esté duplicado
 * 
 * EXPORTS (hacia dónde va):
 * - RegisterView(): Función exportada que se importa en 'src/router/router.js'
 *   El router la mapea a la ruta '#register' para renderizar el formulario
 * 
 * FLUJO DE DATOS:
 * 1. Usuario navega a #register → Router llama a RegisterView()
 * 2. RegisterView() construye el formulario HTML y lo retorna
 * 3. registerRequest() asigna event listener al formulario
 * 4. Usuario llena campos y hace submit → preventDefault() evita recarga
 * 5. Se extraen valores de los inputs con .value y .trim()
 * 6. VALIDACIONES:
 *    a) Verifica que todos los campos estén llenos
 *    b) Verifica que password === confirmPassword
 * 7. Si validaciones pasan, llama a authService.register(userData)
 * 8. authService hace POST a /users y verifica email duplicado
 * 9. Si registro exitoso (usuario.success === true):
 *    - Redirige a #login para que inicie sesión
 * 10. Si falla, muestra mensaje de error en el formulario
 * 
 * CÓMO REUTILIZAR EN OTROS PROYECTOS:
 * 
 * 1. FORMULARIO DE REGISTRO GENÉRICO:
 *    - Cambiar campos del formulario según tus necesidades (username, phone, etc.)
 *    - Adaptar authService.register() para tu backend (ej: /api/auth/signup)
 *    - Mantener la estructura de validación y manejo de errores
 * 
 * 2. VALIDACIÓN DE FORMULARIOS:
 *    - Validación de campos vacíos: `if (!field.trim()) { error }`
 *    - Validación de coincidencia: `if (password !== confirmPassword) { error }`
 *    - Mostrar errores: elemento <p> con .style.display y .textContent
 *    - Este patrón es reutilizable para cualquier formulario
 * 
 * 3. SELECCIÓN DE ROL:
 *    - El <select> de rol permite elegir entre 'user' y 'admin'
 *    - Útil para aplicaciones con múltiples tipos de usuario
 *    - IMPORTANTE: validar rol en backend, no confiar solo en frontend
 * 
 * 4. ESTRUCTURA DE FORMULARIO DE AUTENTICACIÓN:
 *    - Brand section: logo + título + subtítulo (reutilizable para login/register)
 *    - Form section: campos con iconos SVG y wrappers con .input-wrapper
 *    - Error display: párrafo oculto por defecto, se muestra al validar
 *    - Footer text: enlace a login si ya tiene cuenta
 * 
 * 5. MANEJO ASÍNCRONO DE FORMULARIOS:
 *    - async/await en event listener de submit
 *    - try-catch para manejar errores de red o API
 *    - Verificar response.success antes de redirigir
 *    - Patrón universal para cualquier formulario con backend
 * 
 * VALIDACIONES IMPLEMENTADAS:
 * - Campos obligatorios (name, email, password, confirmPassword)
 * - Coincidencia de contraseñas
 * - Email duplicado (validado en backend por authService)
 * 
 * MEJORAS POSIBLES:
 * - Validación de formato de email con regex
 * - Validación de fortaleza de contraseña (mínimo 8 caracteres, mayúsculas, etc.)
 * - Mostrar icono de check/error en cada campo mientras se escribe
 * - Deshabilitar botón submit mientras se procesa el registro
 * - Mostrar mensaje de éxito antes de redirigir
 * - CAPTCHA para prevenir bots
 * 
 * ===================================================================
 */

import {register} from "../services/authService.js";

/**
 * FUNCIÓN PRINCIPAL: RegisterView()
 * 
 * Genera y retorna la vista completa del formulario de registro.
 * Construye la estructura HTML del formulario y asigna los event listeners
 * para manejar la lógica de validación y envío.
 * 
 * ESTRUCTURA DEL FORMULARIO:
 * - Brand: Logo + título "RestorApp" + subtítulo "Create your account"
 * - Campos:
 *   1. Full Name (text input)
 *   2. Email Address (email input)
 *   3. Password (password input)
 *   4. Confirm Password (password input)
 *   5. Select Role (select: user/admin)
 * - Error display: Párrafo oculto para mostrar mensajes de error
 * - Submit button: "Sign Up"
 * - Footer: Enlace a login si ya tiene cuenta
 * 
 * @returns {HTMLElement} Elemento <main> con todo el formulario renderizado
 * 
 * USO EN ROUTER:
 * En 'src/router/router.js' se mapea así:
 * const routes = {
 *   '#register': RegisterView,
 *   // ...
 * };
 * Cuando el usuario navega a #register, el router ejecuta RegisterView()
 * y el resultado se pasa a la función render() que lo monta en el DOM.
 */
export function RegisterView() {
    // ==== CONTENEDOR PRINCIPAL ====
    const main = document.createElement('main');
    main.classList.add('container');  // Contenedor centrado con max-width

    // ==== SECCIÓN DE MARCA (BRAND) ====
    // Logo, título y subtítulo de la aplicación
    // Esto da identidad visual y contexto al formulario
    const brand = document.createElement('div');
    brand.classList.add('brand');
    brand.innerHTML =
        `<div class="icon-circle">
            <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 9H9V2H15V9H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M3 11V13H21V11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8 13L6 22H18L16 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>
        <h1 class="title">RestorApp</h1>
        <p class="subtitle">Create your account</p>`;

    // ==== FORMULARIO DE REGISTRO ====
    // Cada campo tiene:
    // - <label>: etiqueta accesible para el input
    // - .input-wrapper: contenedor con icono SVG + input
    // - .input: campo de entrada estilizado
    const form = document.createElement('form');
    form.classList.add('form', 'form-register');  // form-register para estilos específicos
    form.innerHTML =
        `<div class="field">
                <label for="name" class="label">Full Name</label>
                <div class="input-wrapper">
                    <svg class="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <input type="text" id="name" class="input" placeholder="e.g. John Doe">
                </div>
            </div>

            <div class="field">
                <label for="email" class="label">Email Address</label>
                <div class="input-wrapper">
                    <svg class="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M22 6L12 13L2 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <input type="email" id="email" class="input" placeholder="name@example.com">
                </div>
            </div>

            <div class="field">
                <label for="password" class="label">Password</label>
                <div class="input-wrapper">
                    <svg class="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <input type="password" id="password" class="input" placeholder="••••••••">
                </div>
            </div>

            <div class="field">
                <label for="confirm-password" class="label">Confirm Password</label>
                <div class="input-wrapper">
                    <svg class="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <input type="password" id="confirm-password" class="input" placeholder="••••••••">
                </div>
            </div>

            <div class="field field-full">
                <label for="role" class="label">Select Role</label>
                <div class="input-wrapper">
                    <svg class="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <select id="role" class="input select">
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
            </div>
            
            <p id="register-error" class="form-error" style="display:none;color:red;"></p>

            <button type="submit" class="button primary button-full">Sign Up</button>

            <p class="footer-text">
                Already have an account? <a href="login.html" class="link">Sign in</a>
            </p>`;
    
    // ==== ENSAMBLAJE DE LA TARJETA DE REGISTRO ====
    // Agrupamos brand + form en una tarjeta estilizada
    const registerCard = document.createElement('div')
    registerCard.classList.add('card', 'register-card');  // register-card para estilos específicos
    registerCard.appendChild(brand);
    registerCard.appendChild(form);

    // ==== MONTAJE EN CONTENEDOR PRINCIPAL ====
    main.appendChild(registerCard);

    // ==== ASIGNACIÓN DE EVENT LISTENERS ====
    // Llamamos a la función que maneja la lógica de validación y envío
    // Le pasamos referencia al <main> para que pueda acceder al formulario
    registerRequest(main);

    // ==== RETORNO ====
    // Devolvemos el elemento <main> completo con toda la vista
    // El router lo insertará en el DOM principal de la aplicación
    return main;
}

/**
 * ===================================================================
 * FUNCIÓN AUXILIAR: registerRequest()
 * ===================================================================
 * 
 * PROPÓSITO:
 * Maneja la lógica de validación y envío del formulario de registro.
 * Asigna un event listener al submit del formulario que:
 * 1. Previene el comportamiento por defecto (recarga de página)
 * 2. Extrae y valida los valores de los inputs
 * 3. Llama al servicio de registro (authService.register)
 * 4. Redirige a login si el registro es exitoso
 * 5. Muestra errores si algo falla
 * 
 * PARÁMETROS:
 * @param {HTMLElement} main - Contenedor principal que contiene el formulario
 *                             Se usa para hacer querySelector y encontrar elementos
 * 
 * VALIDACIONES:
 * - Todos los campos deben estar llenos (usando .trim() para evitar espacios)
 * - Las contraseñas deben coincidir
 * - Email no debe estar duplicado (validado en backend)
 * 
 * FLUJO:
 * 1. Encuentra form y errorParagraph en el DOM
 * 2. Asigna listener a 'submit' del formulario
 * 3. Al hacer submit:
 *    a) Previene recarga con preventDefault()
 *    b) Extrae valores de inputs
 *    c) Valida campos obligatorios
 *    d) Valida coincidencia de contraseñas
 *    e) Llama a register() con datos del usuario
 *    f) Si éxito, redirige a #login
 *    g) Si error, muestra mensaje en errorParagraph
 */
function registerRequest(main) {
    // ==== REFERENCIAS A ELEMENTOS DEL DOM ====
    // Buscamos el formulario usando la clase 'form-register'
    const form = main.querySelector('.form-register');
    
    // Párrafo donde mostraremos mensajes de error
    // Comienza oculto con style="display:none"
    const errorParagraph = main.querySelector('#register-error');

    // ==== EVENT LISTENER DE SUBMIT ====
    // Escuchamos el evento 'submit' del formulario
    // La función es async porque necesita await para register()
    form.addEventListener('submit', async (e) => {
        // Prevenir el comportamiento por defecto del formulario
        // Sin esto, la página se recargaría al hacer submit
        e.preventDefault();

        // ==== EXTRACCIÓN DE VALORES DE INPUTS ====
        // .value obtiene el contenido del input
        // .trim() elimina espacios al inicio y final
        // Esto evita que "  " se considere un valor válido
        const name = form.querySelector('#name').value.trim();
        const email = form.querySelector('#email').value.trim();
        const password = form.querySelector('#password').value;  // No trim en password
        const confirmPassword = form.querySelector('#confirm-password').value;
        const role = form.querySelector('#role').value;  // 'user' o 'admin'

        // ==== VALIDACIÓN 1: CAMPOS OBLIGATORIOS ====
        // Si alguno de los campos está vacío, mostramos error y detenemos
        if (!name || !email || !password || !confirmPassword) {
            errorParagraph.style.display = 'block';  // Mostrar el párrafo de error
            errorParagraph.textContent = 'Please fill in all fields.';  // Mensaje
            return;  // Detener ejecución, no enviar formulario
        }

        // ==== VALIDACIÓN 2: COINCIDENCIA DE CONTRASEÑAS ====
        // Las dos contraseñas deben ser exactamente iguales
        if (password !== confirmPassword) {
            errorParagraph.style.display = 'block';
            errorParagraph.textContent = 'Passwords do not match.';
            return;  // Detener ejecución
        }

        // ==== LLAMADA AL SERVICIO DE REGISTRO ====
        // Si pasa todas las validaciones, intentamos registrar al usuario
        try {
            // Llamar a authService.register() con los datos del usuario
            // Esta función hace POST a /users y valida email duplicado
            const usuario = await register({ name, email, password, role });

            // ==== VERIFICACIÓN DE RESPUESTA ====
            // authService.register() retorna { success: true } si todo OK
            // o { success: false, error: 'mensaje' } si hay error
            if(usuario.success) {
                // ÉXITO: Redirigir al login para que inicie sesión
                window.location.hash = '#login';
            } else {
                // ERROR CONTROLADO: Lanzar error con el mensaje del backend
                throw new Error(usuario.error || 'Error desconocido');
            }
        } catch (error) {
            // ==== MANEJO DE ERRORES ====
            // Si falla el registro (email duplicado, error de red, etc.)
            // - Mostramos el mensaje de error en el párrafo
            // - El mensaje puede venir del backend o ser genérico
            errorParagraph.style.display = 'block';
            errorParagraph.textContent = error.message || 'Registration failed. Please try again.';
        }
    });  // Fin del event listener
}  // Fin de registerRequest()