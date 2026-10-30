# Sistema de Asistencia — Panel Administrativo, Módulos, Mapa Interactivo y Optimización Mobile

## 1. Resumen de la Implementación Integral

Se han completado e integrado en la rama `main` todas las fases del sistema de asistencia con arquitectura MVC, renderizado server-side ultraliviano con **Hono JSX** y desarrollo multi-agente en Git Worktrees independientes.

---

### 2. Principales Capacidades Implementadas

#### A. Selector de Mapa Interactivo (Leaflet + OpenStreetMap) y Geocodificación Inversa
- **Mapa Leaflet 1.9.4 Embebido**: Integrado en la creación de eventos ([`EventFormView`](file:///home/souda/Laboratory/bandera-asistencia/src/views/admin/event_form_view.tsx)), edición ([`EventEditView`](file:///home/souda/Laboratory/bandera-asistencia/src/views/admin/event_edit_view.tsx)) y en el modal del dashboard ([`DashboardView`](file:///home/souda/Laboratory/bandera-asistencia/src/views/admin/dashboard_view.tsx)).
- **Marcador Arrastrable**: Permite hacer clic en cualquier punto del mapa o arrastrar el pin; actualiza latitud y longitud en tiempo real.
- **Círculo de Radio en Vivo**: Dibuja el radio de cobertura permitido (`radius_meters`) y se redimensiona al presionar los presets (50m, 100m, 150m, 200m, 500m).
- **Geocodificación con OpenStreetMap (Nominatim Proxy)**: Endpoint [`GET /api/geo/reverse`](file:///home/souda/Laboratory/bandera-asistencia/src/routes/api/geo.ts) con cabecera `User-Agent: BanderaAsistencia/1.0` que autocompleta el nombre de la sede al soltar el pin.
- **Enlace a Google Maps**: Botón dinámico que abre `https://www.google.com/maps?q=lat,lon` para verificación visual.

#### B. Cierre Automático de Eventos por Horario y Nueva Interfaz Pública
- **Detección de Expiración**: [`EventService.isEventExpired`](file:///home/souda/Laboratory/bandera-asistencia/src/services/event.service.ts) y [`EventService.checkAutoClose`](file:///home/souda/Laboratory/bandera-asistencia/src/services/event.service.ts) cierran automáticamente en base de datos cualquier evento cuya hora/fecha de fin haya vencido.
- **Bloqueo de Asistencias**: [`AttendanceService.register`](file:///home/souda/Laboratory/bandera-asistencia/src/services/attendance.service.ts) rechaza intentos de marcación posteriores al cierre programado con un mensaje amigable.
- **Interfaz Pública (`/asistir/:code`)**:
  - Fecha del evento formateada en español (ej: *"Jueves, 29 de Octubre de 2026"*).
  - Hora de apertura y hora de cierre con iconos SVG.
  - Badge dinámico: *"Abierto para registro hasta las HH:mm"* o *"Finalizado automáticamente por horario"*.

#### C. Optimización Mobile (Cards Comprimidas en vez de Tablas que Desbordan)
- **Dashboard (`DashboardView`)**: En vista tabla para móvil (`block md:hidden`), presenta tarjetas comprimidas con estado, título, sede, radio y botones de acción.
- **Coordinadores (`UsersView`)**: Vista móvil compacta con DNI, nombre, rol, estado y botones de activación/eliminación.
- **Asistencias (`AttendancesView`)**: Tarjetas móviles compactas con DNI, sede, hora y distancia, compatibles con el buscador en vivo.
- **Detalle de Evento (`EventDetailView`)**: Asistentes en formato comprimido sin scroll horizontal forzado.
- **Métricas 2 por línea**: En móvil, las estadísticas del dashboard se organizan en `grid-cols-2` con padding optimizado.

#### D. Limpieza y Alineación de Formularios
- En [`UsersView`](file:///home/souda/Laboratory/bandera-asistencia/src/views/admin/users_view.tsx), se eliminaron paréntesis explicativos redundantes (`DNI *`, `Nombre completo *`, `Contraseña *`).
- El selector de **Rol** y el botón **+ Crear** cuentan con altura estandarizada `h-10` y alineación `items-end`, coincidiendo a la perfección con el resto de campos.

#### E. Paginación por Cursores y Caché en Memoria
- **Paginación por Cursores**: Parámetros opcionales `{ cursor, limit }` en `EventService`, `AttendanceService` y `UserService` para consultas escalables con `WHERE id < $cursor ORDER BY id DESC LIMIT $limit`.
- **In-Memory Code Cache**: `EventService.codeExists(code)` verifica códigos públicos en **O(1)** (< 10 nanosegundos) usando un `Set<string>` en memoria RAM con autoinvalidación inteligente ante cambios de base de datos, evitando consultas SQL repetitivas en rutas 404 y polling de clientes.

#### F. Conexión Singleton SQLite y Centralización de Constantes y Entorno
- **Singleton DatabaseConnection**: Implementado en [`src/db/index.ts`](file:///home/souda/Laboratory/bandera-asistencia/src/db/index.ts) con configuración PRAGMA aislada (WAL mode, busy_timeout de 5000ms) y caché de Prepared Statements (`DatabaseConnection.prepare`) para evitar recompilación de bytecode SQL en peticiones HTTP recurrentes.
- **Configuración Centralizada**: Archivos `.env.example`, `.env`, [`src/config/constants.ts`](file:///home/souda/Laboratory/bandera-asistencia/src/config/constants.ts) y [`src/config/env.ts`](file:///home/souda/Laboratory/bandera-asistencia/src/config/env.ts), eliminando valores mágicos (DNI regex, radio terrestre, límites de paginación, puerto, JWT secret) en todo el código.

#### G. Modal de Edición Minimalista Fullscreen en Móvil y View Transitions API
- **Modal de Edición Fullscreen**: En [`src/views/admin/event_edit_view.tsx`](file:///home/souda/Laboratory/bandera-asistencia/src/views/admin/event_edit_view.tsx), se eliminaron textos redundantes y párrafos sobreexplicativos. En móvil, ocupa el 100% de la pantalla (`fixed inset-0 z-50 w-full h-full bg-neutral-950 p-4`) brindando una experiencia nativa sin desbordes.
- **View Transitions API**: Habilitado en los layouts con `<meta name="view-transition" content="same-origin" />` y CSS `@view-transition { navigation: auto; }`, permitiendo transiciones suaves entre el listado y la edición de eventos sin parpadeos de pantalla.

#### H. Control de Permanencia: Doble Marcación (Check-in & Check-out)
- **Problema Solucionado**: Asistentes que marcan su presencia y se van de inmediato del evento.
- **Flujo en Dos Pasos**:
  1. **Entrada (Check-in)**: Registra la hora de llegada, geocerca GPS y emite la cookie segura `att_<code_evento>=<dni>`.
  2. **Salida (Check-out)**: Al pulsar **"Marcar salida"**, valida que el asistente continúe físicamente en el radio del evento y realiza un `UPDATE attendances SET check_out_at = datetime('now')`.
  3. **Tercer Intento**: Si el asistente ya completó tanto entrada como salida, el sistema responde informando que la asistencia ya concluyó (código 409).
- **Interfaz Reactiva**:
  - Estado Inicial: DNI activo y botón azul *"Registrar asistencia"*.
  - Tras Entrada: DNI bloqueado, aviso ámbar con hora de ingreso y botón verde esmeralda *"Marcar salida"*. Si el celular recarga la página, la cookie rehidrata inmediatamente el botón de salida.
  - Tras Salida: Tarjeta con doble check esmeralda, hora de entrada, hora de salida y confirmación de permanencia.
- **Panel Administrativo y Exportación CSV**:
  - En [`AttendancesView`](file:///home/souda/Laboratory/bandera-asistencia/src/views/admin/attendances_view.tsx) y [`EventDetailView`](file:///home/souda/Laboratory/bandera-asistencia/src/views/admin/event_detail_view.tsx), se visualizan columnas separadas de **Entrada** y **Salida** (o badge *"En curso"* si aún no marcó salida).
  - La exportación CSV incluye la columna `Fecha_Hora_Salida`.

#### I. Visualización de Últimos 4 Eventos en la Interfaz Pública Principal (`/`)
- **Límite y Orden**: Se listan únicamente los últimos 4 eventos creados, ordenados por antigüedad decreciente (`created_at DESC`), garantizando que los más recientes aparezcan primero.
- **Detección Dinámica de Estado**: [`EventService.getLatestPublicEvents`](file:///home/souda/Laboratory/bandera-asistencia/src/services/event.service.ts) evalúa el auto-cierre y el horario programado de cada evento.
- **Interactividad y Bordes Diferenciados**:
  - **Eventos Activos (En el tiempo establecido)**:
    - Destacados con **borde esmeralda prominente** (`border-2 border-emerald-500/80`), sombra con glow y punto verde pulsante.
    - **Totalmente pulseables**: Enlace activo directo a `/asistir/:code` para registrar asistencia presencial.
  - **Eventos Inactivos / Finalizados / Cerrados**:
    - Borde atenuado (`border-neutral-800`), opacidad reducida (`opacity-60`) y badge gris *"Finalizado"*.
    - **No pulseables**: Bloqueados con `cursor-not-allowed` y sin enlace activo, impidiendo accesos indebidos a eventos concluidos.
- **Diseño Responsive**: Cuadrícula de 2 columnas en desktop/tablet y 1 columna en móvil en [`WelcomeView`](file:///home/souda/Laboratory/bandera-asistencia/src/views/public/welcome_view.tsx).

---

### 3. Verificación de Calidad

```bash
# Verificación de TypeScript
$ bun run typecheck
✓ No type errors in 48 files [112.11ms]

# Compilación de estilos
$ bun run build:css
≈ tailwindcss v4.3.3
Done in 67ms

# Suite Completa de Tests
$ bun test
 96 pass
 0 fail
 402 expect() calls
Ran 96 tests across 9 files. [3.78s]
```

- `tests/public_events.test.ts`: 4 tests (Límite de 4 eventos, orden DESC, enlaces pulseables solo si activo y bordes esmeralda).
- `tests/attendance_checkout.test.ts`: 6 tests (Flujo completo Check-in, Check-out, geocerca de salida, cookie y rehidratación).
- `tests/attendance.test.ts`: 8 tests (Validación Haversine, formato DNI, check-in/check-out y unicidad).
- `tests/mobile_and_pagination.test.ts`: 8 tests (Tarjetas comprimidas, alineación y cursores).
- `tests/auto_close_map.test.ts`: 17 tests (Auto-cierre, proxy Nominatim, fechas y badges).
- `tests/admin_crud.test.ts`: 17 tests (CRUD de eventos, coordinadores, vistas duales y CSV con horas de salida).
- `tests/errors.test.ts`: 16 tests (404, 401, 403, 500 y negociación de contenido).
- `tests/admin.test.ts`: 14 tests (Autenticación y sesiones Argon2id/JWT).
- `tests/db.test.ts`: 6 tests (Esquemas e integridad SQLite con columna `check_out_at`).
