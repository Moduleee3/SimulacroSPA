// ============================================================================
// ARCHIVO: constants.js
// PROPÓSITO: Centralizar todas las URLs de la API en un único lugar
// ============================================================================
// Este patrón es reutilizable en cualquier proyecto porque:
// 1. Evita hardcodear URLs en múltiples archivos
// 2. Facilita cambiar el servidor (dev -> producción) en un solo lugar
// 3. Reduce errores de escritura en URLs
// ============================================================================

/**
 * EXPORT: API_URLS
 * ----------------
 * Se exporta con 'export const' para que otros archivos puedan importarlo.
 * Cualquier archivo que necesite hacer peticiones HTTP puede importar estas URLs.
 * 
 * CÓMO REUTILIZAR EN OTROS PROYECTOS:
 * - Crear un archivo constants.js similar
 * - Definir todas las URLs de tu API
 * - Importar donde necesites: import { API_URLS } from './utils/constants.js'
 */
export const API_URLS = {
    // URL de API externa (no se usa en el proyecto actual)
    RAMDON_USER: 'https://randomuser.me/',
    
    // URL base del servidor json-server local
    BASE_URL: 'http://localhost:3000',
    
    // Endpoint para gestionar usuarios (login, registro, perfil)
    USERS: 'http://localhost:3000/users',
    
    // Endpoint para gestionar productos del menú (CRUD completo)
    PRODUCTS: 'http://localhost:3000/products',
    
    // Endpoint para gestionar pedidos (crear, listar, actualizar estado)
    ORDERS : 'http://localhost:3000/orders'
};