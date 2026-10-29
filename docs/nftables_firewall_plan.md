# Plan y Diagnóstico: Desbloqueo de Puerto 3000 en nftables

## 1. Diagnóstico del Problema en `/etc/nftables.conf`

Revisamos tu archivo de configuración de firewall `/etc/nftables.conf` y encontramos la causa exacta del bloqueo:

1. **Política general restrictiva**:
   ```nft
   chain input {
       type filter hook input priority 0; policy drop;
   ```
   Todo el tráfico entrante a tu laptop es descartado (`drop`) por defecto, a menos que exista una regla explícita de aceptación (`accept`).

2. **El puerto 3000 está comentado**:
   En la línea 32 tienes:
   ```nft
   # Servidor de desarrollo local típico (Node, Django, Flask, etc.)
   # tcp dport { 3000, 5000, 8000, 8080 } accept
   ```
   Al estar comentado con `#`, los paquetes dirigidos al puerto 3000 son descartados.

3. **La regla de red local no cubre la IP de tu celular**:
   En la línea 35 tienes:
   ```nft
   # Permitir todo desde la red local (útil si pruebas desde el móvil en la misma wifi)
   ip saddr 192.168.0.0/24 accept
   ```
   Esta regla solo permite IPs en el rango `192.168.0.X` (como el router de una casa). Sin embargo, tu celular al crear la zona Wi-Fi le asignó a la red el rango **`192.168.144.0/21`**, por lo que tu celular (`192.168.144.1`) es bloqueado.

---

## 2. Soluciones Disponibles

### Solución 1: Comando Rápido en Vivo (Instantáneo sin editar archivos)
Para habilitar el puerto 3000 de inmediato en la sesión actual de tu laptop, abre tu terminal y ejecuta:

```bash
sudo nft add rule inet filter input tcp dport 3000 accept
```

> **Efecto:** El puerto 3000 se desbloquea al instante y podrás cargar la página en tu celular de inmediato. (Se mantiene activo hasta que reinicies la laptop).

---

### Solución 2: Solución Permanente en `/etc/nftables.conf`
Para que quede habilitado de forma permanente incluso tras reiniciar tu laptop:

1. Edita el archivo de reglas:
   ```bash
   sudo nano /etc/nftables.conf
   ```
2. Busca la línea:
   ```nft
   # tcp dport { 3000, 5000, 8000, 8080 } accept
   ```
   Y descoméntala (quítale el `#` al inicio) para que quede así:
   ```nft
   tcp dport { 3000, 5000, 8000, 8080 } accept
   ```
3. Opcionalmente, para que cualquier zona Wi-Fi móvil funcione en el futuro, puedes cambiar la máscara de red local de `/24` a `/16`:
   ```nft
   ip saddr { 192.168.0.0/16, 10.0.0.0/8 } accept
   ```
4. Guarda el archivo (`Ctrl + O`, `Enter`, `Ctrl + X` en nano) y recarga las reglas:
   ```bash
   sudo nft -f /etc/nftables.conf
   ```

---

## 3. Verificación

Una vez ejecutada la **Solución 1** o la **Solución 2**:
1. Abre en tu celular:
   ```text
   https://192.168.144.81:3000
   ```
2. La conexión responderá inmediatamente sin quedarse cargando en blanco.
