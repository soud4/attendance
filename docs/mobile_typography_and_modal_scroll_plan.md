# Plan de Implementación: Tipografía Móvil y Corrección de Scroll en Modales

## 1. Descripción del Problema

El usuario reporta dos detalles de experiencia de usuario (UX) en el panel administrativo:
1. **Tipografía móvil reducida**: Varios textos, badges, etiquetas y métricas en móvil usan tamaños muy pequeños (`text-[10px]` o `text-[11px]`). Se requiere aumentarlos sutilmente ("un poquito") para mejorar la legibilidad sin romper el diseño compacto de las tarjetas.
2. **Scroll mezclado en el modal de nuevo evento (Scroll Chaining & Bleed)**: Al abrir el modal de creación de evento en el dashboard y hacer scroll:
   - El scroll del modal se mezcla con el scroll de la página de fondo (ambos se mueven al mismo tiempo).
   - Cuando el cursor o el dedo pasa por encima del mapa Leaflet, este captura eventos de rueda (`scrollWheelZoom`) o arrastre táctil, bloqueando el avance en el formulario.
   - Falta bloqueo de scroll en el `body` (`overflow: hidden`) y falta `overscroll-behavior: contain`.

---

## 2. Solución Técnica Propuesta

### A. Corrección Definitiva del Scroll en Modales
1. **Bloqueo de scroll del fondo (Body Scroll Lock)**:
   - Al abrir el modal (`openQuickCreateModal`, `openCreateUserModal`, `openEditUserModal`, etc.):
     ```javascript
     document.documentElement.classList.add("overflow-hidden");
     document.body.classList.add("overflow-hidden");
     ```
   - Al cerrar el modal (`closeQuickCreateModal`, tecla `Escape`, clic fuera o submit):
     ```javascript
     document.documentElement.classList.remove("overflow-hidden");
     document.body.classList.remove("overflow-hidden");
     ```
   - Esto anula al 100% el movimiento de la página de fondo mientras el modal está activo.
2. **Aislamiento de Scroll (`overscroll-contain`)**:
   - Aplicar `overscroll-contain` (CSS `overscroll-behavior: contain`) al contenedor del modal en `src/views/components/ui/modal.tsx` y en el cajón móvil (`admin_mobile_nav.tsx`).
   - Evita que al llegar al tope superior o inferior del modal, el navegador propague el scroll a la ventana.
3. **Desactivar `scrollWheelZoom` en Leaflet**:
   - En `public/js/admin/map-picker.js`, inicializar el mapa con `scrollWheelZoom: false`.
   - Así, cuando el usuario use la rueda del ratón o deslice verticalmente sobre el mapa en el modal, la página del formulario se desplazará con naturalidad en lugar de hacer zoom al mapa de forma involuntaria. (El zoom sigue disponible con los botones `+` / `-` o haciendo doble clic).
4. **Estructura Móvil del Modal**:
   - Ajustar el contenedor interior del modal con altura máxima `max-h-[92vh] md:max-h-[85vh]` o `h-full md:h-auto` y padding inferior adecuado para que los botones de acción nunca queden ocultos detrás de la barra de navegación del navegador móvil.

---

### B. Ajuste de Tipografía en Modo Móvil (Sutil y Elegante)

Elevamos sutilmente la escala tipográfica en pantallas móviles para garantizar máxima comodidad de lectura:

| Elemento | Tamaño Anterior | Nuevo Tamaño Móvil | Impacto |
| :--- | :---: | :---: | :--- |
| **Etiquetas de estadísticas** (`StatSummary`) | `text-[10px]` | `text-xs font-semibold` (12px) | Legible al instante |
| **Números de estadísticas** | `text-lg` | `text-xl sm:text-2xl` (20px -> 24px) | Mucho más claro |
| **Buscadores e Inputs** | `text-xs` (12px) | `text-sm` (14px) | Previene zoom involuntario en iOS y mejora tipeo |
| **Pestañas de Estado (Tabs)** | `text-[11px]` | `text-xs font-semibold` (12px) | Mejor área de toque y contraste |
| **Contadores y Metadatos** | `text-[10px]` / `text-[11px]` | `text-xs` (12px) | Eliminamos tamaños menores a 12px |
| **Títulos de Cards móviles** | `text-sm` (14px) | `text-base` (16px) | Jerarquía visual clara |
| **Badges y Estados** | `text-[10px]` / `text-[11px]` | `text-xs` (12px) | Consistente con el nuevo componente `Badge` |
| **Botones de acción móvil** | `text-xs` (12px) | `text-xs sm:text-sm` (13-14px) | Más fácil de presionar con el pulgar |

