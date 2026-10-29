# Sistema de Asistencia — Guía y Verificación de Flujos

## 1. Resumen de Implementación
Se ha completado la configuración de:
1. **Autenticación con DNI y Contraseña (`/login` y `/logout`)** para coordinadores y administradores.
2. **Dashboard de Gestión de Eventos (`/admin`)** y formulario con **autocaptura GPS (`/admin/events/new`)**.
3. **Servidor HTTPS Nativo en Bun (con `mkcert`)** para pruebas locales seguras desde dispositivos móviles conectados a la red Wi-Fi / Hotspot.

---

## 2. Acceso HTTPS desde Celular (Red Móvil Hotspot)

### Direcciones Activas:
- **Desde tu laptop:** [https://localhost:3000](https://localhost:3000)
- **Desde tu celular:** [https://192.168.144.81:3000](https://192.168.144.81:3000)

### Pasos en el Celular:
1. Mantén la zona Wi-Fi encendida en tu teléfono y tu laptop conectada a ella.
2. Abre Google Chrome o Safari en tu teléfono y escribe:
   ```text
   https://192.168.144.81:3000/asistir/ev-demo2026
   ```
3. **Paso de Certificado**:
   - Como `mkcert` genera una entidad emisora local en tu laptop, el teléfono mostrará inicialmente la pantalla *"La conexión no es privada"* (o *"No es seguro"*).
   - Toca en **"Opciones avanzadas"** (o *"Configuración avanzada"*) y luego en **"Continuar a 192.168.144.81 (no seguro)"**.
4. **Activación de Geolocalización (GPS)**:
   - Al estar bajo protocolo `https://`, el navegador móvil habilitará automáticamente el diálogo nativo:
     > *"¿Deseas permitir que este sitio acceda a tu ubicación?"*
   - Pulsa **"Permitir"**.
   - Ingresa tu DNI (8 dígitos) y presiona **"Registrar Asistencia"**.

### (Opcional) Instalar Certificado Raíz para ver Candado Verde:
Si deseas que tu celular reconozca el certificado con candado verde sin mostrar advertencias:
1. Desde tu celular abre: `https://192.168.144.81:3000/ca.pem`
2. Se descargará el archivo `rootCA.pem`.
3. Ve a los **Ajustes de tu celular > Seguridad y privacidad > Cifrado y credenciales > Instalar un certificado > Certificado de CA** y selecciona `rootCA.pem`.

---

## 3. Acceso al Panel Administrativo desde el Celular

Para administrar eventos desde el teléfono:
- URL: `https://192.168.144.81:3000/login`
- **DNI:** `00000000`
- **Contraseña:** `admin123`
- Podrás crear nuevos eventos usando el botón *"Usar mi ubicación actual"* directamente desde el GPS de tu celular.

---

## 4. Estado de Pruebas Automatizadas

```bash
$ bun test
28 pass
0 fail
96 expect() calls
Ran 28 tests across 3 files. [266.00ms]

$ bun check
✓ No type errors in 18 files [71.75ms]
```
