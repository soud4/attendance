# Guía de Despliegue en Dokploy

## 1. ¿Cómo se empaqueta y persiste la Base de Datos?

Dado que SQLite es una base de datos basada en un archivo único (`data.sqlite`, junto a `data.sqlite-wal` y `data.sqlite-shm`), en contenedores Docker **no se debe almacenar dentro de la capa efímera del contenedor** porque se perdería en cada reinicio o nuevo despliegue.

### Solución Implementada:
1. La aplicación almacena la base de datos en el directorio configurable:
   ```env
   DATABASE_PATH=/app/data/data.sqlite
   ```
2. El contenedor declara `/app/data` como un **Volumen Persistente (`VOLUME ["/app/data"]`)**.
3. **Auto-inicialización Inteligente**:
   - Al arrancar el contenedor por primera vez en Dokploy con un volumen vacío, la aplicación crea automáticamente el esquema de tablas (`initSchema`) y si la base está vacía (o si `AUTO_SEED=true`), crea el evento de prueba para que la app esté 100% operativa de inmediato sin requerir scripts SQL manuales.

---

## 2. Configuración en Dokploy

### Opción A: Despliegue por Repositorio Git / Dockerfile (Recomendada)
1. En tu panel de Dokploy, ve a tu Proyecto y haz clic en **Create Application**.
2. Selecciona **GitHub** (o Git Provider) y enlaza este repositorio.
3. En la sección **Build**:
   - **Build Type**: `Dockerfile`
   - **Dockerfile Path**: `./Dockerfile`
4. En la sección **General**:
   - **Port**: `3000`
5. En la sección **Volumes** (¡Muy importante para la persistencia!):
   - **Volume Type**: Volume
   - **Mount Path**: `/app/data`
   - **Volume Name**: `asistencia-data`
6. En la sección **Environment** (opcional):
   - `AUTO_SEED=true` (si deseas que cree el evento demo la primera vez)
   - `PORT=3000`
7. Haz clic en **Deploy**.

---

### Opción B: Despliegue mediante Docker Compose en Dokploy
Si prefieres usar la función de **Compose** en Dokploy, simplemente pega el contenido de [docker-compose.yml](../docker-compose.yml):

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: bandera-asistencia
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_PATH=/app/data/data.sqlite
      - AUTO_SEED=true
    volumes:
      - asistencia-data:/app/data

volumes:
  asistencia-data:
    driver: local
```

---

## 3. Respaldos (Backups) en Dokploy

Para respaldar tu base de datos en producción:
- Como todo está en `/app/data/data.sqlite`, un backup es tan simple como descargar o copiar ese archivo.
- En Dokploy puedes usar la pestaña de **Backups** para respaldar el volumen `asistencia-data`, o ejecutar una copia desde la terminal del host:
  ```bash
  docker cp bandera-asistencia:/app/data/data.sqlite ./backup-$(date +%F).sqlite
  ```
