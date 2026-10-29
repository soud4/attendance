# Resumen de Empaquetado: Dockerfile Ultra-Optimizado y Despliegue en Dokploy

## 1. Empaquetado Ultra-Optimizado (Multi-Stage Dockerfile)

Se implementó el archivo [`Dockerfile`](../Dockerfile) utilizando **Bun sobre Alpine Linux** (`oven/bun:1-alpine`), logrando una imagen de producción de menos de 90 MB:

### Etapa 1: Builder
- Instala dependencias completas (incluyendo Tailwind CSS v4 CLI).
- Compila y minifica los estilos en `public/css/tailwind.css`.

### Etapa 2: Runner (Producción Ultra-Liviana)
- Solo instala dependencias de producción (`bun install --production`).
- Copia únicamente los archivos compilados y el código fuente.
- Se ejecuta bajo el usuario no privilegiado `bun` (seguridad hardened).
- Healthcheck nativo sin necesidad de herramientas externas como `curl`:
  ```dockerfile
  HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD bun -e 'fetch("http://localhost:3000/").then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))'
  ```

---

## 2. Gestión y Persistencia de la Base de Datos en Dokploy

### El Reto de SQLite en Contenedores
En Docker, el sistema de archivos del contenedor es efímero. Si la base de datos se guarda dentro del contenedor, cada vez que Dokploy actualice o reinicie la app, los registros de asistencia se perderían.

### La Solución Implementada
1. **Ruta Configurable de Base de Datos**:
   - `DATABASE_PATH=/app/data/data.sqlite` (con creación automática de directorios padre).
2. **Volumen Persistente Declarado**:
   - `VOLUME ["/app/data"]`
   - En Dokploy se monta un volumen persistente hacia `/app/data`.
3. **Auto-Inicialización y Auto-Seed**:
   - Al desplegar en un volumen nuevo, la app detecta automáticamente que la base no existe, inicializa las tablas (`initSchema`) y si está vacía siembra el evento demo para que el sistema esté operativo al instante.

---

## 3. Archivos Creados para el Despliegue

| Archivo | Propósito |
| :--- | :--- |
| [`Dockerfile`](../Dockerfile) | Configuración multi-etapa ultra optimizada con Bun + Alpine. |
| [`.dockerignore`](../.dockerignore) | Excluye `node_modules`, bases locales `*.sqlite*`, tests y documentación del contexto de build. |
| [`docker-compose.yml`](../docker-compose.yml) | Definición lista para desplegar en Dokploy (sección Compose) o pruebas locales. |
| [`docs/dokploy_deployment.md`](./dokploy_deployment.md) | Guía paso a paso de configuración y respaldos en Dokploy. |

---

## 4. Verificación de Tests

```bash
bun test
```
**Resultado: 14 tests pasados en 34 ms (0 fallos).**
