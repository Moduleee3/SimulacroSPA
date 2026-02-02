// ============================================================================
// ARCHIVO: jsonService.js
// PROPÓSITO: Servicio central para interactuar con la API REST (json-server)
// ============================================================================
// PATRÓN: Service Layer / Repository Pattern
// BENEFICIO: Centraliza TODAS las peticiones HTTP en un solo lugar
// ============================================================================
// ESTRUCTURA: Clase con métodos para cada operación CRUD
// SE USA EN: Components (Card, OrderCard) y Views (menu, order, adminDashboard)
// ============================================================================

/**
 * IMPORT: API_URLS
 * ----------------
 * ORIGEN: ../utils/constants.js
 * FLUJO: constants.js -> jsonService.js
 * PROPÓSITO: Obtener las URLs de los endpoints
 * POR QUÉ: Evitar hardcodear URLs en múltiples métodos
 */
import {API_URLS} from "../utils/constants.js";

/**
 * CLASE: JsonService
 * ------------------
 * PROPÓSITO: Encapsular TODA la lógica de comunicación con la API
 * 
 * VENTAJAS DE USAR UNA CLASE:
 * - Organización: Agrupar métodos relacionados
 * - Reutilización: Instanciar en cualquier parte: new JsonService()
 * - Mantenibilidad: Cambios en la API solo aquí
 * - Testing: Fácil de mockear en tests unitarios
 * 
 * MÉTODOS DISPONIBLES:
 * - getProducts(): Obtener todos los productos
 * - getProductById(id): Obtener un producto específico
 * - getProductsIDs(): Obtener solo los IDs de productos
 * - createProduct(product): Crear nuevo producto (admin)
 * - updateProduct(id, updates): Actualizar producto (admin)
 * - deleteProduct(id): Eliminar producto (admin)
 * - createOrder(orderData): Crear un nuevo pedido
 * - getOrderById(orderId): Obtener un pedido específico
 * 
 * CÓMO REUTILIZAR EN OTROS PROYECTOS:
 * 1. Copiar la estructura de la clase
 * 2. Adaptar los métodos según tus endpoints
 * 3. Agregar más métodos según necesites (updateOrder, deleteOrder, etc.)
 * 4. Mantener el patrón async/await y try-catch
 */
export default class JsonService {
    /**
     * MÉTODO: getProductsIDs()
     * ------------------------
     * PROPÓSITO: Obtener solo los IDs de todos los productos
     * 
     * RETORNA: Promise<Array<string|number>>
     *   - Array de IDs: ['p001', 'p002', 'p003']
     * 
     * SE USA EN: 
     * - Cuando solo necesitas los IDs (optimización)
     * - Para validaciones (verificar si un ID existe)
     * 
     * FLUJO:
     * 1. Llama a getProducts() para obtener todos los productos
     * 2. Usa .map() para extraer solo el campo 'id'
     * 3. Retorna array de IDs
     * 
     * OPTIMIZACIÓN:
     * - En producción: el backend debería tener endpoint /products/ids
     * - Evitar transferir datos innecesarios
     */
    async getProductsIDs() {
        try {
            // Obtener todos los productos
            const products = await this.getProducts()
            
            // Extraer solo los IDs usando map
            const ids = products.map(product => product.id);
            
            return ids;
        } catch (error) {
            console.error('Product IDs not obtained', error);
            throw new Error('Could not connect to the Products API.');
        }
    }

    /**
     * MÉTODO: getProductById(productId)
     * ----------------------------------
     * PROPÓSITO: Obtener UN producto específico por su ID
     * 
     * PARÁMETROS:
     *   - productId: string|number - ID del producto a buscar
     * 
     * RETORNA: Promise<Object>
     *   - Objeto con datos del producto: { id, name, price, ... }
     * 
     * SE USA EN:
     * - Card.js: Para obtener datos de un producto y mostrarlo
     * - Cualquier lugar que necesite detalles de un producto específico
     * 
     * FLUJO:
     * 1. Hace GET a /products/{productId}
     * 2. Valida que la respuesta sea exitosa (status 200)
     * 3. Convierte JSON a objeto JavaScript
     * 4. Retorna el producto
     * 
     * MANEJO DE ERRORES:
     * - Si el producto no existe: HTTP 404
     * - Si hay error de red: catch captura el error
     * - Siempre lanza Error con mensaje descriptivo
     */
    async getProductById(productId) {
        try {
            // GET /products/{productId}
            const response = await fetch(`${API_URLS.PRODUCTS}/${productId}`);
            
            // Verificar que la petición fue exitosa
            if (!response.ok) {
                throw new Error(`Producto no encontrado (HTTP ${response.status})`);
            }
            
            // Convertir respuesta a objeto
            const product = await response.json();
            
            return product;
        } catch (error) {
            console.error(`Product ${productId} not obtained`, error);
            throw new Error('Could not connect to the Products API.');
        }
    }

