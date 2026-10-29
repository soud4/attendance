# Plan: HTTPS con mkcert Exclusivamente para Entorno Local

## 1. Resumen del Enfoque

Los certificados TLS se utilizarán **únicamente en tu entorno de desarrollo local** (en tu laptop y para las pruebas desde tu celular conectado al hotspot).
En **Dokploy** (producción), el contenedor continuará funcionando en modo HTTP estándar en el puerto 3000, ya que Traefik se encarga del HTTPS público mediante Let's Encrypt sin requerir certificados dentro del contenedor.

---

## 2. Cambios a Realizar

### 1. Regenerar el Certificado Local con mkcert
Actualmente `localhost+1.pem` solo incluye `localhost`. Para que funcione desde el celular sin error de nombre de dominio, lo regeneraremos incluyendo la IP del hotspot:
```bash
mkcert -cert-file localhost+1.pem -key-file localhost+1-key.pem localhost 127.0.0.1 ::1 192.168.144.81
```

### 2. Modificar `src/index.ts` (Activación Condicional Local)
Solo activar TLS si estamos en desarrollo (`NODE_ENV !== 'production'`) y si los archivos `.pem` existen en el disco:

```typescript
import { existsSync } from "node:fs";

// Configuración TLS exclusiva para desarrollo local
const certFile = "./localhost+1.pem";
const keyFile = "./localhost+1-key.pem";
const isLocalTls = process.env.NODE_ENV !== "production" && existsSync(certFile) && existsSync(keyFile);

// Ruta para descargar el CA en el celular (solo desarrollo)
if (process.env.NODE_ENV !== "production") {
  const caPath = `${process.env.HOME}/.local/share/mkcert/rootCA.pem`;
  app.get("/ca.pem", (c) => {
    if (existsSync(caPath)) {
      return c.body(Bun.file(caPath).stream(), 200, {
        "Content-Type": "application/x-x509-ca-cert",
        "Content-Disposition": 'attachment; filename="rootCA.pem"',
      });
    }
    return c.text("CA no encontrada", 404);
  });
}

const serverOptions: any = {
  port: PORT,
  fetch: app.fetch,
};

if (isLocalTls) {
  serverOptions.tls = {
    cert: Bun.file(certFile),
    key: Bun.file(keyFile),
  };
  console.log(`Servidor de Asistencia HTTPS (modo local) activo en:`);
  console.log(`  - Laptop:  https://localhost:${PORT}`);
  console.log(`  - Celular: https://192.168.144.81:${PORT}`);
} else {
  console.log(`Servidor de Asistencia HTTP activo en: http://localhost:${PORT}`);
}

export default serverOptions;
```

### 3. Actualizar `.gitignore`
Asegurar que los certificados locales nunca se suban al repositorio de GitHub ni lleguen a Dokploy:
```gitignore
*.pem
certs/
```

---

## 3. Plan de Verificación

1. **Tipado y Tests**:
   - Ejecutar `bun check` para validar tipado de `serverOptions`.
   - Ejecutar `bun test` para comprobar que las 28 pruebas continúen pasando sin depender de TLS.
2. **Prueba de Conexión Local**:
   - Verificar `curl -k -I https://localhost:3000` y `curl -k -I https://192.168.144.81:3000`.
3. **Prueba desde el Celular**:
   - Ingresar a `https://192.168.144.81:3000/asistir/ev-demo2026`.
   - Dar clic en continuar si aparece advertencia de certificado.
   - Probar que el navegador móvil active el GPS y pida permiso de ubicación.
