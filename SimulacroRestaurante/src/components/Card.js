// ============================================================================
// ARCHIVO: Card.js
// PROPÓSITO: Componente de tarjeta de producto (UI reutilizable)
// ============================================================================
// PATRÓN: Component Pattern - Función asíncrona que retorna HTML string
// SE USA EN: menu.js (para renderizar cada producto del menú)
// ============================================================================

/**
 * IMPORT: JsonService
 * -------------------
 * ORIGEN: ../services/JsonService.js
 * PROPÓSITO: Obtener datos del producto desde la API
 * FLUJO: Card.js → JsonService → API → retorna datos del producto
 */
import JsonService from '../services/JsonService.js';

/**
 * FUNCIÓN EXPORTADA: Card(productId, isAdmin)
 * --------------------------------------------
 * PROPÓSITO: Generar HTML de una tarjeta de producto
 * 
 * PARÁMETROS:
 *   - productId: string|number - ID del producto a mostrar
 *   - isAdmin: boolean (default false) - Si es true, muestra botones admin
 * 
 * RETORNA: Promise<string>
 *   - String con HTML completo de la tarjeta
 * 
 * SE USA EN:
 *   - menu.js: await Card(product.id, isAdmin)
 *   - Se genera una tarjeta por cada producto
 * 
 * CARACTERÍSTICAS:
 *   - Muestra imagen, nombre, precio, descripción del producto
 *   - Badge con categoría (Burgers, Sides, Drinks)
 *   - Botón "Add to order" para todos los usuarios
 *   - Botones "Edit" y "Delete" solo para admins
 * 
 * FLUJO COMPLETO:
 * 1. Recibe productId
 * 2. Crea instancia de JsonService
 * 3. Hace GET a /products/{productId}
 * 4. Mapea datos de la API a estructura interna
 * 5. Si isAdmin=true: agrega botones de edición/eliminación
 * 6. Genera HTML con template string
 * 7. Retorna HTML completo
 * 
 * ESTRUCTURA DEL HTML RETORNADO:
 * <article class="card product">
 *   <span class="badge">Categoria</span>
 *   <img src="..." />
 *   <div class="product-info">
 *     <h3>Nombre</h3>
 *     <p>$Precio</p>
 *     <p>Descripción</p>
 *     <button class="add-to-cart-btn">Add to order</button>
 *     <!-- Si isAdmin: -->
 *     <button class="edit-product-btn">Edit</button>
 *     <button class="delete-product-btn">Delete</button>
 *   </div>
 * </article>
 * 
 * EVENTOS (No se manejan aquí, sino en menu.js):
 * - Click en "Add to order" → menu.js.addToCart()
 * - Click en "Edit" → menu.js.openProductModal()
 * - Click en "Delete" → menu.js.deleteProduct()
 * 
 * CÓMO REUTILIZAR EN OTROS PROYECTOS:
 * 1. Copiar esta función
 * 2. Adaptar estructura de datos según tu API
 * 3. Modificar HTML según tu diseño
 * 4. Agregar más condiciones si tienes más roles
 * 5. Considerar usar un template engine (Handlebars, Mustache) para proyectos grandes
 */
export async function Card(productId, isAdmin = false) {
    // 1. Crear instancia del servicio de API
    const service = new JsonService();
    
    // 2. Obtener datos del producto desde la API
    //    Esto hace: GET /products/{productId}
    const product_response = await service.getProductById(productId);

    // 3. Mapear datos de la API a estructura interna
    //    POR QUÉ: Separar datos de la API de la lógica de UI
    //    BENEFICIO: Si la API cambia, solo modificamos aquí
    const data = {
        id: product_response.id,
        category: product_response.category,     // Ej: "Burgers"
        imageUrl: product_response.img,           // URL de la imagen
        title: product_response.name,             // Nombre del producto
        price: product_response.price,            // Precio numérico
        description: product_response.description, // Descripción corta
        stock: product_response.stock             // Stock disponible (no se usa en UI)
    };

    // 4. LÓGICA CONDICIONAL: Botones de administración
    //    Si isAdmin=true → generar HTML de botones Edit y Delete
    //    Si isAdmin=false → adminControls = '' (string vacío)
    const adminControls = isAdmin
        ? `
            <div class="admin-product-actions">
                <button class="button small tertiary edit-product-btn" data-id="${data.id}">
                    Edit
                </button>
                <button class="button small tertiary delete-product-btn" data-id="${data.id}">
                    Delete
                </button>
            </div>
        `
        : '';

    // 5. Retornar HTML completo de la tarjeta
    //    NOTA: Se usa template string con ${} para inyectar datos
    return `
        <article class="card product">
            <span class="badge">${data.category}</span>
            <img src="${data.imageUrl}" alt="${data.title}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${data.title}</h3>
                <p class="product-price">$ ${data.price}</p>
                <p class="product-description">${data.description}</p>

                <button class="button secondary add-to-cart-btn" data-id="${data.id}">
                    <svg class="button-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="9" cy="21" r="1" stroke="currentColor" stroke-width="2"/>
                        <circle cx="20" cy="21" r="1" stroke="currentColor" stroke-width="2"/>
                        <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"/>
                    </svg>
                    Add to order
                </button>

                ${adminControls}
            </div>
        </article>
    `;
}
