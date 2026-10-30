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
      refreshIcon = $("refreshIcon"),
      attendeeKnownBadge = $("attendeeKnownBadge"),
      attendeeKnownName = $("attendeeKnownName"),
      attendeeKnownBase = $("attendeeKnownBase"),
      firstTimeFields = $("firstTimeFields"),
      fullNameInput = $("fullNameInput"),
      baseNameInput = $("baseNameInput");

  var isAttendeeRegistered = null;
  var lookupTimer = null;

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
          badgeOff(d.is_expired);
          endedView(d.is_expired);
        }
      } catch (_) {}
      setTimeout(function() {
        if (refreshIcon) refreshIcon.classList.remove("animate-spin");
      }, 400);
    });
  }

  function badgeOff(isExpired) {
    if (!eventStatusBadge) return;
    if (isExpired) {
      eventStatusBadge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-400 border border-amber-800/50";
      eventStatusBadge.innerHTML = '<svg class="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Finalizado automáticamente por horario';
    } else {
      eventStatusBadge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700/60";
      eventStatusBadge.innerHTML = '<span class="w-2 h-2 rounded-full bg-neutral-600 inline-block"></span>Finalizado';
    }
  }

  function endedView(isExpired) {
    if (!interactiveContent) return;
    var msg = isExpired
      ? "El evento ha concluido y el registro se cerró automáticamente por horario."
      : "La asistencia fue cerrada por el coordinador o se superó la hora límite.";
    interactiveContent.innerHTML =
      '<div class="text-center py-6">' +
      '<svg class="w-10 h-10 text-neutral-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' +
      '<p class="text-lg font-bold text-neutral-300">El registro ha finalizado</p>' +
      '<p class="mt-1.5 text-[14px] text-neutral-500">' + msg + '</p></div>';
  }

  function formatTime(isoStr) {
    if (!isoStr) return "";
    try {
      var d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      return d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: true });
    } catch (_) {
      return isoStr;
    }
  }

  function setCheckoutMode(dni, checkInTime) {
    if (dniInput) {
      dniInput.value = dni;
      dniInput.disabled = true;
      dniInput.classList.add("opacity-75", "cursor-not-allowed");
    }
    if (firstTimeFields) {
      firstTimeFields.classList.add("hidden");
    }
    if (submitBtn) {
      submitBtn.dataset.action = "CHECK_OUT";
      submitBtn.disabled = !navigator.onLine;
      submitBtn.className = "w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-[15px] rounded-xl cursor-pointer shadow-lg shadow-emerald-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5";
      if (btnText) btnText.textContent = "Marcar salida";
    }
    if (dni && dni.length === 8) {
      lookupDni(dni);
    }
  }

  // Consulta ultrarrápida al padrón para verificar si ya está registrado
  async function lookupDni(dni) {
    if (!dni || dni.length !== 8) {
      isAttendeeRegistered = null;
      if (attendeeKnownBadge) attendeeKnownBadge.classList.add("hidden");
      if (firstTimeFields) firstTimeFields.classList.add("hidden");
      syncBtn();
      return;
    }

    try {
      var r = await fetch("/asistir/lookup/" + encodeURIComponent(dni));
      var d = await r.json();
      if (d && d.success) {
        if (d.registered) {
          isAttendeeRegistered = true;
          if (attendeeKnownBadge) {
            if (attendeeKnownName) attendeeKnownName.textContent = d.full_name || "Asistente";
            if (attendeeKnownBase) attendeeKnownBase.textContent = d.base_name || "";
            attendeeKnownBadge.classList.remove("hidden");
          }
          if (firstTimeFields) firstTimeFields.classList.add("hidden");
        } else {
          isAttendeeRegistered = false;
          if (attendeeKnownBadge) attendeeKnownBadge.classList.add("hidden");
          if (submitBtn && submitBtn.dataset.action !== "CHECK_OUT") {
            if (firstTimeFields) firstTimeFields.classList.remove("hidden");
          }
        }
      }
    } catch (_) {}
    syncBtn();
  }

  // Hydrate checkout state from localStorage if not rendered by server
  var initialAtt = window.__INITIAL_ATTENDANCE__;
  if (!initialAtt) {
    try {
      var localStr = localStorage.getItem("att_" + code);
      if (localStr) {
        var parsed = JSON.parse(localStr);
        if (parsed && parsed.dni && parsed.check_in_at) {
          setCheckoutMode(parsed.dni, formatTime(parsed.check_in_at));
        }
      }
    } catch (_) {}
  } else if (initialAtt && !initialAtt.check_out_at) {
    setCheckoutMode(initialAtt.dni, formatTime(initialAtt.created_at));
  }

  // 5. Input DNI y validación de padrón
  if (dniInput) {
    dniInput.addEventListener("input", function(e) {
      var v = e.target.value.replace(/[^0-9]/g, "");
      if (v.length > 8) v = v.slice(0, 8);
      if (e.target.value !== v) e.target.value = v;

      clearTimeout(lookupTimer);
      if (v.length === 8) {
        lookupTimer = setTimeout(function() {
          lookupDni(v);
        }, 150);
      } else {
        isAttendeeRegistered = null;
        if (attendeeKnownBadge) attendeeKnownBadge.classList.add("hidden");
        if (firstTimeFields) firstTimeFields.classList.add("hidden");
      }
      syncBtn();
    });
  }

  if (fullNameInput) {
    fullNameInput.addEventListener("input", syncBtn);
  }
  if (baseNameInput) {
    baseNameInput.addEventListener("input", syncBtn);
  }

  function syncBtn() {
    if (!dniInput || !submitBtn) return;
    if (submitBtn.dataset.action === "CHECK_OUT") {
      submitBtn.disabled = !navigator.onLine || !!submitBtn.dataset.busy;
      return;
    }
    var dniOk = dniInput.value.length === 8;
    var extraOk = true;
    if (isAttendeeRegistered === false) {
      var fn = fullNameInput ? fullNameInput.value.trim() : "";
      var bn = baseNameInput ? baseNameInput.value.trim() : "";
      extraOk = fn.length >= 2 && bn.length >= 2;
    }
    var ok = dniOk && extraOk && navigator.onLine && !submitBtn.dataset.busy;
    submitBtn.disabled = !ok;
    submitBtn.className = ok
      ? "w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-[15px] rounded-xl cursor-pointer shadow-lg shadow-blue-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5"
      : "w-full py-3.5 px-4 bg-neutral-800 text-neutral-600 font-semibold text-[15px] rounded-xl cursor-not-allowed transition-all flex items-center justify-center gap-2.5";
  }

  // 6. Envío de Asistencia (Entrada o Salida)
  if (submitBtn) {
    submitBtn.addEventListener("click", function() {
      var dni = dniInput.value.trim();
      if (dni.length !== 8) return;

      if (!navigator.onLine) {
        notice("error", "Sin conexión", "Activa tus datos móviles o Wi-Fi para registrar tu asistencia.");
        return;
      }

      var isCheckout = submitBtn.dataset.action === "CHECK_OUT";
      busy(true, isCheckout ? "Obteniendo ubicación para salida..." : "Obteniendo ubicación GPS...");
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
    var isCheckout = submitBtn && submitBtn.dataset.action === "CHECK_OUT";
    busy(true, isCheckout ? "Registrando salida..." : "Registrando entrada...");
    try {
      var payload = {
        dni: dni,
        latitude: lat,
        longitude: lng,
        accuracy: acc
      };
      if (isAttendeeRegistered === false) {
        if (fullNameInput) payload.full_name = fullNameInput.value.trim();
        if (baseNameInput) payload.base_name = baseNameInput.value.trim();
      }

      var r = await fetch("/asistir/" + encodeURIComponent(code), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      });
      var d = await r.json();
      if (r.ok && d.success) {
        if (d.details && d.details.full_name) {
          isAttendeeRegistered = true;
          if (attendeeKnownBadge) {
            if (attendeeKnownName) attendeeKnownName.textContent = d.details.full_name;
            if (attendeeKnownBase) attendeeKnownBase.textContent = d.details.base_name || "";
            attendeeKnownBadge.classList.remove("hidden");
          }
          if (firstTimeFields) firstTimeFields.classList.add("hidden");
        }

        if (d.action === "CHECK_IN") {
          // Persist in localStorage for recovery
          try {
            localStorage.setItem("att_" + code, JSON.stringify({
              dni: dni,
              check_in_at: d.details ? d.details.check_in_at || d.details.recorded_at : new Date().toISOString()
            }));
          } catch (_) {}

          var inTime = formatTime(d.details ? d.details.check_in_at || d.details.recorded_at : "");
          setCheckoutMode(dni, inTime);
          busy(false);
          notice(
            "info",
            "Entrada registrada a las " + inTime,
            "Tu ingreso fue validado. Al finalizar tu participación, presiona 'Marcar salida' antes de retirarte del evento."
          );
        } else {
          // CHECK_OUT completed
          try {
            localStorage.removeItem("att_" + code);
          } catch (_) {}

          successCheckout(d.message, d.details);
          if (submitBtn) submitBtn.style.display = "none";
          if (dniInput) dniInput.disabled = true;
          var activeBanner = $("checkInActiveBanner");
          if (activeBanner) activeBanner.remove();
        }
      } else {
        if (d.title === "El registro ha finalizado") {
          var isAuto = (d.error || "").indexOf("automáticamente") !== -1;
          badgeOff(isAuto);
          endedView(isAuto);
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
    var isCheckout = submitBtn.dataset.action === "CHECK_OUT";
    if (on) {
      submitBtn.disabled = true;
      btnSpinner.classList.remove("hidden");
      btnText.textContent = txt;
    } else {
      btnSpinner.classList.add("hidden");
      if (isCheckout) {
        submitBtn.disabled = !navigator.onLine;
        btnText.textContent = "Marcar salida";
      } else {
        if (dniInput) dniInput.disabled = false;
        btnText.textContent = "Registrar asistencia";
        syncBtn();
      }
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
    var cls = type === "error"
      ? "bg-red-950/50 border-red-900/40 text-red-300"
      : type === "info"
      ? "bg-emerald-950/50 border-emerald-800/40 text-emerald-300"
      : "bg-neutral-800 border-neutral-700 text-neutral-300";
    var iconSvg = type === "info"
      ? '<svg class="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
      : '<svg class="w-5 h-5 flex-shrink-0 mt-0.5 ' + (type === "error" ? "text-red-400" : "text-neutral-400") + '" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>';

    statusContainer.className = "mt-5 p-4 rounded-xl border " + cls;
    statusContainer.innerHTML =
      '<div class="flex items-start gap-3">' +
      iconSvg +
      '<div><p class="text-[13px] font-semibold">' + esc(title) + '</p><p class="mt-0.5 text-[12px] opacity-90 leading-relaxed">' + esc(msg) + '</p></div></div>';
  }

  function successCheckout(msg, det) {
    if (!statusContainer) return;
    statusContainer.className = "mt-5 p-4 rounded-xl bg-emerald-950/50 border border-emerald-800/40 text-emerald-300";
    var inT = det && det.check_in_at ? formatTime(det.check_in_at) : "";
    var outT = det && det.check_out_at ? formatTime(det.check_out_at) : formatTime(new Date().toISOString());

    var h = '<div class="flex items-start gap-3">' +
      '<svg class="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' +
      '<div><p class="text-[14px] font-semibold text-emerald-200">Asistencia completa confirmada</p>' +
      '<div class="mt-2 text-[12px] text-neutral-300 grid grid-cols-2 gap-2 pt-1.5 border-t border-emerald-800/40 font-mono">' +
      '<div>Entrada: <strong class="text-white">' + esc(inT) + '</strong></div>' +
      '<div>Salida: <strong class="text-white">' + esc(outT) + '</strong></div>' +
      '</div>' +
      '<p class="mt-2.5 text-[11px] text-emerald-400/90">Tu permanencia fue verificada exitosamente. Puedes cerrar esta ventana.</p>' +
      '</div></div>';
    statusContainer.innerHTML = h;
  }

  function esc(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
})();
