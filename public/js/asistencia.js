(() => {
  var $ = function(id) { return document.getElementById(id); };
  var dniInput = $("dniInput"),
      submitBtn = $("submitBtn"),
      btnText = $("btnText"),
      btnSpinner = $("btnSpinner"),
      statusContainer = $("statusContainer"),
      interactiveContent = $("interactiveContent"),
      eventStatusBadge = $("eventStatusBadge"),
      locationPromptCard = $("locationPromptCard"),
      grantLocationBtn = $("grantLocationBtn"),
      netDot = $("netDot"),
      gpsDot = $("gpsDot"),
      gpsChip = $("gpsChip"),
      refreshBtn = $("refreshBtn"),
      refreshIcon = $("refreshIcon");

  var code = window.__EVENT_CODE__ || "";
  window.__LAST_COORDS__ = null;

  // 1. Verificación de contexto seguro (HTTPS vs HTTP)
  var isSecure = window.isSecureContext || location.hostname === "localhost" || location.hostname === "127.0.0.1";
  if (!isSecure) {
    notice(
      "error",
      "Conexión no segura (HTTP)",
      "Los navegadores móviles bloquean el acceso al GPS en conexiones HTTP externas (" + location.hostname + "). Para registrar asistencia desde tu celular debes acceder mediante HTTPS o localhost."
    );
  }

  // 2. WiFi / Red
  function syncNet() {
    if (!netDot) return;
    if (navigator.onLine) {
      netDot.className = "w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block";
    } else {
      netDot.className = "w-1.5 h-1.5 rounded-full bg-rose-500 inline-block animate-pulse";
    }
    syncBtn();
  }
  window.addEventListener("online", syncNet);
  window.addEventListener("offline", syncNet);
  syncNet();

  // 3. Gestión y Solicitud de GPS (con fallback automático)
  function setGpsState(state) {
    if (!gpsDot) return;
    var colors = {
      granted: "bg-emerald-500",
      denied: "bg-rose-500",
      prompt: "bg-amber-500"
    };
    gpsDot.className = "w-1.5 h-1.5 rounded-full " + (colors[state] || colors.prompt) + " inline-block";

    if (locationPromptCard) {
      if (state === "granted") {
        locationPromptCard.classList.add("hidden");
      } else {
        locationPromptCard.classList.remove("hidden");
      }
    }
  }

  // Función robusta para capturar ubicación: intenta alta precisión y si falla hace fallback a normal
  function fetchBrowserPosition(onSuccess, onError) {
    if (!navigator.geolocation) {
      onError({ code: 0, message: "Tu navegador no soporta geolocalización." });
      return;
    }

    // Intento 1: Alta precisión
    navigator.geolocation.getCurrentPosition(
      onSuccess,
      function(firstErr) {
        console.warn("Intento con alta precisión falló, reintentando con precisión estándar...", firstErr);
        // Intento 2: Precisión estándar con timeout amplio (esencial para computadoras y laptops sin antena GPS satelital)
        navigator.geolocation.getCurrentPosition(
          onSuccess,
          function(secondErr) {
            onError(secondErr || firstErr);
          },
          { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 30000 }
    );
  }

  function requestLocationUserGesture() {
    fetchBrowserPosition(
      function(pos) {
        setGpsState("granted");
        window.__LAST_COORDS__ = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: Date.now()
        };
        clear();
      },
      function(err) {
        handleGeoError(err);
      }
    );
  }

  // Monitorear estado de permisos
  if (navigator.permissions && navigator.permissions.query) {
    navigator.permissions.query({ name: "geolocation" }).then(function(p) {
      setGpsState(p.state);
      p.onchange = function() { setGpsState(p.state); };
      if (p.state === "prompt" && locationPromptCard) {
        locationPromptCard.classList.remove("hidden");
      }
    }).catch(function() {
      if (locationPromptCard) locationPromptCard.classList.remove("hidden");
    });
  } else {
    if (locationPromptCard) locationPromptCard.classList.remove("hidden");
  }

  // Botón explícito para permitir GPS (gesto de usuario directo)
  if (grantLocationBtn) {
    grantLocationBtn.addEventListener("click", function() {
      requestLocationUserGesture();
    });
  }

  // Clic en el chip GPS del header también solicita permiso
  if (gpsChip) {
    gpsChip.addEventListener("click", function() {
      requestLocationUserGesture();
    });
  }

  // 4. Botón de Actualizar
  if (refreshBtn) {
    refreshBtn.addEventListener("click", async function() {
      if (refreshIcon) refreshIcon.classList.add("animate-spin");
      try {
        var r = await fetch("/asistir/" + encodeURIComponent(code) + "/status", { cache: "no-store" });
        var d = await r.json();
        if (r.ok && d.success && !d.is_open) {
          badgeOff();
          endedView();
        }
      } catch (_) {}
      setTimeout(function() {
        if (refreshIcon) refreshIcon.classList.remove("animate-spin");
      }, 400);
    });
  }

  function badgeOff() {
    if (!eventStatusBadge) return;
    eventStatusBadge.className = "inline-flex items-center gap-1.5 text-[12px] font-semibold text-neutral-500";
    eventStatusBadge.innerHTML = '<span class="w-2 h-2 rounded-full bg-neutral-600 inline-block"></span>Finalizado';
  }

  function endedView() {
    if (!interactiveContent) return;
    interactiveContent.innerHTML =
      '<div class="text-center py-6">' +
      '<svg class="w-10 h-10 text-neutral-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' +
      '<p class="text-lg font-bold text-neutral-300">El registro ha finalizado</p>' +
      '<p class="mt-1.5 text-[14px] text-neutral-500">La asistencia fue cerrada por el coordinador o se supero la hora limite.</p></div>';
  }

  // 5. Input DNI
  if (dniInput) {
    dniInput.addEventListener("input", function(e) {
      var v = e.target.value.replace(/[^0-9]/g, "");
      if (v.length > 8) v = v.slice(0, 8);
      if (e.target.value !== v) e.target.value = v;
      syncBtn();
    });
  }

  function syncBtn() {
    if (!dniInput || !submitBtn) return;
    var ok = dniInput.value.length === 8 && navigator.onLine && !submitBtn.dataset.busy;
    submitBtn.disabled = !ok;
    submitBtn.className = ok
      ? "w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-[15px] rounded-xl cursor-pointer shadow-lg shadow-blue-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5"
      : "w-full py-3.5 px-4 bg-neutral-800 text-neutral-600 font-semibold text-[15px] rounded-xl cursor-not-allowed transition-all flex items-center justify-center gap-2.5";
  }

  // 6. Envío de Asistencia
  if (submitBtn) {
    submitBtn.addEventListener("click", function() {
      var dni = dniInput.value.trim();
      if (dni.length !== 8) return;

      if (!navigator.onLine) {
        notice("error", "Sin conexión", "Activa tus datos móviles o Wi-Fi para registrar tu asistencia.");
        return;
      }

      busy(true, "Obteniendo ubicación GPS...");
      clear();

      // Si ya tenemos coordenadas recientes (< 45s) las enviamos directamente
      var cached = window.__LAST_COORDS__;
      if (cached && (Date.now() - cached.timestamp < 45000)) {
        enviarAsistencia(dni, cached.latitude, cached.longitude, cached.accuracy);
        return;
      }

      // De lo contrario capturamos la ubicación
      fetchBrowserPosition(
        function(pos) {
          setGpsState("granted");
          enviarAsistencia(dni, pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
        },
        function(err) {
          busy(false);
          handleGeoError(err);
        }
      );
    });
  }

  function handleGeoError(err) {
    var title = "Ubicación requerida";
    var msg = "";

    if (err.code === 1) { // PERMISSION_DENIED
      setGpsState("denied");
      msg = "Permiso de ubicación denegado. Haz clic en el ícono del candado o ajustes del sitio junto a la URL en tu navegador y activa 'Ubicación' para este sitio. En Android, cierra burbujas flotantes de chat si aparecen.";
    } else if (err.code === 2) { // POSITION_UNAVAILABLE
      setGpsState("prompt");
      msg = "No se pudo obtener la posición del dispositivo. Verifica que la ubicación de tu equipo o teléfono esté encendida.";
    } else if (err.code === 3) { // TIMEOUT
      setGpsState("prompt");
      msg = "Tiempo de espera agotado al consultar el GPS. Pulsa el botón 'Permitir GPS' o reintenta.";
    } else {
      msg = err.message || "Error al acceder al sensor de ubicación.";
    }

    notice("error", title, msg);
  }

  async function enviarAsistencia(dni, lat, lng, acc) {
    busy(true, "Registrando asistencia...");
    try {
      var r = await fetch("/asistir/" + encodeURIComponent(code), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ dni: dni, latitude: lat, longitude: lng, accuracy: acc })
      });
      var d = await r.json();
      if (r.ok && d.success) {
        success(d.message, d.details);
        dniInput.disabled = true;
        submitBtn.style.display = "none";
      } else {
        if (d.title === "El registro ha finalizado") {
          badgeOff();
          endedView();
        } else {
          notice("error", d.title || "No se pudo registrar", d.error || "Error inesperado.");
          busy(false);
        }
      }
    } catch (_) {
      notice("error", "Error de conexión", "No se pudo conectar con el servidor.");
      busy(false);
    }
  }

  function busy(on, txt) {
    if (!submitBtn) return;
    submitBtn.dataset.busy = on ? "1" : "";
    if (on) {
      submitBtn.disabled = true;
      if (dniInput) dniInput.disabled = true;
      btnSpinner.classList.remove("hidden");
      btnText.textContent = txt;
    } else {
      if (dniInput) dniInput.disabled = false;
      btnSpinner.classList.add("hidden");
      btnText.textContent = "Registrar asistencia";
      syncBtn();
    }
  }

  function clear() {
    if (statusContainer) {
      statusContainer.innerHTML = "";
      statusContainer.className = "hidden";
    }
  }

  function notice(type, title, msg) {
    if (!statusContainer) return;
    var cls = type === "error" ? "bg-red-950/50 border-red-900/40 text-red-300" : "bg-neutral-800 border-neutral-700 text-neutral-300";
    statusContainer.className = "mt-5 p-4 rounded-xl border " + cls;
    statusContainer.innerHTML =
      '<div class="flex items-start gap-3">' +
      '<svg class="w-5 h-5 flex-shrink-0 mt-0.5 ' + (type === "error" ? "text-red-400" : "text-neutral-400") + '" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>' +
      '<div><p class="text-[13px] font-semibold">' + esc(title) + '</p><p class="mt-0.5 text-[12px] text-neutral-400 leading-relaxed">' + esc(msg) + '</p></div></div>';
  }

  function success(msg, det) {
    if (!statusContainer) return;
    statusContainer.className = "mt-5 p-4 rounded-xl bg-emerald-950/50 border border-emerald-800/40 text-emerald-300";
    var h = '<div class="flex items-start gap-3">' +
      '<svg class="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>' +
      '<div><p class="text-[14px] font-semibold text-emerald-200">' + esc(msg) + '</p>';
    if (det) {
      h += '<div class="mt-1.5 text-[12px] text-emerald-400 space-y-0.5">';
      if (det.time) h += '<p>Hora: <span class="font-mono font-semibold text-white">' + esc(det.time) + '</span></p>';
      if (det.distance) h += '<p>Distancia: <span class="font-mono font-semibold text-white">' + esc(det.distance) + '</span></p>';
      h += '</div>';
    }
    h += '<p class="mt-2 text-[11px] text-neutral-500">Puedes cerrar esta ventana.</p></div></div>';
    statusContainer.innerHTML = h;
  }

  function esc(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
})();
