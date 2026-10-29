# Plan de Diseño e Implementación: Interfaz de Asistencia Rectangular

## 1. Resumen de Requerimientos
- **Estilo Visual**: Rectangular, sobrio y técnico (`rounded-none`).
- **Paleta de Colores**: Tonos azulados y grises templados (`Slate / Zinc / Steel Blue`). Fondos diferenciados por capas (`bg-slate-900`, `bg-slate-800`, `bg-slate-850`) con bordes reactivos al cursor (`border border-slate-700/60 hover:border-blue-500`).
- **Iconografía**: Cero emojis. Iconos vectoriales SVG limpios y nítidos (WiFi, Ubicación/GPS, DNI, Escudo, Check, Advertencia).
- **Nombre del Evento**: Visible y destacado en la cabecera.
- **Indicadores de Estado Previos**:
  - **Indicador de Red / Conexión**: Detección dinámica en vivo de `navigator.onLine` con estados *En línea* / *Sin conexión*.
  - **Indicador de Ubicación / GPS**: Detección del estado del permiso de geolocalización (`granted`, `prompt`, `denied`).
- **Motor CSS**: Tailwind CSS v4 precompilado con `@tailwindcss/cli`.
- **Tipografía**: Geométrica, sobria y legible (sans-serif técnica con espaciado controlado; fuente monoespaciada para el DNI).

---

## 2. Mockup Estructural de la Interfaz

```text
┌─────────────────────────────────────────────────────────────────┐
│ [SVG ICONO ASISTENCIA]  SISTEMA DE ASISTENCIA                   │
│                                                                 │
│ EVENTO: Conferencia Regional de Operaciones 2026                │
│                                                                 │
│ ┌───────────────────────────────┐ ┌───────────────────────────┐ │
│ │ [SVG WIFI]  Red: Conectado    │ │ [SVG GPS]  GPS: Listo     │ │
│ └───────────────────────────────┘ └───────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  DOCUMENTO NACIONAL DE IDENTIDAD (DNI)                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ [SVG ID]   7  2  3  4  5  6  7  8                         │  │
│  └───────────────────────────────────────────────────────────┘  │
│  * Ingrese los 8 dígitos numéricos                              │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ [SVG MAP-PIN]   REGISTRAR MI ASISTENCIA                   │  │
│  └───────────────────────────────────────────────────────────┘  │
│  (Rectangular, azul vibrante al completarse los 8 dígitos)       │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ [SVG INFO] Coordenadas y presencia verificadas al enviar  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Especificación Técnica de Componentes

### A. Paleta de Colores Tailwind & Estética Rectangular
- **Fondo de Pantalla (`body`)**: `bg-slate-950 text-slate-100` (azul noche muy profundo, descansado y legible).
- **Contenedor Principal**: `bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors rounded-none p-6 md:p-8 max-w-lg w-full`.
- **Cajas Secundarias (Indicadores & Avisos)**: `bg-slate-800/80 border border-slate-700/50 hover:border-blue-500/70 transition-colors rounded-none`.
- **Input DNI**: `bg-slate-950 border border-slate-700 focus:border-blue-500 focus:outline-none text-slate-100 font-mono tracking-widest text-xl rounded-none py-3 px-4 w-full`.
- **Botón de Envío**:
  - *Deshabilitado*: `bg-slate-800 text-slate-500 border border-slate-700/40 cursor-not-allowed rounded-none`.
  - *Activo (8 dígitos completos)*: `bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium border border-blue-500 hover:border-blue-400 cursor-pointer rounded-none`.
- **Tipografía**: Sans-serif técnica (`font-sans tracking-tight`) y monoespaciada para cifras numéricas (`font-mono`).

### B. Indicadores de Conexión y Ubicación
1. **Red / WiFi**:
   - Escucha los eventos globales `window.addEventListener('online', updateNetStatus)` y `'offline'`.
   - Si `navigator.onLine === false`: El indicador cambia a color ámbar/rojo con texto *"Sin conexión a internet"*, y desactiva el botón de envío.
2. **Ubicación / GPS**:
   - Consulta `navigator.permissions.query({ name: 'geolocation' })` para saber si el permiso está concedido, pendiente o bloqueado.
   - En móviles, alerta si el GPS está apagado o restringido.

### C. Módulos y Archivos a Generar
1. **`src/styles/main.css`**: Entrada de Tailwind v4 (`@import "tailwindcss";`).
2. **`public/css/tailwind.css`**: CSS compilado y minificado para servir en producción sin dependencias de runtime.
3. **`public/js/asistencia.js`**:
   - Control de indicadores de red y geolocalización.
   - Filtro de DNI estricto (solo 8 dígitos numéricos, purga automática de texto no numérico).
   - Bloqueo de doble clic y feedback de carga.
4. **`src/views/asistencia.ts`**:
   - Plantilla HTML SSR con la estructura rectangular, iconos SVG limpios, badges de estado y sin emojis.
5. **`src/routes/asistencia.ts`**:
   - Endpoint `GET /asistir/:code` (renderizado de vista) y `POST /asistir/:code` (procesamiento seguro con Haversine y SQLite).
6. **`src/index.ts`**: Servidor Hono con middleware estático.

---

## 4. Plan de Verificación
- **Prueba visual**: Comprobar diseño rectangular (`rounded-none`), interacción hover de bordes, iconos SVG e indicadores dinámicos.
- **Prueba funcional en cliente**: 
  - Simulación offline en navegador para ver el cambio de estado del indicador WiFi.
  - Verificación del habilitado del botón exactamente al 8vo dígito.
- **Prueba automatizada de servidor**: `bun test` validando que las peticiones sigan cumpliendo todas las reglas de negocio y seguridad.
