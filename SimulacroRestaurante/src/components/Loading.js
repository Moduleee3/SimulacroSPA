// ============================================================================
// ARCHIVO: Loading.js
// PROPÓSITO: Componente de estado de carga (loading spinner)
// ============================================================================
// PATRÓN: Component Pattern - Función que retorna HTML string
// SE USA EN: Todas las vistas mientras cargan datos de la API
// ============================================================================

/**
 * FUNCIÓN EXPORTADA: LoadingView()
 * ---------------------------------
 * PROPÓSITO: Mostrar indicador visual de carga mientras se obtienen datos
 * 
 * RETORNA: String con HTML del loading spinner
 * 
 * SE USA EN:
 * - menuView: Mientras carga productos
 * - orderView: Mientras carga pedidos
 * - adminDashboardView: Mientras carga métricas
 * 
 * FLUJO DE USO:
 * 1. Vista inicia carga de datos
 * 2. Muestra LoadingView() inmediatamente
 * 3. Hace petición a la API (await fetch)
 * 4. Reemplaza LoadingView() con datos reales
 * 
 * EJEMPLO DE USO:
 * const productGrid = document.createElement('div')
 * productGrid.innerHTML = LoadingView()  // Mostrar loading
 * const products = await api.getProducts()  // Cargar datos
 * productGrid.innerHTML = renderProducts(products)  // Mostrar datos
 * 
 * ESTILOS CSS ASOCIADOS:
 * - .loading-container: Centrado y espaciado
 * - .loading-spinner: Animación de rotación (keyframes)
 * - .loading-title: Texto principal
 * - .loading-subtitle: Texto secundario
 * 
 * ANIMACIÓN:
 * El spinner rota infinitamente gracias a:
 * @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
 * 
 * CÓMO REUTILIZAR EN OTROS PROYECTOS:
 * 1. Copiar esta función
 * 2. Adaptar los textos de título y subtítulo
 * 3. Copiar los estilos CSS del loading
 * 4. Usar en cualquier lugar que cargue datos async
 * 5. Considerar agregar parámetro para personalizar mensaje:
 *    LoadingView('Cargando productos...', 'Conectando con la API')
 */
export function LoadingView() {
    return `
        <div class="container">
            <div class="loading-container">
                <!-- Spinner animado (definido en CSS) -->
                <div class="loading-spinner"></div>
                
                <!-- Mensaje principal de carga -->
                <p class="loading-title">Cargando datos climáticos...</p>
                
                <!-- Mensaje secundario (contexto adicional) -->
                <p class="loading-subtitle">Conectando con la API Open-Meteo</p>
            </div>
        </div>`;
}