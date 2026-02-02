# 📚 Documentación Detallada - SimulacroRestaurante

## 🎯 Índice
1. [Visión General](#visión-general)
2. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
3. [Flujo de Datos](#flujo-de-datos)
4. [Guía de Reutilización](#guía-de-reutilización)
5. [Patrones de Diseño Utilizados](#patrones-de-diseño-utilizados)

---

## 🏗️ Visión General

Este proyecto es una **SPA (Single Page Application)** de un restaurante construida con **JavaScript Vanilla** (sin frameworks). Implementa un sistema completo de autenticación, gestión de productos, carrito de compras y panel de administración.

### Tecnologías Utilizadas
- **Frontend**: JavaScript ES6+ (Vanilla JS)
- **Backend Mock**: JSON Server (API REST simulada)
- **Estilos**: CSS3 con variables CSS
- **Arquitectura**: SPA con hash routing

---

## 📐 Arquitectura del Proyecto

```
SimulacroRestaurante/
│
├── index.html              # Punto de entrada HTML
├── styles.css              # Estilos globales
├── package.json            # Dependencias y scripts
│
└── src/
    ├── main.js             # 🧠 CEREBRO - Inicializa la app
    │
    ├── utils/
    │   └── constants.js    # 🔧 Configuración de URLs
    │
    ├── router/
    │   └── router.js       # 🚦 Sistema de navegación
    │
    ├── services/           # 📡 Capa de lógica de negocio
    │   ├── authService.js  # Autenticación y sesiones
    │   ├── jsonService.js  # Comunicación con API
    │   └── productService.js
    │
    ├── components/         # 🧩 Componentes reutilizables
    │   ├── Navbar.js
    │   ├── Card.js
    │   ├── orderCard.js
    │   └── Loading.js
    │
    ├── views/              # 📄 Vistas de la aplicación
    │   ├── login.js
    │   ├── register.js
    │   ├── menu.js
    │   ├── order.js
    │   └── adminDashboardView.js
    │
    └── state/
        └── db.json         # 💾 Base de datos simulada
```

---

## 🔄 Flujo de Datos Completo

### 1️⃣ Inicialización de la Aplicación

```
[Usuario abre la app]
         ↓
[index.html carga]
         ↓
[Ejecuta main.js] ← PUNTO DE ENTRADA
         ↓
[main.js registra eventos: 'load' y 'hashchange']
         ↓
[Se dispara evento 'load']
         ↓
[main.js llama a router()]
         ↓
[router.js lee window.location.hash]
         ↓
[router.js busca la vista correspondiente]
         ↓
[Ejecuta función de vista (ej: LoginView)]
         ↓
[Vista retorna elemento DOM]
         ↓
[router.js llama a render(viewNode)]
         ↓
[main.js inyecta contenido en #app]
         ↓
[Usuario ve la interfaz]
```

### 2️⃣ Flujo de Autenticación (Login)

```
[Usuario escribe email/password]
         ↓
[Click en "Sign In"]
         ↓
[LoginView.handleLogin() se ejecuta]
         ↓
[Llama a authService.login(email, pass)]
         ↓
[authService.login() hace GET a /users?email=...]
         ↓
[Compara contraseña]
         ↓
[Si OK: guarda usuario en localStorage]
         ↓
[Retorna { success: true, user: {...} }]
         ↓
[LoginView muestra mensaje de éxito]
         ↓
[Redirige a #menu con window.location.hash]
         ↓
[Se dispara 'hashchange']
         ↓
[router() detecta nueva ruta]
         ↓
[Renderiza menuView]
         ↓
[Usuario ve el menú]
```

### 3️⃣ Flujo de Navegación (SPA)

```
[Usuario hace click en <a href="#orders">]
         ↓
[Navegador cambia URL a #orders]
         ↓
[Se dispara evento 'hashchange']
         ↓
[main.js ejecuta router()]
         ↓
[router.js lee hash: '#orders']
         ↓
[Busca en objeto routes: routes['#orders'] = orderView]
         ↓
[Ejecuta orderView() - es async]
         ↓
[orderView hace fetch a /orders]
         ↓
[Obtiene pedidos del usuario]
         ↓
[Crea elementos DOM con los pedidos]
         ↓
[Retorna elemento DOM completo]
         ↓
[router.js llama a render(viewNode)]
         ↓
[main.js limpia #app y agrega nueva vista]
         ↓
[Usuario ve sus pedidos SIN recarga de página]
```

### 4️⃣ Flujo de Carrito de Compras

```
[Usuario ve menú de productos]
         ↓
[Click en "Add to order" en un producto]
         ↓
[menuView.addToCart(productId) se ejecuta]
         ↓
[Busca producto en array allProducts]
         ↓
[Verifica si ya está en cart[]]
         ↓
[Si existe: aumenta quantity]
[Si no: agrega nuevo item con quantity:1]
         ↓
[Llama a updateSidebarUI()]
         ↓
[updateSidebarUI() guarda cart en localStorage]
         ↓
[Actualiza contador de items]
         ↓
[Actualiza total a pagar]
         ↓
[Re-renderiza lista de items del cart]
         ↓
[Usuario ve el producto agregado en el sidebar]
         ↓
[Usuario click en "Confirm Order"]
         ↓
[handleConfirmOrder() prepara orderData]
         ↓
[Llama a jsonService.createOrder(orderData)]
         ↓
[jsonService hace POST a /orders]
         ↓
[json-server guarda pedido en db.json]
         ↓
[Retorna pedido creado con ID]
         ↓
[menuView limpia el carrito: cart = []]
         ↓
[Actualiza localStorage y UI]
         ↓
[Muestra mensaje "Order placed successfully!"]
```

### 5️⃣ Flujo CRUD de Productos (Admin)

#### Crear Producto
```
[Admin click en "+ Add product"]
         ↓
[menuView.openProductModal(null)]
         ↓
[Crea modal con formulario vacío]
         ↓
[Admin llena datos del producto]
         ↓
[Submit del formulario]
         ↓
[Lee datos del form: name, price, category, etc.]
         ↓
[Valida campos requeridos]
         ↓
[Llama a jsonService.createProduct(payload)]
         ↓
[jsonService hace POST a /products]
         ↓
[json-server crea producto con ID auto-generado]
         ↓
[Retorna producto creado]
         ↓
[menuView agrega producto a allProducts[]]
         ↓
[Re-renderiza grid de productos]
         ↓
[Cierra modal]
         ↓
[Admin ve nuevo producto en el menú]
```

#### Editar Producto
```
[Admin click en "Edit" en un producto]
         ↓
[menuView.openProductModal(product)]
         ↓
[Crea modal con formulario pre-llenado]
         ↓
[Admin modifica datos]
         ↓
[Submit del formulario]
         ↓
[Lee datos modificados]
         ↓
[Llama a jsonService.updateProduct(id, payload)]
         ↓
[jsonService hace PATCH a /products/{id}]
         ↓
[json-server actualiza producto]
         ↓
[Retorna producto actualizado]
         ↓
[menuView actualiza producto en allProducts[]]
         ↓
[Re-renderiza grid de productos]
         ↓
[Admin ve producto actualizado]
```

#### Eliminar Producto
```
[Admin click en "Delete" en un producto]
         ↓
[window.confirm("Delete this product?")]
         ↓
[Si usuario confirma:]
         ↓
[Llama a jsonService.deleteProduct(id)]
         ↓
[jsonService hace DELETE a /products/{id}]
         ↓
[json-server elimina producto de db.json]
         ↓
[menuView filtra producto de allProducts[]]
         ↓
[Re-renderiza grid de productos]
         ↓
[Admin ve que el producto ya no existe]
```

---

## 🔄 Imports y Exports - Mapa Completo

### 📤 EXPORTS (De dónde sale cada función)

#### `constants.js`
```javascript
export const API_URLS = { ... }
```
**¿Quién lo importa?**
- authService.js
- jsonService.js
- adminDashboardView.js

**Flujo:** `constants.js` → `servicios` → `vistas`

---

#### `main.js`
```javascript
export function render(viewNode) { ... }
```
**¿Quién lo importa?**
- router.js (ÚNICO importador)

**Flujo:** `main.js` → `router.js` → *usa render() para inyectar vistas*

---

#### `router.js`
```javascript
export async function router() { ... }
```
**¿Quién lo importa?**
- main.js (para registrar eventos)

**Flujo:** `router.js` → `main.js` → *se ejecuta en eventos load/hashchange*

---

#### `authService.js`
```javascript
export async function login(email, password) { ... }
export async function register(userData) { ... }
export function logout() { ... }
export function getCurrentUser() { ... }
export function isAuthenticated() { ... }
export function isAdmin() { ... }
export function requireAuth() { ... }
export function requireAdmin() { ... }
```
**¿Quién lo importa?**
- login.js (usa `login`)
- register.js (usa `register`)
- Navbar.js (usa `logout`, `getCurrentUser`)
- router.js (usa `getCurrentUser`)
- menu.js (usa `getCurrentUser`, `isAdmin`)
- order.js (usa `getCurrentUser`)
- adminDashboardView.js (usa `getCurrentUser`)

**Flujo:** `authService.js` → `vistas y componentes` → *gestión de sesiones*

---

#### `jsonService.js`
```javascript
export default class JsonService {
    async getProducts() { ... }
    async getProductById(id) { ... }
    async createProduct(product) { ... }
    async updateProduct(id, updates) { ... }
    async deleteProduct(id) { ... }
    async createOrder(orderData) { ... }
    async getOrderById(orderId) { ... }
}
```
**¿Quién lo importa?**
- Card.js (usa `getProductById`)
- orderCard.js (usa `getOrderById`)
- menu.js (usa TODOS los métodos)
- order.js (usa `getOrderById`)
- productService.js (herencia/composición)

**Flujo:** `jsonService.js` → `componentes y vistas` → *peticiones HTTP*

---

#### Componentes
```javascript
// Navbar.js
export function Navbar() { ... }

// Card.js
export async function Card(productId, isAdmin) { ... }

// orderCard.js
export async function OrderCard(orderId) { ... }

// Loading.js
export function LoadingView() { ... }
```
**¿Quién los importa?**
- `Navbar` → main.js, vistas
- `Card` → menu.js
- `OrderCard` → order.js
- `LoadingView` → menu.js, order.js, adminDashboardView.js

---

#### Vistas
```javascript
// login.js
export function LoginView() { ... }

// register.js
export function RegisterView() { ... }

// menu.js
export async function menuView() { ... }

// order.js
export async function orderView() { ... }

// adminDashboardView.js
export async function AdminDashboardView() { ... }
```
**¿Quién las importa?**
- router.js (TODAS las vistas)

**Flujo:** `views/*.js` → `router.js` → *mapeo de rutas*

---

## 🎨 Patrones de Diseño Utilizados

### 1. **Service Layer Pattern**
📁 Ubicación: `services/`

**Qué es:** Capa intermedia que encapsula toda la lógica de negocio y comunicación con APIs.

**Beneficios:**
- Separación de responsabilidades
- Código más testeable
- Reutilización de lógica

**Ejemplo:**
```javascript
// ❌ MAL: Lógica en la vista
async function LoginView() {
    // Vista hace fetch directamente
    const res = await fetch('http://localhost:3000/users?email=...')
    // ...
}

// ✅ BIEN: Lógica en el servicio
async function LoginView() {
    // Vista solo llama al servicio
    const result = await authService.login(email, password)
    // ...
}
```

---

### 2. **Router Pattern (SPA)**
📁 Ubicación: `router/router.js`

**Qué es:** Sistema de navegación basado en hash (#) para cambiar vistas sin recargar la página.

**Cómo funciona:**
```javascript
const routes = {
    '#menu': menuView,
    '#orders': orderView
}

// Usuario navega a #menu
// Se dispara 'hashchange'
// router() ejecuta menuView()
// render() inyecta la vista
```

**Beneficios:**
- Navegación instantánea (sin recargas)
- URLs navegables (back/forward funcionan)
- SEO amigable (con history API)

---

### 3. **Component Pattern**
📁 Ubicación: `components/`

**Qué es:** Funciones que retornan elementos DOM reutilizables.

**Ejemplo:**
```javascript
// Componente
export function Card(productId, isAdmin) {
    return `<article>...</article>`
}

// Uso
const cardHTML = await Card('p001', true)
container.innerHTML = cardHTML
```

**Beneficios:**
- Reutilización de UI
- Código más organizado
- Fácil de mantener

---

### 4. **MVC Adaptado**
```
Model      → jsonService.js (acceso a datos)
View       → views/*.js (UI)
Controller → router.js (coordina modelo y vista)
```

---

### 5. **Observer Pattern (Eventos)**
```javascript
// Observador: escucha cambios en la URL
window.addEventListener('hashchange', router)

// Observado: cambios en window.location.hash
window.location.hash = '#menu' // Dispara el evento
```

---

## 🚀 Guía de Reutilización

### ✅ Cómo reutilizar el Router en cualquier proyecto SPA

**Paso 1:** Copiar `router.js` a tu proyecto

**Paso 2:** Definir tus rutas
```javascript
const routes = {
    '#home': HomeView,
    '#about': AboutView,
    '#contact': ContactView
}
```

**Paso 3:** Crear las vistas
```javascript
// views/home.js
export function HomeView() {
    const main = document.createElement('main')
    main.innerHTML = '<h1>Home</h1>'
    return main
}
```

**Paso 4:** Inicializar en main.js
```javascript
import { router } from './router/router.js'

window.addEventListener('hashchange', router)
window.addEventListener('load', router)
```

**Paso 5:** Crear links de navegación
```html
<nav>
    <a href="#home">Home</a>
    <a href="#about">About</a>
    <a href="#contact">Contact</a>
</nav>
```

---

### ✅ Cómo reutilizar el Sistema de Autenticación

**Paso 1:** Copiar `authService.js`

**Paso 2:** Actualizar `constants.js` con tu API
```javascript
export const API_URLS = {
    USERS: 'https://tu-api.com/users'
}
```

**Paso 3:** Adaptar funciones según tu backend
```javascript
// Si tu backend usa JWT
export async function login(email, password) {
    const res = await fetch(`${API_URLS.AUTH}/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password })
    })
    const { token, user } = await res.json()
    
    // Guardar token en lugar de usuario completo
    localStorage.setItem('authToken', token)
    return { success: true, user }
}
```

**Paso 4:** Proteger rutas
```javascript
// En router.js
export async function router() {
    const hash = window.location.hash
    
    // Rutas protegidas
    const protectedRoutes = ['#profile', '#dashboard']
    
    if (protectedRoutes.includes(hash)) {
        requireAuth() // Lanza error si no autenticado
    }
    
    // ... resto del código
}
```

---

### ✅ Cómo reutilizar jsonService en cualquier API REST

**Paso 1:** Copiar `jsonService.js`

**Paso 2:** Adaptar métodos según tu API
```javascript
export default class ApiService {
    constructor(baseUrl) {
        this.baseUrl = baseUrl
    }
    
