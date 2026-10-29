# Plan de Rediseño: Header, Footer y Modal Minimalista

## 1. Descripción del Objetivo
Ajustar la interfaz pública de asistencia (`/asistir/:code`) para lograr una estructura mucho más limpia, minimalista y jerárquica:
1. **Header y Footer Sólidos**:
   - Cabecera fija/superior con fondo sólido bien definido (`bg-slate-900`) que aloja de forma centrada y minimalista los indicadores de estado (Red y GPS) y branding del sistema.
   - Pie de página sólido (`bg-slate-900`) con información legal/técnica mínima y centrada.
2. **Eliminación del Abuso de Bordes**:
   - Reemplazar el exceso de líneas de borde por **contrastes de fondos sólidos** (`bg-slate-950` en el lienzo, `bg-slate-900` en barras, `bg-slate-800` en el modal/tarjeta, `bg-slate-900` en campos de entrada).
3. **Jerarquía del Contenido**:
   - **Fuera del modal**: Encabezado centrado con el texto **«Registro de Asistencia»** e instrucciones mínimas.
   - **Dentro del modal/tarjeta**: Exclusivamente la información del evento:
     - **Título del Evento**.
     - **Ubicación** (nombre del lugar / radio de cobertura).
     - **Fecha con hora de inicio y hora de cierre**.
     - Formulario de DNI y botón de registro.

---

## 2. Blueprint de la Nueva Estructura

```text
┌─────────────────────────────────────────────────────────────────┐
│ HEADER (bg-slate-900 - Sólido, Centrado, Minimalista)           │
│      [SVG WIFI] Conexión Activa   |   [SVG GPS] GPS Listo       │
└─────────────────────────────────────────────────────────────────┘

   FUERA DEL MODAL (Centrado en bg-slate-950)
   "REGISTRO DE ASISTENCIA"
   Verifica tu presencia en el evento ingresando tu DNI

   ┌───────────────────────────────────────────────────────────┐
   │ MODAL / TARJETA CENTRAL (bg-slate-800 - Fondo Sólido)     │
   │                                                           │
   │ Conferencia Anual de Operaciones 2026                     │
   │                                                           │
   │ 📍 Ubicación: Auditorio Central • Radio: 150m             │
   │ 🕒 Fecha y Horario: 29 Octubre 2026 | 08:30 AM a 06:00 PM │
   │                                                           │
   │ ┌───────────────────────────────────────────────────────┐ │
   │ │ [SVG ID]  Ingrese su DNI (8 dígitos)                  │ │
   │ └───────────────────────────────────────────────────────┘ │
   │                                                           │
   │ [ REGISTRAR MI ASISTENCIA ]  (Azul sólido)                │
   │                                                           │
   │ (Alertas de éxito/error con fondos sólidos)               │
   └───────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ FOOTER (bg-slate-900 - Sólido, Centrado, Minimalista)           │
│        Plataforma Segura de Asistencias • 2026                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Ajuste de Base de Datos para Fechas y Horarios

Para que el modal muestre formalmente la **ubicación**, **fecha**, **hora de inicio** y **hora de cierre**, añadimos al esquema de `events`:
- `location_name TEXT DEFAULT ''`: Nombre amigable de la sede (ej. "Auditorio Principal").
- `starts_at TEXT`: Fecha y hora de inicio programada (ej. "2026-10-29 08:30").
- `ends_at TEXT`: Fecha y hora de cierre programada (ej. "2026-10-29 18:00").

---

## 4. Archivos a Modificar

1. **`src/db/schema.sql` y `src/db/index.ts`**:
   - Agregar columnas `location_name`, `starts_at`, `ends_at` a la interfaz y esquema de `events`.
2. **`src/views/asistencia.ts`**:
   - Reestructurar el layout con Header centrado, Footer sólido, "Registro de asistencia" fuera del modal, y el modal con los datos exactos del evento.
   - Eliminar bordes redundantes y aplicar paleta de colores sólidos de Tailwind.
3. **`public/js/asistencia.js`**:
   - Adaptar los selectores de los indicadores de red/GPS al nuevo Header minimalista.
4. **`src/db/seed.ts`**:
   - Actualizar el evento demo con horario y nombre de ubicación.
5. **`tests/attendance.test.ts`**:
   - Adaptar tests para verificar el nuevo formato y asegurar que sigan pasando al 100%.
