// ============================================================================
// ARCHIVO: productService.js
// PROPÓSITO: Servicio alternativo para gestión de productos (similar a jsonService)
// ============================================================================
// PATRÓN: Service Layer / Class-based Service
// NOTA: Este archivo es una alternativa a jsonService.js (actualmente NO SE USA)
// ============================================================================
// DIFERENCIA CON jsonService:
// - jsonService: Clase con métodos estáticos para múltiples recursos
// - productService: Clase específica solo para productos
// ============================================================================

/**
 * IMPORT: JsonService
 * -------------------
 * ORIGEN: ./JsonService.js
 * PROPÓSITO: Hereda o compone funcionalidad de JsonService
 * NOTA: Actualmente se instancia pero no se usa mucho
 */
import JsonService from './JsonService.js';

/**
 * CLASE: ProductService
 * ---------------------
 * PROPÓSITO: Encapsular toda la lógica CRUD específica de productos
 * 
 * VENTAJAS DE ESTE ENFOQUE:
 * - Servicio dedicado solo a productos (Single Responsibility)
 * - Más fácil de testear unitariamente
 * - Puede agregar lógica específica de productos
 * 
 * DESVENTAJAS:
 * - Duplica funcionalidad de jsonService
 * - Más archivos que mantener
 * 
 * CUÁNDO USAR ESTE PATRÓN:
 * - Cuando un recurso tiene lógica compleja específica
 * - Cuando necesitas muchas operaciones personalizadas
 * - Cuando trabajas con múltiples APIs
 * 
 * MÉTODOS DISPONIBLES:
 * - getAll(): Obtener todos los productos
 * - getById(id): Obtener un producto por ID
 * - create(product): Crear nuevo producto
 * - update(id, product): Actualizar producto (PUT completo)
 * - remove(id): Eliminar producto
 * 
 * NOTA IMPORTANTE:
 * - Este servicio usa PUT en lugar de PATCH para actualizar
 * - PUT reemplaza TODO el recurso
 * - PATCH (en jsonService) solo actualiza campos específicos
 * 
 * CÓMO REUTILIZAR EN OTROS PROYECTOS:
 * 1. Copiar esta estructura de clase
 * 2. Cambiar baseUrl por tu endpoint
 * 3. Adaptar métodos según tu API
 * 4. Agregar más métodos específicos si necesitas:
 *    - getByCategory(category)
 *    - search(query)
 *    - getBestSellers()
 *    - updateStock(id, quantity)
 */
class ProductService {
    /**
     * CONSTRUCTOR
     * -----------
     * Inicializa el servicio con sus dependencias y configuración
     */
    constructor() {
        // Instancia de JsonService (actualmente no se usa mucho)
        this.service = new JsonService();
        
        // URL base del endpoint de productos
        this.baseUrl = 'http://localhost:3000/products';
    }

    /**
     * MÉTODO: getAll()
     * ----------------
     * PROPÓSITO: Obtener todos los productos
     * RETORNA: Promise<Array<Object>>
     * HTTP: GET /products
     */
    async getAll() {
        const res = await fetch(this.baseUrl);
        if (!res.ok) throw new Error('Error al obtener productos');
        return res.json();
    }

    /**
     * MÉTODO: getById(id)
     * -------------------
     * PROPÓSITO: Obtener un producto específico
     * PARÁMETROS: id - ID del producto
     * RETORNA: Promise<Object>
     * HTTP: GET /products/{id}
     */
    async getById(id) {
        const res = await fetch(`${this.baseUrl}/${id}`);
        if (!res.ok) throw new Error('Producto no encontrado');
        return res.json();
    }

    /**
     * MÉTODO: create(product)
     * -----------------------
     * PROPÓSITO: Crear nuevo producto
     * PARÁMETROS: product - Objeto con datos del producto
     * RETORNA: Promise<Object> - Producto creado con ID
     * HTTP: POST /products
     */
    async create(product) {
        const res = await fetch(this.baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        if (!res.ok) throw new Error('Error al crear producto');
        return res.json();
    }

    /**
     * MÉTODO: update(id, product)
     * ---------------------------
     * PROPÓSITO: Actualizar producto COMPLETO
     * PARÁMETROS:
     *   - id: ID del producto
     *   - product: Objeto completo del producto
     * RETORNA: Promise<Object> - Producto actualizado
     * HTTP: PUT /products/{id}
     * 
     * IMPORTANTE: PUT reemplaza TODO el recurso
     * Si quieres actualización parcial, usa PATCH (como en jsonService)
     */
    async update(id, product) {
        const res = await fetch(`${this.baseUrl}/${id}`, {
            method: 'PUT',  // PUT = reemplazo completo
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        if (!res.ok) throw new Error('Error al actualizar producto');
        return res.json();
    }

    /**
     * MÉTODO: remove(id)
     * ------------------
     * PROPÓSITO: Eliminar producto
     * PARÁMETROS: id - ID del producto a eliminar
     * RETORNA: Promise<boolean> - true si se eliminó
     * HTTP: DELETE /products/{id}
     */
    async remove(id) {
        const res = await fetch(`${this.baseUrl}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Error al eliminar producto');
        return true;
    }
}

/**
 * EXPORT DEFAULT
 * --------------
 * Se exporta la clase para que otros archivos puedan instanciarla
 * 
 * USO:
 * import ProductService from './productService.js'
 * const service = new ProductService()
 * const products = await service.getAll()
 */
export default ProductService;