    // CRUD genérico
    async getAll(resource) {
        const res = await fetch(`${this.baseUrl}/${resource}`)
        return res.json()
    }
    
    async getById(resource, id) {
        const res = await fetch(`${this.baseUrl}/${resource}/${id}`)
        return res.json()
    }
    
    async create(resource, data) {
        const res = await fetch(`${this.baseUrl}/${resource}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        return res.json()
    }
    
    async update(resource, id, data) {
        const res = await fetch(`${this.baseUrl}/${resource}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        return res.json()
    }
    
    async delete(resource, id) {
        const res = await fetch(`${this.baseUrl}/${resource}/${id}`, {
            method: 'DELETE'
        })
        return res.ok
    }
}

// Uso
const api = new ApiService('https://api.miapp.com')
const users = await api.getAll('users')
const product = await api.getById('products', 123)
```

---

### ✅ Cómo reutilizar el Sistema de Carrito

**Paso 1:** Copiar lógica del carrito de `menu.js`

**Paso 2:** Crear servicio dedicado
```javascript
// services/cartService.js
export class CartService {
    constructor() {
        this.storageKey = 'shoppingCart'
    }
    
    load() {
        const stored = localStorage.getItem(this.storageKey)
        return stored ? JSON.parse(stored) : []
    }
    
