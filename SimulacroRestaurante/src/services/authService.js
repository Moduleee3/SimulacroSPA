// ============================================================================
// ARCHIVO: authService.js
// PROPÓSITO: Servicio de autenticación - Maneja login, registro y sesiones
// ============================================================================
// PATRÓN: Service Layer - Centraliza toda la lógica de autenticación
// BENEFICIO: Separar lógica de negocio (auth) de la UI (vistas)
// ============================================================================

/**
 * IMPORT: API_URLS
 * ----------------
 * ORIGEN: ../utils/constants.js
 * FLUJO: constants.js -> authService.js (importa las URLs)
 * PROPÓSITO: Obtener las URLs de los endpoints de la API
 * POR QUÉ: Evitar hardcodear URLs, facilitar cambios de servidor
 */
import {API_URLS} from "../utils/constants.js";

/**
 * FUNCIÓN EXPORTADA: login(email, password)
 * ------------------------------------------
 * PROPÓSITO: Autenticar usuario con email y contraseña
 * 
 * PARÁMETROS:
 *   - email: String - Email del usuario
 *   - password: String - Contraseña en texto plano (en producción usar hash)
 * 
 * RETORNA: Object
 *   - { success: true, user: {...} } si login exitoso
 *   - { success: false, error: 'mensaje' } si falla
 * 
 * FLUJO COMPLETO:
 * 1. Usuario escribe email/password en LoginView
 * 2. LoginView llama a login(email, password)
 * 3. Esta función busca el usuario en la API (GET /users?email=...)
 * 4. Valida que exista y que la contraseña coincida
 * 5. Si todo OK: guarda usuario en localStorage y retorna success:true
 * 6. Si falla: retorna success:false con mensaje de error
 * 
 * LOCALSTORAGE:
 * - Almacena el usuario autenticado para persistir la sesión
 * - Se usa en getCurrentUser() para verificar si hay sesión activa
 * - En producción real usar tokens JWT y cookies httpOnly
 * 
 * CÓMO REUTILIZAR EN OTROS PROYECTOS:
 * 1. Cambiar API_URLS.USERS por tu endpoint de usuarios
 * 2. Adaptar la validación según tu backend (puede usar JWT, OAuth, etc.)
 * 3. Cambiar localStorage por sessionStorage si quieres sesiones temporales
 * 4. En producción: NUNCA guardar contraseñas, usar tokens seguros
 */
export async function login(email, password) {
    try {
        // 1. Hacer petición GET a la API para buscar usuario por email
        //    json-server soporta query params: ?email=valor
        const response = await fetch(`${API_URLS.USERS}?email=${(email)}`);

        // 2. Verificar que la petición HTTP fue exitosa (status 200-299)
        if (!response.ok) {
            throw new Error('Error de conexión con el servidor');
        }

        // 3. Convertir respuesta JSON a objeto JavaScript
        //    json-server devuelve un array de usuarios que coinciden
        const users = await response.json();
        const user = users[0]; // Tomar el primero (debe ser único)

        // 4. VALIDACIÓN 1: Verificar que el usuario existe
        if (!user) {
            return { success: false, error: 'Usuario no encontrado' };
        }

        // 5. VALIDACIÓN 2: Verificar que la contraseña coincide
        //    IMPORTANTE: En producción real, el backend debe comparar hashes
        if (user.password !== password) {
            return { success: false, error: 'Contraseña incorrecta' };
        }

        // 6. ÉXITO: Crear sesión guardando usuario en localStorage
        //    Hacemos una copia del objeto usuario
        const sessionUser = { ...user };
        
        // 7. SEGURIDAD: Eliminar la contraseña antes de guardar
        //    NUNCA almacenar contraseñas en localStorage
        delete sessionUser.password;
        
        // 8. Persistir usuario en localStorage como JSON string
        localStorage.setItem('activeUser', JSON.stringify(sessionUser));

        // 9. Retornar éxito con datos del usuario (sin contraseña)
        return { success: true, user: sessionUser };

    } catch (error) {
        // MANEJO DE ERRORES: Capturar cualquier error (red, servidor, etc.)
        console.error('Login error:', error);
        return { success: false, error: 'Ocurrió un error inesperado' };
    }
}
/**
 * FUNCIÓN EXPORTADA: register(userData)
 * --------------------------------------
 * PROPÓSITO: Registrar un nuevo usuario en el sistema
 * 
 * PARÁMETROS:
 *   - userData: Object - Datos del usuario { name, email, password, role }
 * 
 * RETORNA: Object
 *   - { success: true, user: {...} } si registro exitoso
 *   - { success: false, error: 'mensaje' } si falla
 * 
 * FLUJO COMPLETO:
 * 1. Usuario llena formulario de registro en RegisterView
 * 2. RegisterView llama a register(userData)
 * 3. Esta función verifica que el email no exista (evitar duplicados)
 * 4. Si no existe, crea el usuario con POST a la API
 * 5. Retorna el usuario creado o error
 * 
 * VALIDACIONES:
 * - Email único (no permitir duplicados)
 * - Backend debe validar: formato de email, longitud de contraseña, etc.
 * 
 * CÓMO REUTILIZAR EN OTROS PROYECTOS:
 * 1. Adaptar la estructura de userData según tu modelo de usuario
 * 2. Agregar más validaciones (ej: contraseña fuerte, términos aceptados)
 * 3. En producción: backend debe hashear la contraseña antes de guardarla
 */