    /**
     * MÉTODO: getProducts()
     * ---------------------
     * PROPÓSITO: Obtener TODOS los productos del menú
     * 
     * RETORNA: Promise<Array<Object>>
     *   - Array de productos: [{ id, name, price, ... }, ...]
     * 
     * SE USA EN:
     * - menuView: Para mostrar todo el menú
     * - adminDashboardView: Para estadísticas
     * - Cualquier vista que necesite listar productos
     * 
     * FLUJO:
     * 1. Hace GET a /products (sin parámetros = todos)
     * 2. Valida respuesta HTTP
     * 3. Convierte JSON a array de objetos
     * 4. Retorna el array
     * 
     * HTTP STATUS CODES:
     * - 200: OK - Datos obtenidos correctamente
     * - 404: Not Found - Endpoint no existe
     * - 500: Server Error - Error del servidor
     * 
     * CÓMO REUTILIZAR EN OTROS PROYECTOS:
     * 1. Cambiar API_URLS.PRODUCTS por tu endpoint
     * 2. Adaptar el manejo de errores según necesites
     * 3. Agregar filtros si necesitas: /products?category=Burgers
     */
    async getProducts() {
        try {
            // GET /products
            const response = await fetch(`${API_URLS.PRODUCTS}`);
            
            // Verificar status HTTP
            if (!response.ok) {
                throw new Error(`Error HTTP ${response.status}`);
            }
            
            // Convertir respuesta JSON a array
            const data = await response.json();
            
            return data;

        } catch (error) {
            console.error('Products not obtained', error);
            throw new Error('Could not connect to the Products API.');
        }
    }

    /**
     * MÉTODO: createProduct(product)
     * -------------------------------
     * PROPÓSITO: Crear un nuevo producto en la base de datos (solo admin)
     * 
     * PARÁMETROS:
     *   - product: Object - Datos del nuevo producto
     *     Ejemplo: { name: "Burger", price: 10, category: "Burgers", ... }
     * 
     * RETORNA: Promise<Object>
     *   - Objeto del producto creado (incluye ID generado por el servidor)
     * 
     * SE USA EN:
     * - menuView: Modal de "Add product" (solo admin)
     * - Cualquier formulario de creación de productos
     * 
     * FLUJO:
     * 1. Usuario admin llena formulario de nuevo producto
     * 2. menuView llama a createProduct(datos)
     * 3. Hace POST a /products con el objeto product
     * 4. json-server genera un ID automáticamente
     * 5. Retorna el producto con su nuevo ID
     * 
     * HTTP METHOD: POST
     * - Usado para CREAR nuevos recursos
     * - Body contiene los datos del recurso
     * - Servidor genera el ID (no lo enviamos nosotros)
     * 
     * HEADERS:
     * - Content-Type: application/json
     *   Indica que enviamos datos en formato JSON
     * 
     * CÓMO REUTILIZAR EN OTROS PROYECTOS:
     * 1. Cambiar endpoint por tu API
     * 2. Adaptar la estructura del objeto según tu modelo
     * 3. Agregar validaciones antes de enviar (ej: campos requeridos)
     */
    async createProduct(product) {
        try {
            // POST /products con los datos del nuevo producto
            const response = await fetch('http://localhost:3000/products', {
                method: 'POST', // Método HTTP para crear
                headers: { 
                    'Content-Type': 'application/json' // Formato de los datos
                },
                // Convertir objeto JavaScript a JSON string
                body: window.JSON.stringify(product) // o simplemente JSON.stringify
            });

            // Verificar que la creación fue exitosa
            if (!response.ok) {
                throw new Error('Error HTTP ' + response.status);
            }

            // Retornar el producto creado (con ID generado)
            return await response.json();
        } catch (error) {
            console.error('Product not created', error);
            throw new Error('Could not connect to the Products API.');
        }
    }

