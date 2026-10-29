# Plan de Implementación: Pantalla de Auto-Registro de Asistencia Móvil

## 1. Descripción del Objetivo
Diseñar e implementar la página pública de auto-asistencia (`/asistir/:code`) para participantes que escanean el código QR o abren el enlace del evento. 

La interfaz debe ser:
- **Visualmente pulida**: Paleta en tonos azulados corporativos (`Slate / Deep Blue / Vibrant Blue`), tipografía moderna nativa estilo macOS (`SF Pro / -apple-system`), bordes redondeados y sombras suaves.
- **Ultra-segura (Defense in Depth)**: Múltiples capas de validación y sanitización en cliente y servidor para evitar inyecciones, scripts maliciosos, datos manipulados, spam o registros fuera del rango geográfico.

---

## 2. Medidas de Seguridad y Verificaciones ("Safes")

### En el Cliente (Navegador / Frontend)
1. **Filtro Estricto de Teclado y Portapapeles (Anti-Inyección)**:
   - El campo DNI solo acepta dígitos (`0-9`). Cualquier letra, espacio, símbolo o caracter de script pegado o tipeado es purgado automáticamente al milisegundo mediante regex `/[^0-9]/g`.
   - Atributos HTML seguros: `maxlength="8"`, `inputmode="numeric"`, `pattern="[0-9]{8}"`, `autocomplete="off"`, `autocorrect="off"`.
2. **Control de Activación del Botón**:
   - El botón «Registrar mi asistencia» nace deshabilitado (`disabled`).
   - Se activa únicamente cuando la longitud del DNI es exactamente de 8 dígitos numéricos.
3. **Prevención de Doble Envío (Double-Submit Prevention)**:
   - Al hacer clic, el botón se deshabilita instantáneamente, se bloquea el input y cambia el texto a: *"Obteniendo ubicación y verificando..."* con indicador visual de carga.
4. **Manejo Robusto de Geolocalización en Móviles**:
   - `enableHighAccuracy: true`, `timeout: 10000`, `maximumAge: 0`.
   - **Gestión de Permisos de Android / Chrome**: Si el usuario tiene burbujas de chat flotantes (Messenger, WhatsApp) o permisos bloqueados, la interfaz despliega una guía paso a paso para cerrar burbujas y reintentar.
   - **Filtro de precisión GPS**: Si el GPS reporta una precisión deficiente (> 250 metros), se alerta al usuario para que no registre una posición inexacta y vuelva a pulsar.

### En el Servidor (Hono / Backend)
1. **Validación de Esquema Estricta**:
   - El DNI se valida con regex `^\d{8}$`.
   - Coordenadas verificadas: latitud `[-90, 90]`, longitud `[-180, 180]`, precisión `>= 0`.
2. **Validación Geográfica Haversine**:
   - El servidor calcula la distancia exacta en metros entre el centro del evento y la ubicación reportada.
   - Si `distancia > event.radius_meters`, el servidor rechaza con código `400` indicando la distancia excedida.
3. **Validación de Estado del Evento**:
   - Solo eventos con `status = 'OPEN'` aceptan registros.
4. **Control de Duplicados en Base de Datos**:
   - Si el DNI ya registró asistencia en el evento, la restricción `UNIQUE(event_id, dni)` y la consulta previa responden con código `409 Conflict`: *"Este DNI ya tiene asistencia registrada para este evento."*
5. **Cookie de Dispositivo / Navegador**:
   - Envío de cookie criptográfica `HttpOnly`, `SameSite=Lax` para trazabilidad de peticiones desde el mismo navegador.
6. **Encabezados de Seguridad (HTTP Security Headers)**:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `Content-Security-Policy`: Sin scripts externos no autorizados.

---

## 3. Especificación Visual y de Estilos

- **Tipografía**: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
- **Paleta de Colores**:
  - Fondo General: `#F1F5F9` (Slate suave con gradiente sutil a `#E2E8F0`).
  - Tarjeta Principal: `#FFFFFF` con borde `1px solid #E2E8F0` y elevación macOS `0 10px 25px -5px rgba(15, 23, 42, 0.08)`.
  - Azul Primario (Botón Activo): `#2563EB` (Vibrant Blue), hover `#1D4ED8`, activo `#1E40AF`.
  - Azul Corporativo (Encabezados e Íconos): `#1E3A8A` (Deep Navy).
  - Botón Deshabilitado: `#94A3B8` con fondo `#E2E8F0`.
  - Estado Éxito: Fondo `#ECFDF5`, borde `#A7F3D0`, texto `#065F46`.
  - Estado Error / Alerta: Fondo `#FEF2F2`, borde `#FECACA`, texto `#991B1B`.

---

## 4. Archivos a Crear y Modificar

1. **`src/utils/geo.ts`** [NEW]:
   - Función matemática de alta precisión para distancia Haversine en metros.
2. **`public/css/attendance.css`** [NEW]:
   - Hoja de estilos con variables CSS, diseño mobile-first responsivo y tipografía macOS.
3. **`public/js/attendance.js`** [NEW]:
   - Lógica de captura de DNI, geolocalización, control de permisos y llamadas AJAX `fetch` seguras.
4. **`src/views/attendance.ts`** [NEW]:
   - Renderizador SSR de la página HTML con metadatos del evento e inyección segura sin riesgo XSS.
5. **`src/routes/attendance.ts`** [NEW]:
   - Endpoints `GET /asistir/:code` y `POST /asistir/:code` con todas las verificaciones del servidor.
6. **`src/index.ts`** [NEW]:
   - Servidor Hono con middleware de archivos estáticos y rutas montadas.
7. **`tests/attendance.test.ts`** [NEW]:
   - Tests de integración para verificar validación de DNI, cálculo de distancia y rechazo de duplicados vía HTTP.
