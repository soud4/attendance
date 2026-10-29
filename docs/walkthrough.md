# Sistema de Asistencia — Panel Administrativo, Módulos y CRUD Completo

## 1. Resumen de la Implementación

Se ha expandido el **Panel Administrativo** implementando las mejores prácticas de ingeniería de software, arquitectura MVC en capas estrictas y renderizado server-side ultraliviano con **Hono JSX**:

1. **Sidebar de Navegación Lateral (macOS Dark)**:
   - Diseño responsivo: barra lateral izquierda fija en escritorio (`w-64`) y drawer desplegable con menú hamburguesa en móviles.
   - **Módulos Activos**: Acceso y estado activo para *Eventos Presenciales* (`/admin`), *Registro de Asistencias* (`/admin/attendances`) y *Coordinadores / Personal* (`/admin/users`).
   - **Módulos en Construcción**: Visor de módulos futuros marcados como desactivados (`opacity-50 cursor-not-allowed select-none`) con badges discretos *«Pronto»*: *Padrón General*, *Sedes y Locales*, y *Auditoría de Accesos*.
   - Tarjeta de sesión con datos del usuario (Nombre, DNI, rol `ADMIN`/`STAFF`) y botón de cierre de sesión.

2. **Visualización Dual en el Dashboard (Tarjetas vs Tabla)**:
   - Conmutador interactivo de vistas (`/admin?view=cards` y `/admin?view=table`).
   - **Vista de Tarjetas**: Visualización moderna con badges animados de estado (Abierto/Cerrado), contador de asistencias en tiempo real, enlace público para copiar en 1 clic y barra de acciones.
   - **Vista de Tabla**: Tabla de datos compacta tipo consola administrativa con columnas para Estado, Título, Sede, Radio, Horario, Asistentes y menú de acciones rápidas (Detalle, Editar, Conmutar, Eliminar).

3. **CRUD Completo de Eventos**:
   - **Crear** (`GET /admin/events/new` & `POST /admin/events`): Formulario con captura de coordenadas GPS en 1 clic (`navigator.geolocation`).
   - **Detalle y Asistentes** (`GET /admin/events/:id`): Métricas geográficas, enlace público, enlace directo a Google Maps (`https://www.google.com/maps?q=lat,lon`) y listado detallado de asistentes con distancia y precisión.
   - **Editar** (`GET /admin/events/:id/edit` & `POST /admin/events/:id/edit`): Modificación de título, lugar, coordenadas, radio y estado.
   - **Eliminar** (`POST /admin/events/:id/delete`): Eliminación atómica en una transacción SQLite (`DELETE FROM attendances` + `DELETE FROM events`).
   - **Conmutar Estado** (`POST /admin/events/:id/toggle`): Apertura o cierre de registros con un solo clic.

4. **Módulo de Gestión de Coordinadores (`/admin/users`)**:
   - Listado de coordinadores y usuarios del sistema con badge de rol (`ADMIN`/`STAFF`) y estado (`Activo`/`Inactivo`).
   - Registro de nuevo coordinador con validación estricta de DNI (8 dígitos numéricos) y hashing seguro con Argon2id.
   - Conmutador de estado activo/inactivo (`POST /admin/users/:id/toggle`).
   - Eliminación de coordinador con protección explícita para la cuenta del Administrador Principal (`00000000`).

5. **Módulo Centralizado de Asistencias (`/admin/attendances`)**:
   - Registro unificado de todas las marcaciones georreferenciadas a nivel global.
   - Buscador en tiempo real por DNI o nombre del evento sin recargar la página.
   - Exportador a **CSV** (`GET /admin/attendances/export`) compatible con Excel/Google Sheets según el estándar RFC-4180 con cabecera `Content-Disposition`.

---

## 2. Estructura de Componentes

```
src/
├── controllers/
│   ├── auth.controller.tsx
│   ├── events.controller.tsx            # index (cards/table), renderCreate, create, show, renderEdit, update, delete, toggle
│   ├── attendance.controller.tsx        # público: asistencia geolocalizada
│   ├── users.controller.tsx             # index, create, toggle, delete
│   ├── attendances_admin.controller.tsx # index, exportCsv
│   └── index.ts
├── services/
│   ├── auth.service.ts
│   ├── event.service.ts                 # CRUD y métricas de eventos
│   ├── attendance.service.ts            # Cálculo Haversine, registro y listado global
│   ├── user.service.ts                  # CRUD usuarios, Argon2id y protección de superadmin
│   ├── errors.ts                        # Excepciones de dominio tipadas
│   └── index.ts
├── routes/admin/
│   ├── auth.ts
│   ├── events.ts
│   ├── users.ts
│   └── attendances.ts
├── views/
│   ├── layouts/
│   │   └── admin_layout.tsx             # Layout macOS Dark con Sidebar responsivo y módulos bloqueados
│   ├── admin/
│   │   ├── dashboard_view.tsx           # Vista dual (Cards / Table) y estadísticas
│   │   ├── event_form_view.tsx          # Crear evento + GPS
│   │   ├── event_edit_view.tsx          # Editar evento + GPS
│   │   ├── event_detail_view.tsx        # Detalle de evento + tabla de asistentes
│   │   ├── users_view.tsx               # CRUD coordinadores
│   │   └── attendances_view.tsx         # Registro global + buscador en vivo + CSV
│   └── errors/
│       └── error_view.ts                # 404, 401, 403, 500
```

---

## 3. Verificación y Calidad de Código

### Tipado Estricto
```bash
$ bun run typecheck
$ bun check
✓ No type errors in 39 files [66.81ms]
```

### Compilación de Estilos
```bash
$ bun run build:css
≈ tailwindcss v4.3.3
Done in 67ms
```

### Suite Completa de Pruebas Automatizadas
```bash
$ bun test
 61 pass
 0 fail
 227 expect() calls
Ran 61 tests across 5 files. [3.43s]
```
- `tests/errors.test.ts`: 15 tests (404, 401, 403, 500 con negociación de contenido).
- `tests/admin.test.ts`: 14 tests (Login, cookies de sesión JWT, dashboard inicial).
- `tests/admin_crud.test.ts`: 17 tests (Vistas duales, CRUD eventos, CRUD coordinadores, exportación CSV, control de acceso STAFF vs ADMIN).
- `tests/attendance.test.ts`: 8 tests (Validación GPS Haversine, DNI 8 dígitos, unicidad).
- `tests/db.test.ts`: 7 tests (Restricciones e integridad referencial SQLite).