    /**
     * MÉTODO: deleteProduct(id)
     * --------------------------
     * PROPÓSITO: Eliminar un producto de la base de datos (solo admin)
     * 
     * PARÁMETROS:
     *   - id: string|number - ID del producto a eliminar
     * 
     * RETORNA: Promise<boolean>
     *   - true si se eliminó correctamente
     * 
     * SE USA EN:
     * - menuView: Botón "Delete" en cada producto (solo admin)
     * - Confirma con window.confirm() antes de llamar
     * 
     * FLUJO:
     * 1. Usuario admin hace click en "Delete"
     * 2. Se muestra confirmación: "¿Seguro que quieres eliminar?"
     * 3. Si acepta, se llama a deleteProduct(id)
     * 4. Hace DELETE a /products/{id}
     * 5. Producto se elimina de la base de datos
     * 
     * HTTP METHOD: DELETE
     * - Usado para ELIMINAR recursos existentes
     * - No necesita body (solo el ID en la URL)
     * - Retorna status 200 o 204 (No Content) si es exitoso
     * 
     * SEGURIDAD:
     * - Solo admin debe poder ejecutar esto
     * - Verificar permisos en el frontend Y backend
     * - Considerar "soft delete" en producción (no eliminar, marcar como inactivo)
     * 
     * CÓMO REUTILIZAR EN OTROS PROYECTOS:
     * 1. Cambiar endpoint por tu API
     * 2. Agregar confirmación antes de llamar
     * 3. Considerar implementar "undo" para recuperar eliminaciones
     */
    async deleteProduct(id) {
        // DELETE /products/{id}
        const res = await fetch(`http://localhost:3000/products/${id}`, {
            method: 'DELETE' // Método HTTP para eliminar
        });
        
        // Verificar que la eliminación fue exitosa
        if (!res.ok) throw new Error('Error al eliminar producto');
        
        return true;
    }

    /**
     * MÉTODO: updateProduct(productId, updates)
     * ------------------------------------------
     * PROPÓSITO: Actualizar un producto existente (solo admin)
     * 
     * PARÁMETROS:
     *   - productId: string|number - ID del producto a actualizar
     *   - updates: Object - Datos a actualizar (solo los campos que cambian)
     * 
     * RETORNA: Promise<Object>
     *   - Objeto del producto actualizado
     * 
     * SE USA EN:
     * - menuView: Modal de "Edit product" (solo admin)
     * - Formulario pre-llenado con datos actuales
     * 
     * FLUJO:
     * 1. Usuario admin hace click en "Edit" en un producto
     * 2. Se abre modal con datos actuales del producto
     * 3. Usuario modifica campos y guarda
     * 4. menuView llama a updateProduct(id, nuevosDatos)
     * 5. Hace PATCH a /products/{id} con los cambios
     * 6. Producto se actualiza en la base de datos
     * 
     * HTTP METHOD: PATCH
     * - Usado para ACTUALIZAR parcialmente un recurso
     * - Solo envía los campos que cambian (eficiente)
     * - Alternativa: PUT (reemplaza TODO el recurso)
     * 
     * PATCH vs PUT:
     * - PATCH: Actualización parcial { price: 15 } -> Solo cambia precio
     * - PUT: Reemplazo completo { id, name, price, ... } -> Reemplaza todo
     * 
     * CÓMO REUTILIZAR EN OTROS PROYECTOS:
     * 1. Cambiar endpoint por tu API
     * 2. Usar PATCH para actualizaciones parciales
     * 3. Usar PUT si necesitas reemplazar el recurso completo
     */
    async updateProduct(productId, updates) {
        try {
            // PATCH /products/{productId} con los datos a actualizar
            const response = await fetch(`${API_URLS.PRODUCTS}/${productId}`, {
                method: 'PATCH', // Método HTTP para actualizar parcialmente
                headers: {
                    'Content-Type': 'application/json'
                },
                // Solo enviamos los campos que se actualizan
                body: JSON.stringify(updates),
            });
            
            // Verificar que la actualización fue exitosa
            if (!response.ok) {
                throw new Error(`Error HTTP ${response.status}`);
            }
            
            // Retornar el producto actualizado
            return await response.json();
        } catch (error) {
            console.error(`Product ${productId} not updated`, error);
            throw new Error('Could not connect to the Products API.');
        }
    }

