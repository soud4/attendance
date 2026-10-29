# Plan y Guía: Acceso desde el Celular a la Laptop (Zona Wi-Fi / Hotspot)

## 1. Diagnóstico Actual de tu Red

Al crear la zona Wi-Fi (hotspot) desde tu celular y conectar tu laptop a ella:
- La interfaz inalámbrica de tu laptop (`wlan0`) tiene asignada la siguiente dirección IP:
  - **IP de tu laptop en la red:** `192.168.144.81`
  - **Puerto del servidor Bun:** `3000`
  - **Servidor activo actualmente:** En ejecución en segundo plano (`bun run dev`).

---

## 2. Acceso Directo Inmediato desde el Celular

Para ingresar a la aplicación desde el navegador de tu celular (Chrome, Safari, etc.):

1. Asegúrate de que el celular mantenga la zona Wi-Fi encendida y la laptop siga conectada a ella.
2. Abre el navegador en tu teléfono y escribe la siguiente dirección:
   ```text
   http://192.168.144.81:3000
   ```
3. Para ingresar directamente al panel administrativo:
   ```text
   http://192.168.144.81:3000/login
   ```
   - **DNI**: `00000000`
   - **Contraseña**: `admin123`

---

## 3. El Desafío del GPS en Dispositivos Móviles (¿Por qué no pide permiso?)

> [!WARNING]
> **Políticas de Seguridad Estrictas en Navegadores Móviles:**
> Google Chrome (Android) y Safari (iOS) **bloquean por defecto la API de Geolocalización (`navigator.geolocation`)** si la página no se sirve a través de **HTTPS** o `localhost`.
> 
> Cuando ingresas mediante `http://192.168.144.81:3000`:
> - El navegador del celular detecta que es una conexión `http://` no segura.
> - Bloquea la función de ubicación inmediatamente **sin mostrar el cartel de "Permitir ubicación"**.
> - Por eso siempre arrojaba error de ubicación anteriormente.

---

## 4. Soluciones para que el GPS Funcione en tu Celular

Tienes **dos soluciones rápidas** para probar el registro de asistencia con GPS real desde tu teléfono:

### Opción A: Crear un Túnel HTTPS Instantáneo (Recomendada - Funciona en Android e iPhone)
Podemos abrir un túnel seguro y gratuito que le proporciona a tu laptop una URL con certificado SSL (`https://...`):

1. En una nueva terminal de tu laptop, ejecuta:
   ```bash
   bunx localtunnel --port 3000
   ```
2. Te entregará un enlace similar a:
   ```text
   your url is: https://funny-otter-42.loca.lt
   ```
3. Abres esa dirección `https://...` en tu celular. Al ser HTTPS:
   - El celular mostrará el diálogo nativo: *"¿Deseas permitir que este sitio acceda a tu ubicación?"*.
   - Aceptas el permiso y el GPS capturará tu latitud y longitud reales sin errores.

---

### Opción B: Habilitar IP no segura en Chrome (Solo para celulares Android)
Si tienes un teléfono Android y no quieres usar un túnel:

1. Abre Google Chrome en tu celular.
2. En la barra de direcciones escribe:
   ```text
   chrome://flags/#unsafely-treat-insecure-origin-as-secure
   ```
3. En el campo de texto ingresa:
   ```text
   http://192.168.144.81:3000
   ```
4. Cambia el desplegable a **Enabled**.
5. Presiona el botón azul **Relaunch** en la parte inferior para reiniciar Chrome.
6. Ahora al entrar a `http://192.168.144.81:3000/asistir/ev-demo2026`, Chrome tratará la IP como segura y te pedirá permiso de ubicación.

---

## 5. Resumen de Pasos a Seguir

1. **Prueba 1**: Abre en tu celular `http://192.168.144.81:3000/login` para comprobar que visualizas el panel administrativo.
2. **Prueba 2**: Para probar el marcado de asistencia presencial con GPS, dime si prefieres que ejecutemos la **Opción A (túnel HTTPS)** o si prefieres configurar la **Opción B**.
