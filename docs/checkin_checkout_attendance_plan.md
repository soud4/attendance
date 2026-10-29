# Plan Simplificado: Registro de Hora de Salida (Check-in & Check-out)

## Resumen del Objetivo
Implementar de manera simple y directa la marcación de **Hora de Salida** para los asistentes una vez que hayan marcado su entrada, utilizando una cookie / mecanismo de persistencia y una actualización (`UPDATE`) en la base de datos SQLite.

---

## Flujo Simplificado

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FLUJO DIRECTO Y SIMPLE                          │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Asistente ingresa DNI + GPS:                                        │
│    └─► ¿Existe registro para este (event_id, dni)?                     │
│         │                                                              │
│         ├─ NO  ─► INSERT en `attendances` (Entrada)                    │
│         │         • Guarda hora en `created_at`                        │
│         │         • Setea Cookie: `att_<code_evento>=<dni>`            │
│         │         • UI muestra: "Entrada registrada a las HH:MM"       │
│         │           y habilita el botón "Marcar salida"                │
│         │                                                              │
│         └─ SI  ─► ¿`check_out_at` es NULL?                             │
│                    │                                                   │
│                    ├─ SI  ─► UPDATE `attendances` (Salida)             │
│                    │         • `check_out_at = datetime('now')`        │
│                    │         • Valida GPS de salida (geocerca)         │
│                    │         • UI muestra: "Salida registrada a las    │
│                    │           HH:MM. Asistencia completa"             │
│                    │                                                   │
│                    └─ NO  ─► 409: Asistencia ya completada             │
│                              (Entrada y Salida ya registradas)         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Componentes a Modificar

### 1. Base de Datos SQLite
- **Columna nueva en `attendances`**:
  ```sql
  ALTER TABLE attendances ADD COLUMN check_out_at TEXT;
  ```
- En `src/db/schema.sql`:
  - Agregar `check_out_at TEXT` a la definición de la tabla `attendances`.
- En `src/db/index.ts`:
  - Migración automática al iniciar la app: si la columna `check_out_at` no existe en la tabla `attendances`, se ejecuta `ALTER TABLE attendances ADD COLUMN check_out_at TEXT;`.
  - Actualizar la interfaz TypeScript `Attendance`:
    ```ts
    export interface Attendance {
      id: number;
      event_id: number;
      dni: string;
      latitude: number;
      longitude: number;
      accuracy_meters: number;
      distance_meters: number;
      method: "SELF" | "ASSISTED";
      recorded_by_user_id: number | null;
      device_cookie_hash: string | null;
      ip_address: string | null;
      user_agent: string | null;
      created_at: string;
      check_out_at: string | null;
    }
    ```

---

### 2. Servicio de Asistencia (`src/services/attendance.service.ts`)
- Al recibir `register({ eventPublicCode, dni, latitude, longitude, accuracy, ... })`:
  1. Valida formato de DNI y coordenadas GPS.
  2. Valida que el evento esté abierto y dentro del radio permitido.
  3. Consulta si ya existe un registro para `(event_id, dni)`:
     - **Si NO existe**:
       - Ejecuta `INSERT INTO attendances (...) VALUES (...)`.
       - Retorna `{ action: "CHECK_IN", attendanceId, dni, recordedAt: created_at, distanceMeters }`.
     - **Si SI existe y `check_out_at IS NULL`**:
       - Ejecuta `UPDATE attendances SET check_out_at = datetime('now') WHERE event_id = $event_id AND dni = $dni RETURNING check_out_at;`.
       - Retorna `{ action: "CHECK_OUT", attendanceId, dni, recordedAt: check_out_at, checkInAt: created_at, distanceMeters }`.
     - **Si SI existe y `check_out_at IS NOT NULL`**:
       - Lanza `AttendanceAlreadyRegisteredError("Ya has registrado tu entrada y tu salida para este evento.")`.

---

### 3. Controlador y Cookie (`src/controllers/attendance.controller.tsx`)
- En `register` (`POST /asistir/:code`):
  - Si el resultado es `action: "CHECK_IN"`:
    - Retorna JSON con `action: "CHECK_IN"`.
    - Agrega header `Set-Cookie`: `att_${code}=${dni}; Path=/; Max-Age=86400; SameSite=Lax`.
  - Si el resultado es `action: "CHECK_OUT"`:
    - Retorna JSON con `action: "CHECK_OUT"`.
- En `renderForm` (`GET /asistir/:code`):
  - Lee la cookie `att_${code}`.
  - Si existe y el DNI tiene asistencia con `check_out_at IS NULL`:
    - Pasa a la vista el DNI precargado y el estado `hasCheckIn: true` con la hora de entrada.

---

### 4. Vista de Asistencia (`src/views/asistencia.tsx` y `public/js/asistencia.js`)
- **Estado Inicial**:
  - Input DNI + Botón "Registrar asistencia" (o "Registrar entrada").
- **Cuando ya registró Entrada**:
  - Muestra badge: `✓ Entrada registrada a las [HH:MM]`.
  - El botón cambia de texto y color a verde esmeralda: **"Marcar salida"**.
  - Si el usuario recarga la página, la cookie o localStorage recuerdan que ya tiene entrada y mantienen el botón en **"Marcar salida"**.
- **Cuando marca Salida**:
  - Muestra mensaje de éxito: `✓ Salida registrada a las [HH:MM]`.
  - Resumen: Entrada [HH:MM] &bull; Salida [HH:MM].
  - Deshabilita el botón: "Asistencia completada".

---

### 5. Panel Administrativo (`attendances_view.tsx` y `event_detail_view.tsx`)
- Mostrar en la tabla y tarjetas:
  - Hora Entrada (`created_at`).
  - Hora Salida (`check_out_at` o badge `"En curso"` si aún no marcó salida).
  - En la exportación CSV agregar la columna `check_out_at`.

---

## Plan de Verificación

### Pruebas Automatizadas (`bun test`)
1. **Prueba de Registro de Entrada**:
   - `POST /asistir/:code` con DNI nuevo registra entrada (`check_out_at` es NULL) y responde `action: "CHECK_IN"`.
2. **Prueba de Registro de Salida**:
   - `POST /asistir/:code` con el mismo DNI actualiza `check_out_at` con la fecha y hora actual y responde `action: "CHECK_OUT"`.
3. **Prueba de Rechazo tras Asistencia Completa**:
   - `POST /asistir/:code` por tercera vez con el mismo DNI devuelve error 409 (asistencia ya completada).
4. **Verificación de Geocerca en Salida**:
   - Marcar salida fuera del radio devuelve 400 OutOfRadiusError.

### Pruebas Manuales
1. Abrir `/asistir/<codigo>` -> Registrar entrada -> verificar que aparece "Marcar salida".
2. Recargar página -> Verificar que se mantiene la opción de "Marcar salida".
3. Pulsar "Marcar salida" -> Confirmar que actualiza y finaliza la asistencia.
4. Revisar `/admin/attendances` -> Confirmar que aparecen ambas horas.