    /**
     * MÉTODO: createOrder(orderData)
     * -------------------------------
     * PROPÓSITO: Crear un nuevo pedido en la base de datos
     * 
     * PARÁMETROS:
     *   - orderData: Object - Datos del pedido
     *     Estructura: {
     *       userId: string,
     *       user: { name, email },
     *       items: [{ productId, name, price, quantity }],
     *       total: number,
     *       status: string
     *     }
     * 
     * RETORNA: Promise<Object>
     *   - Objeto del pedido creado (con ID y fecha generados)
     * 
     * SE USA EN:
     * - menuView: Botón "Confirm Order" del carrito
     * - Cuando usuario finaliza su compra
     * 
     * FLUJO COMPLETO:
     * 1. Usuario agrega productos al carrito
     * 2. Hace click en "Confirm Order"
     * 3. menuView prepara objeto orderData con todos los items
     * 4. Llama a createOrder(orderData)
     * 5. Este método agrega timestamp actual (createdAt)
     * 6. Hace POST a /orders
     * 7. Pedido se guarda en la base de datos
     * 8. Retorna pedido con ID generado
     * 9. menuView limpia el carrito
     * 10. Muestra mensaje de éxito al usuario
     * 
     * DATOS AUTOMÁTICOS:
     * - createdAt: Se agrega automáticamente con new Date().toISOString()
     *   Formato: "2024-06-15T14:30:00.000Z" (ISO 8601)
     * 
     * ESTRUCTURA DEL PEDIDO:
     * - userId: Para asociar pedido con usuario
     * - user: Copia de datos del usuario (denormalización para performance)
     * - items: Array de productos con cantidad
     * - total: Precio total calculado en el frontend
     * - status: Estado inicial (pending, preparing, ready, delivered)
     * - createdAt: Timestamp de creación
     * 
     * CÓMO REUTILIZAR EN OTROS PROYECTOS:
     * 1. Adaptar estructura según tu modelo de pedidos
     * 2. Agregar campos adicionales: deliveryAddress, paymentMethod, etc.
     * 3. Validar en backend: stock disponible, precios correctos, etc.
     * 4. Considerar transacciones: crear pedido + reducir stock en una sola operación
     */
    async createOrder(orderData) {
        try {
            // POST /orders con los datos del pedido
            const response = await fetch(`${API_URLS.ORDERS}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    // Agregar timestamp de creación
                    createdAt: new Date().toISOString(),
                    // Spread de todos los datos del pedido
                    ...orderData
                }),
            });
            
            // Verificar que la creación fue exitosa
            if (!response.ok) {
                throw new Error(`Error HTTP ${response.status}`);
            }
            
            // Retornar el pedido creado
            return await response.json();

        }catch (error) {
            console.error('Order not created', error);
            throw new Error('Could not connect to the Orders API.');
        }
    }
    
    /**
     * MÉTODO: getOrderById(orderId)
     * ------------------------------
     * PROPÓSITO: Obtener UN pedido específico por su ID
     * 
     * PARÁMETROS:
     *   - orderId: string|number - ID del pedido a buscar
     * 
     * RETORNA: Promise<Object>
     *   - Objeto con datos del pedido completo
     * 
     * SE USA EN:
     * - OrderCard.js: Para obtener datos de un pedido y mostrarlo
     * - orderView: Para listar pedidos del usuario
     * - adminDashboardView: Para mostrar todos los pedidos
     * 
     * FLUJO:
     * 1. OrderCard recibe un orderId
     * 2. Llama a getOrderById(orderId)
     * 3. Obtiene datos completos del pedido
     * 4. Renderiza la tarjeta con los datos
     * 
     * DATOS QUE RETORNA:
     * - id: ID único del pedido
     * - userId: ID del usuario que hizo el pedido
     * - user: { name, email } - Datos del usuario
     * - items: Array de productos pedidos
     * - total: Precio total
     * - status: Estado actual del pedido
     * - createdAt: Fecha de creación
     * 
     * CÓMO REUTILIZAR EN OTROS PROYECTOS:
     * 1. Cambiar endpoint por tu API de pedidos
     * 2. Adaptar según tu estructura de datos
     * 3. Agregar manejo de estados: cancelado, reembolsado, etc.
     */
    async getOrderById(orderId) {
        try {
            // GET /orders/{orderId}
            const response = await fetch(`${API_URLS.ORDERS}/${orderId}`);

            // Verificar que la petición fue exitosa
            if (!response.ok) {
                throw new Error(`No se pudo obtener la orden con id ${orderId}`);
            }

            // Convertir respuesta a objeto
            const order = await response.json();
            
            return order;
        } catch (error) {
            console.error('getOrderById error:', error);
            throw error;
        }
    }
}