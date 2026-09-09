# Inventario Web con Docker

Proyecto práctico de contenerización y orquestación de una aplicación web de inventario, desarrollada con JavaScript, Node.js, PostgreSQL y Nginx, utilizando el ecosistema de **Docker** y **Docker Compose**.

---

## Sobre el Proyecto

### ¿Qué hace la aplicación?
Permite administrar productos en tiempo real (creación, listado, actualización de stock y eliminación). 
* **Frontend:** Interfaz dinámica desarrollada en HTML5, CSS y JavaScript.
* **Backend:** API REST construida con Node.js y Express.
* **Base de Datos:** Motor relacional PostgreSQL.

### ¿Por qué se implementó con Docker?
El objetivo principal de contenerizar este aplicativo es:
1. **Eliminar el problema de *"en mi máquina sí funciona"*:** Garantiza que el software corra de forma idéntica en cualquier sistema operativo (Windows, Linux, macOS) sin requerir instalaciones locales de Node.js ni PostgreSQL.
2. **Aislamiento y Seguridad:** La base de datos y la API no exponen sus puertos directamente a la máquina anfitriona; todo el tráfico se canaliza y protege mediante un proxy inverso.
3. **Despliegue Inmediato:** Permite levantar la infraestructura completa (servidor web, servidor de aplicaciones y base de datos con sus tablas precargadas) en cuestión de segundos con un único comando.

---

## Contenerización del Proyecto

Para lograr la contenerización completa se siguieron los siguientes pasos técnicos:

1. **Contenerización del Backend (`./backend/Dockerfile`):**
   * Se utilizó la imagen oficial `node:20-alpine` por su ligereza y seguridad.
   * Se implementó `.dockerignore` para excluir `node_modules` locales y evitar incompatibilidad de binarios.
   * Se separó la copia de `package*.json` antes del código fuente para aprovechar el sistema de capas de caché de Docker.

2. **Contenerización del Frontend y Proxy Inverso (`./frontend/Dockerfile`):**
   * Se utilizó `nginx:alpine` tanto para servir los archivos web estáticos como para actuar de **Proxy Inverso**.
   * Su configuración (`nginx.conf`) redirige de forma transparente las peticiones `/api/*` hacia el contenedor backend, evitando problemas de CORS.

3. **Aprovisionamiento y Persistencia de la Base de Datos:**
   * Se utilizó `postgres:15-alpine`.
   * Se vinculó un script SQL (`./database/init.sql`) al directorio `/docker-entrypoint-initdb.d/` para crear automáticamente las tablas y datos iniciales en el primer arranque.
   * Se configuró un volumen persistente (`pgdata`) para que la información no se pierda al apagar los contenedores.

4. **Orquestación con Docker Compose (`docker-compose.yml`):**
   * Se integraron los 3 servicios bajo una red privada común (`inv_network`).
   * Se definieron dependencias de inicio (`depends_on`) para asegurar que la base de datos inicie antes que la API, y la API antes que el frontend.
   * Se inyectaron credenciales y variables de entorno de forma desacoplada.

---

## Estructura del Proyecto

```text
Docker-JS/
├── backend/                  # Servicio API REST (Node.js & Express)
│   ├── src/                  # Código fuente de la API
│   │   ├── config/           # Conexión al pool de PostgreSQL
│   │   ├── controllers/      # Lógica de negocio de inventario
│   │   ├── routes/           # Definición de endpoints
│   │   └── server.js         # Punto de entrada de la aplicación Express
│   ├── .dockerignore         # Exclusión de dependencias locales
│   ├── Dockerfile            # Construcción de la imagen con node:20-alpine
│   └── package.json          # Dependencias y scripts del backend
│
├── frontend/                 # Interfaz de Usuario y proxy inverso
│   ├── public/               # Archivos estáticos de la aplicación
│   │   ├── css/              # Estilos de la interfaz web
│   │   ├── js/               # Lógica del cliente y consumo de la API
│   │   └── index.html        # Vista interactiva del inventario
│   ├── Dockerfile            # Construcción del servidor con nginx:alpine
│   └── nginx.conf            # Configuración de Nginx y reglas de proxy inverso
│
├── database/                 # Aprovisionamiento inicial de datos
│   └── init.sql              # Estructura de tablas y registros iniciales
│
└── docker-compose.yml        # Orquestación declarativa de servicios, red y volumen
```
---
## Instalación y Ejecución

### Requisitos Previos
* Tener instalado y en ejecución [Docker Desktop](https://www.docker.com/).

---

### Pasos de Ejecución

#### 1. Clonar el repositorio
Abre una terminal y clona el proyecto en tu equipo local:
```bash
git clone https://github.com/Isaac-9026/Docker-JS.git
cd Docker-JS
```

#### 2. Construir y levantar los contenedores
Ejecuta el siguiente comando para compilar las imágenes locales y arrancar todos los servicios en segundo plano:
```bash
docker compose up -d --build
```

#### 3. Verificar que los servicios estén activos
Confirma que los tres contenedores se encuentren en estado de ejecución (`Up`):
```bash
docker compose ps
```

#### 4. Acceder a la aplicación
Una vez desplegado el entorno, abre tu navegador web:
* **Interfaz Web:** [http://localhost](http://localhost)
* **API REST (JSON):** [http://localhost/api/products](http://localhost/api/products)

---

## Comandos útiles de Docker

```bash
# Ver estado y salud de los contenedores
docker compose ps

# Monitorear logs en tiempo real
docker compose logs -f

# Detener los contenedores (preservando datos)
docker compose down

# Detener y reiniciar la base de datos limpia
docker compose down -v
```