export async function register(userData) {
    try {
        // 1. VALIDACIÓN PREVIA: Verificar si el email ya está registrado
        //    Esto evita intentar crear usuarios duplicados
        const checkRef = await fetch(`${API_URLS.USERS}?email=${(userData.email)}`);
        const existingUsers = await checkRef.json();

        // 2. Si ya existe un usuario con ese email, rechazar el registro
        if (existingUsers.length > 0) {
            return { success: false, error: 'El correo electrónico ya está registrado' };
        }

        // 3. CREAR USUARIO: Enviar POST con los datos del nuevo usuario
        const response = await fetch(`${API_URLS.USERS}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Indicar que enviamos JSON
            },
            body: JSON.stringify(userData) // Convertir objeto a JSON string
        });

        // 4. Verificar que la creación fue exitosa
        if (!response.ok) {
            throw new Error('No se pudo crear el usuario');
        }

        // 5. Obtener el usuario recién creado (con ID generado por el servidor)
        const newUser = await response.json();
        
        // 6. Retornar éxito con el usuario creado
        return { success: true, user: newUser };

    } catch (error) {
        // MANEJO DE ERRORES: Capturar errores de red, servidor, etc.
        console.error('Register error:', error);
        return { success: false, error: error.message || 'Error al registrar usuario' };
    }
}

/**
 * FUNCIÓN EXPORTADA: logout()
 * ----------------------------
 * PROPÓSITO: Cerrar la sesión del usuario actual
 * 
 * FLUJO:
 * 1. Usuario hace click en botón "Logout" del Navbar
 * 2. Navbar llama a logout()
 * 3. Esta función elimina el usuario de localStorage
 * 4. Redirige al usuario a la página de login
 * 
 * CÓMO FUNCIONA:
 * - localStorage.removeItem('activeUser') elimina la sesión
 * - window.location.hash = '#login' redirige al login
 * - El router detecta el cambio y renderiza LoginView
 * 
 * CÓMO REUTILIZAR EN OTROS PROYECTOS:
 * 1. Si usas tokens JWT: también eliminar el token
 * 2. Si usas cookies: hacer petición al backend para invalidar sesión
 * 3. Cambiar '#login' por tu ruta de autenticación
 */
export function logout() {
    // 1. Eliminar usuario de localStorage (cierra la sesión)
    localStorage.removeItem('activeUser');
    
    // 2. Redirigir a la página de login
    window.location.hash = '#login';
}

/**
 * FUNCIÓN EXPORTADA: getCurrentUser()
 * ------------------------------------
 * PROPÓSITO: Obtener el usuario autenticado actual
 * 
 * RETORNA:
 *   - Object: Datos del usuario si hay sesión activa
 *   - null: Si no hay usuario autenticado
 * 
 * SE USA EN:
 * - Navbar: Para mostrar nombre de usuario y botón logout
 * - Router: Para proteger rutas (verificar autenticación)
 * - Vistas: Para personalizar contenido según el usuario
 * - Menu: Para asociar pedidos al usuario actual
 * 
 * FLUJO:
 * 1. Lee 'activeUser' de localStorage
 * 2. Si existe, lo parsea de JSON a objeto
 * 3. Si no existe o hay error, retorna null
 * 
 * CÓMO REUTILIZAR EN OTROS PROYECTOS:
 * - Esencial en cualquier app con autenticación
 * - Cambiar 'activeUser' por el nombre de tu clave en localStorage
 * - Si usas tokens JWT: decodificar el token para obtener datos
 */
export function getCurrentUser() {
    // 1. Intentar leer el usuario de localStorage
    const userStr = localStorage.getItem('activeUser');
    
    // 2. Si no existe, no hay sesión activa
    if (!userStr) return null;
    
    // 3. Intentar parsear el JSON almacenado
    try {
        return JSON.parse(userStr);
    } catch (e) {
        // Si hay error al parsear (localStorage corrupto), retornar null
        return null;
    }
}

/**
 * FUNCIÓN EXPORTADA: isAuthenticated()
 * -------------------------------------
 * PROPÓSITO: Verificar si hay un usuario autenticado
 * 
 * RETORNA: Boolean
 *   - true: Si hay usuario autenticado
 *   - false: Si no hay sesión activa
 * 
 * SE USA EN:
 * - Proteger rutas: if (!isAuthenticated()) redirect to login
 * - Mostrar/ocultar elementos: {isAuthenticated() && <UserMenu />}
 * - Condicionales de UI: botón de login vs logout
 * 
 * IMPLEMENTACIÓN:
 * - Usa !! para convertir el resultado de getCurrentUser() a boolean
 * - !!null = false, !!{user} = true
 * 
 * CÓMO REUTILIZAR EN OTROS PROYECTOS:
 * - Copiar tal cual en cualquier app con autenticación
 * - Helper muy útil para simplificar condicionales
 */
export function isAuthenticated() {
    return !!getCurrentUser();
}

/**
 * FUNCIÓN EXPORTADA: isAdmin()
 * -----------------------------
 * PROPÓSITO: Verificar si el usuario actual tiene rol de administrador
 * 
 * RETORNA: Boolean
 *   - true: Si el usuario es admin
 *   - false: Si no hay usuario o no es admin
 * 
 * SE USA EN:
 * - Router: Para proteger rutas de administración
 * - Vistas: Para mostrar/ocultar funcionalidades admin
 * - Components: Para mostrar botones de editar/eliminar productos
 * 
 * LÓGICA:
 * - Obtiene el usuario actual con getCurrentUser()
 * - Verifica que exista Y que tenga role === 'admin'
 * - Usa operadores booleanos para retornar true/false
 * 
 * CÓMO REUTILIZAR EN OTROS PROYECTOS:
 * 1. Adaptar según tu sistema de roles (puede ser array de roles, permisos, etc.)
 * 2. Para múltiples roles: hasRole(role) { return user.roles.includes(role) }
 * 3. Para permisos: hasPermission(permission) { return user.permissions.includes(permission) }
 */
export function isAdmin() {
    const user = getCurrentUser();
    // Retorna true solo si hay usuario Y su role es 'admin'
    return !!user && user.role === 'admin';
}

/**
 * FUNCIÓN EXPORTADA: requireAuth()
 * ---------------------------------
 * PROPÓSITO: Proteger rutas que requieren autenticación (middleware de ruta)
 * 
 * USO:
 * - Llamar al inicio de vistas protegidas: requireAuth()
 * - Si no hay usuario, redirige a login automáticamente
 * 
 * EJEMPLO:
 * export function ProfileView() {
 *     requireAuth(); // Protege la vista
 *     // ... resto del código
 * }
 * 
 * POR QUÉ LANZAR ERROR:
 * - Detiene la ejecución del código siguiente
 * - Facilita el debugging (se ve en la consola)
 * - Evita intentar renderizar vistas sin usuario
 * 
 * CÓMO REUTILIZAR EN OTROS PROYECTOS:
 * - Agregar al inicio de cualquier vista que requiera autenticación
 * - Combinar con try-catch en el router para manejar errores
 */
export function requireAuth() {
    if (!isAuthenticated()) {
        // Si no hay usuario autenticado, redirigir a login
        window.location.hash = '#login';
        // Lanzar error para detener la ejecución
        throw new Error('Usuario no autenticado');
    }
}

/**
 * FUNCIÓN EXPORTADA: requireAdmin()
 * ----------------------------------
 * PROPÓSITO: Proteger rutas que solo administradores pueden acceder
 * 
 * USO:
 * - Llamar al inicio de vistas de administración: requireAdmin()
 * - Si el usuario no es admin, redirige a menu
 * 
 * EJEMPLO:
 * export function AdminDashboardView() {
 *     requireAdmin(); // Solo admins pueden entrar
 *     // ... resto del código
 * }
 * 
 * FLUJO:
 * 1. Obtiene usuario actual
 * 2. Verifica que exista Y que sea admin
 * 3. Si no cumple, redirige y lanza error
 * 
 * SEGURIDAD:
 * - Esta es solo validación del FRONTEND
 * - El BACKEND también debe validar permisos en cada endpoint
 * - Nunca confiar solo en validaciones del cliente
 * 
 * CÓMO REUTILIZAR EN OTROS PROYECTOS:
 * 1. Copiar para proteger rutas de admin
 * 2. Crear funciones similares para otros roles: requireModerator(), requireSuperAdmin()
 * 3. Generalizar: requireRole(role) para cualquier rol
 */
export function requireAdmin() {
    const user = getCurrentUser();
    
    // Si no hay usuario O no es admin, redirigir y lanzar error
    if (!user || user.role !== 'admin') {
        window.location.hash = '#menu';
        throw new Error('Acceso no autorizado. Sólo admin.');
    }
}