    save(cart) {
        localStorage.setItem(this.storageKey, JSON.stringify(cart))
    }
    
    addItem(cart, product) {
        const existing = cart.find(item => item.product.id === product.id)
        if (existing) {
            existing.quantity++
        } else {
            cart.push({ product, quantity: 1 })
        }
        this.save(cart)
        return cart
    }
    
    removeItem(cart, productId) {
        const filtered = cart.filter(item => item.product.id !== productId)
        this.save(filtered)
        return filtered
    }
    
    updateQuantity(cart, productId, quantity) {
        const item = cart.find(i => i.product.id === productId)
        if (item) {
            item.quantity = quantity
            this.save(cart)
        }
        return cart
    }
    
    clear() {
        localStorage.removeItem(this.storageKey)
        return []
    }
    
    getTotals(cart) {
        const items = cart.reduce((sum, item) => sum + item.quantity, 0)
        const price = cart.reduce((sum, item) => 
            sum + (item.product.price * item.quantity), 0)
        return { items, price }
    }
}
```

**Paso 3:** Usar en cualquier vista
```javascript
import { CartService } from './services/cartService.js'

const cartService = new CartService()
let cart = cartService.load()

// Agregar producto
cart = cartService.addItem(cart, product)

// Obtener totales
const { items, price } = cartService.getTotals(cart)
```

---

## 📊 Diagrama de Dependencias

```
index.html
    ↓
main.js ←─────────────────┐
    ↓                      │
    ├→ Navbar.js          │
    └→ router.js          │
           ↓               │
           ├→ views/      │
           │   ├→ login.js ────→ authService.js ──→ constants.js
           │   ├→ register.js ──→ authService.js
           │   ├→ menu.js ──────→ jsonService.js ──→ constants.js
           │   │                 └→ Card.js ──→ jsonService.js
           │   ├→ order.js ─────→ orderCard.js ──→ jsonService.js
           │   └→ adminDashboardView.js ──→ authService.js
           │                                 └→ constants.js
           └──────────────────────┘
```

---

## 🔐 Seguridad y Mejores Prácticas

### ⚠️ Vulnerabilidades Actuales (Solo para desarrollo)

1. **Contraseñas en texto plano**
   - ❌ Actual: `password: "123456"` en db.json
   - ✅ Producción: Usar bcrypt/argon2 para hashear

2. **Sin tokens de autenticación**
   - ❌ Actual: Usuario completo en localStorage
   - ✅ Producción: Usar JWT con refresh tokens

3. **Validaciones solo en frontend**
   - ❌ Actual: Solo JavaScript valida
   - ✅ Producción: Backend debe validar TODO

4. **CORS no configurado**
   - ❌ Actual: json-server acepta cualquier origen
   - ✅ Producción: Configurar CORS estrictamente

### ✅ Mejoras Recomendadas para Producción

```javascript
// 1. Usar JWT
export async function login(email, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    
    const { accessToken, refreshToken, user } = await res.json()
    
    // Guardar tokens de forma segura
    localStorage.setItem('accessToken', accessToken)
    // Refresh token en httpOnly cookie (backend)
    
    return { success: true, user }
}

// 2. Interceptor para agregar token a todas las peticiones
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('accessToken')
    
    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        }
    })
}