---

## 3. Archivos a Modificar

### 1. `public/js/admin/map-picker.js`
- Desactivar `scrollWheelZoom: false` en `L.map(...)` para evitar que secuestre el scroll vertical del modal.

### 2. `public/js/admin/dashboard.js`
- Agregar bloqueo de scroll (`document.body.classList.add("overflow-hidden")`) en `openQuickCreateModal()`.
- Agregar desbloqueo de scroll (`document.body.classList.remove("overflow-hidden")`) en `closeQuickCreateModal()` y listener de `Escape`.

### 3. `public/js/admin/users.js`
- Agregar bloqueo y desbloqueo de scroll en apertura y cierre de modales de usuarios (`userCreateModal`, `userEditModal`, `userDeleteModal`).

### 4. `src/views/components/ui/modal.tsx`
- Añadir `overscroll-contain` al contenedor fijo del modal.
- Configurar scroll interior independiente y suave.

### 5. `src/views/admin/dashboard/components/quick_create_modal.tsx`
- Tipografía de labels: `text-xs font-semibold`.
- Inputs con `text-sm`.
- Padding y espaciado táctil optimizado en móvil.

### 6. Subcomponentes del Dashboard
- [`stat_summary.tsx`](file:///home/souda/Laboratory/bandera-asistencia/src/views/admin/dashboard/components/stat_summary.tsx): Ajustar `text-[10px]` a `text-xs`, y `text-lg` a `text-xl sm:text-2xl`.
- [`filter_toolbar.tsx`](file:///home/souda/Laboratory/bandera-asistencia/src/views/admin/dashboard/components/filter_toolbar.tsx): Ajustar inputs, tabs y contadores a `text-xs`/`text-sm`.
- [`event_card.tsx`](file:///home/souda/Laboratory/bandera-asistencia/src/views/admin/dashboard/components/event_card.tsx) y [`event_table.tsx`](file:///home/souda/Laboratory/bandera-asistencia/src/views/admin/dashboard/components/event_table.tsx): Elevar metadatos de `text-[11px]` a `text-xs`, títulos a `text-base` y badges a `text-xs`.

### 7. Subcomponentes de Usuarios y Asistencias
- [`user_filter_toolbar.tsx`](file:///home/souda/Laboratory/bandera-asistencia/src/views/admin/users/components/user_filter_toolbar.tsx) y [`user_table.tsx`](file:///home/souda/Laboratory/bandera-asistencia/src/views/admin/users/components/user_table.tsx): Elevar DNI, nombres y badges a `text-xs`/`text-sm`/`text-base`.
- [`attendances_view.tsx`](file:///home/souda/Laboratory/bandera-asistencia/src/views/admin/attendances_view.tsx): Elevar timestamps de entrada/salida y nombres a `text-xs`/`text-sm`.

---

## 4. Plan de Verificación

### Pruebas Automatizadas
- Ejecutar `bun test` y verificar que los 123 tests continúen pasando con 100% de éxito.

### Verificación Manual de Comportamiento
1. **Comportamiento del Scroll en Modal**:
   - Abrir el modal de creación de evento en el Dashboard.
   - Desplazar hacia arriba y hacia abajo dentro del modal: la página de fondo debe permanecer fija y congelada.
   - Pasar el cursor/dedo sobre el mapa: no debe hacer zoom accidental ni trabar el desplazamiento del modal.
   - Cerrar el modal: la página principal vuelve a ser desplazable con normalidad.
2. **Legibilidad Tipográfica en Móvil**:
   - Inspeccionar en viewport móvil (375px / 390px / 412px):
   - Confirmar que los textos secundarios, badges, horarios y DNI son fácilmente legibles sin esfuerzo visual y sin romper el layout comprimido de tarjetas.
