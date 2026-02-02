// ============================================================================
// ARCHIVO: orderCard.js
// PROPÓSITO: Componente de tarjeta de pedido (muestra resumen de una orden)
// ============================================================================
// PATRÓN: Component Pattern - Función asíncrona que retorna HTML string
// SE USA EN: orderView.js (para listar pedidos del usuario)
// ============================================================================

/**
 * IMPORT: JsonService
 * -------------------
 * ORIGEN: ../services/JsonService.js
 * PROPÓSITO: Obtener datos del pedido desde la API
 * FLUJO: OrderCard.js → JsonService → API → retorna datos del pedido
 */
import JsonService from '../services/JsonService.js';

/**
 * FUNCIÓN EXPORTADA: OrderCard(orderId)
 * --------------------------------------
 * PROPÓSITO: Generar HTML de una tarjeta de pedido
 * 
 * PARÁMETROS:
 *   - orderId: string|number - ID del pedido a mostrar
 * 
 * RETORNA: Promise<string>
 *   - String con HTML completo de la tarjeta del pedido
 * 
 * SE USA EN:
 *   - orderView.js: await OrderCard(order.id)
 *   - Se genera una tarjeta por cada pedido del usuario
 * 
 * CARACTERÍSTICAS:
 *   - Muestra ID del pedido
 *   - Fecha y hora de creación
 *   - Lista de productos con cantidad
 *   - Precio total
 *   - Estado del pedido (pending, preparing, ready, delivered)
 *   - Icono de estado visual
 * 
 * FLUJO COMPLETO:
 * 1. Recibe orderId
 * 2. Crea instancia de JsonService
 * 3. Hace GET a /orders/{orderId}
 * 4. Mapea datos de la API a estructura interna
 * 5. Genera HTML con lista de items
 * 6. Aplica estilos según estado (pending, delivered, etc.)
 * 7. Retorna HTML completo
 * 
 * ESTRUCTURA DEL PEDIDO:
 * {
 *   id: 'o001',
 *   userId: 'u001',
 *   user: { name: 'John', email: 'john@email.com' },
 *   items: [{ productId, name, price, quantity }, ...],
 *   total: 59.99,
 *   status: 'pending',
 *   createdAt: '2024-06-15T14:30:00Z'
 * }
 * 
 * ESTADOS POSIBLES:
 * - pending: Pedido recibido, esperando preparación
 * - preparing: En cocina
 * - ready: Listo para recoger/entregar
 * - delivered: Entregado al cliente
 * - cancelled: Cancelado
 * 
 * CÓMO REUTILIZAR EN OTROS PROYECTOS:
 * 1. Copiar esta función
 * 2. Adaptar estructura de datos según tu API
 * 3. Modificar HTML según tu diseño
 * 4. Agregar más estados si necesitas
 * 5. Considerar agregar botones de acción (cancelar, rastrear, etc.)
 */
export async function OrderCard(orderId) {
    // 1. Crear instancia del servicio de API
    const service = new JsonService();
    
    // 2. Obtener datos del pedido desde la API
    //    Esto hace: GET /orders/{orderId}
    const order = await service.getOrderById(orderId);

    // 3. Mapear datos de la API a estructura interna
    //    POR QUÉ: Separar datos de la API de la lógica de UI
    //    BENEFICIO: Si la API cambia, solo modificamos aquí
    const data = {
        id: order.id,                                    // ID único del pedido
        status: order.status,                            // Estado actual (pending, delivered, etc.)
        createdAt: order.createdAt,                      // Timestamp de creación
        total: order.total,                              // Precio total del pedido
        userName: order.user?.name || 'Guest',           // Nombre del usuario (con fallback)
        userEmail: order.user?.email || '',              // Email del usuario
        items: order.items || []                         // Array de productos pedidos
    };

    // 4. Retornar HTML completo de la tarjeta del pedido
    //    ESTRUCTURA: article > icono de estado + info del pedido + acciones
    //    NOTA: Se usa .map() para generar HTML de cada item
    return `
        <article class="list-item">
            <!-- Icono de estado visual (color según status en CSS) -->
            <div class="status-icon ${data.status}">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <!-- Círculo -->
                    <path d="M12 22C17.5228 22 22 17.5228 22 12
                             C22 6.47715 17.5228 2 12 2
                             C6.47715 2 2 6.47715 2 12
                             C2 17.5228 6.47715 22 12 22Z"
                          stroke="currentColor" stroke-width="2"/>
                    <!-- Check mark -->
                    <path d="M8 12L11 15L16 9"
                          stroke="currentColor" stroke-width="2"
                          stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>

            <!-- Información principal del pedido -->
            <div class="order-info">
                <!-- ID del pedido con formato #o001 -->
                <h3 class="order-id">Order \#${data.id}</h3>
                
                <!-- Fecha de creación y cantidad de items -->
                <p class="order-meta">
                    ${new Date(data.createdAt).toLocaleString()} ·
                    ${data.items.length} item(s)
                </p>
                
                <!-- Lista de productos del pedido -->
                <div class="detail-items">
                    ${data.items
        .map(
            item => `
                        <div class="detail-item">
                            <!-- Cantidad del producto -->
                            <span class="item-quantity">${item.quantity}x</span>
                            <div>
                                <!-- Nombre del producto -->
                                <div class="item-title">${item.name}</div>
                                <!-- Precio unitario -->
                                <div class="item-note">$ ${item.price.toFixed(2)}</div>
                            </div>
                        </div>`
        )
        .join('') /* .join('') convierte array de strings en un solo string HTML */}
                </div>
            </div>

            <!-- Acciones y estado del pedido -->
            <div class="order-actions">
                <!-- Total a pagar -->
                <span class="order-total">$ ${data.total.toFixed(2)}</span>
                
                <!-- Badge con estado (pending, delivered, etc.) -->
                <span class="status-badge ${data.status}">
                    ${data.status}
                </span>
            </div>
        </article>
    `;

}