// 3. Manejo de token expirado
async function refreshAccessToken() {
    const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include' // Envía refresh token desde cookie
    })
    
    const { accessToken } = await res.json()
    localStorage.setItem('accessToken', accessToken)
    return accessToken
}
```

---

## 📝 Resumen de Conceptos Clave

### 🔹 SPA (Single Page Application)
- Una sola página HTML que cambia dinámicamente
- No recarga el navegador al navegar
- Usa JavaScript para manipular el DOM

### 🔹 Hash Routing
- Navegación basada en el fragmento de URL (#)
- Ejemplo: `app.com/#menu`, `app.com/#orders`
- Detecta cambios con evento `hashchange`

### 🔹 LocalStorage
- Almacenamiento persistente en el navegador
- Sobrevive a recargas de página
- Solo almacena strings (usar JSON.stringify/parse)

### 🔹 Fetch API
- Interfaz moderna para hacer peticiones HTTP
- Reemplaza a XMLHttpRequest
- Retorna Promises (usar async/await)

### 🔹 ES6 Modules
- Sistema de imports/exports de JavaScript moderno
- Permite modularizar código
- Cada archivo es un módulo independiente

---

## 🎓 Conclusión

Este proyecto demuestra una arquitectura **escalable, mantenible y reutilizable** para aplicaciones web modernas sin usar frameworks. Los patrones y prácticas aquí implementados son transferibles a cualquier proyecto JavaScript.

### 🌟 Conceptos Clave Aprendidos:
✅ Arquitectura en capas (separación de responsabilidades)
✅ Sistema de routing para SPAs
✅ Gestión de estado con localStorage
✅ Comunicación con APIs REST
✅ Autenticación y autorización
✅ Componentes reutilizables
✅ CRUD completo
✅ Manejo de eventos del DOM
✅ Promises y async/await
✅ ES6 Modules (import/export)

---

**💡 Consejo Final:** Este código está comentado exhaustivamente en cada archivo. Lee los comentarios en:
- `main.js` - Inicialización
- `router.js` - Sistema de rutas
- `authService.js` - Autenticación
- `jsonService.js` - Comunicación con API
- `menu.js` - Lógica compleja de vista

¡Cada comentario explica el PORQUÉ y el CÓMO de cada decisión de diseño!
