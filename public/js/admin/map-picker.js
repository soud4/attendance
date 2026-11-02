/**
 * Reusable Leaflet Map Picker Component for Admin Modals and Forms
 */
(function (window) {
  function initMapPicker(options) {
    const config = Object.assign(
      {
        containerId: "modalEventMap",
        latInputId: "modal_latitude",
        lonInputId: "modal_longitude",
        radiusInputId: "modal_radius_meters",
        locationNameInputId: "modal_location_name",
        osmStatusId: "modalOsmStatus",
        gmapsBtnId: "modalGmapsBtn",
        defaultLat: -12.046374,
        defaultLon: -77.042793,
        defaultRadius: 100,
        zoom: 16,
      },
      options || {}
    );

    const mapEl = document.getElementById(config.containerId);
    if (!mapEl || typeof L === "undefined") return null;

    const latInput = document.getElementById(config.latInputId);
    const lonInput = document.getElementById(config.lonInputId);
    const radiusInput = document.getElementById(config.radiusInputId);
    const locInput = document.getElementById(config.locationNameInputId);
    const osmStatus = document.getElementById(config.osmStatusId);
    const gmapsBtn = document.getElementById(config.gmapsBtnId);

    const startLat = latInput && latInput.value ? parseFloat(latInput.value) : config.defaultLat;
    const startLon = lonInput && lonInput.value ? parseFloat(lonInput.value) : config.defaultLon;
    const startRadius = radiusInput && radiusInput.value ? parseInt(radiusInput.value, 10) : config.defaultRadius;

    const map = L.map(config.containerId, {
      scrollWheelZoom: false,
    }).setView([startLat, startLon], config.zoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "",
    }).addTo(map);

    const marker = L.marker([startLat, startLon], { draggable: true }).addTo(map);
    const circle = L.circle([startLat, startLon], {
      color: "#3b82f6",
      fillColor: "#3b82f6",
      fillOpacity: 0.2,
      radius: startRadius,
    }).addTo(map);

    function updateCoords(lat, lon, fetchOsm) {
      if (latInput) latInput.value = lat.toFixed(6);
      if (lonInput) lonInput.value = lon.toFixed(6);
      marker.setLatLng([lat, lon]);
      circle.setLatLng([lat, lon]);

      if (gmapsBtn) {
        gmapsBtn.href = `https://www.google.com/maps?q=${lat},${lon}`;
      }

      if (fetchOsm && locInput && osmStatus) {
        osmStatus.textContent = "Buscando dirección OSM...";
        fetch(`/api/geo/reverse?lat=${lat}&lon=${lon}`)
          .then((r) => r.json())
          .then((data) => {
            if (data.display_name) {
              locInput.value = data.display_name;
              osmStatus.textContent = "Ubicación detectada de OSM";
              setTimeout(() => {
                osmStatus.textContent = "";
              }, 3000);
            } else {
              osmStatus.textContent = "";
            }
          })
          .catch(() => {
            osmStatus.textContent = "";
          });
      }
    }

    marker.on("dragend", function (e) {
      const pos = e.target.getLatLng();
      updateCoords(pos.lat, pos.lng, true);
    });

    map.on("click", function (e) {
      updateCoords(e.latlng.lat, e.latlng.lng, true);
    });

    if (latInput && lonInput) {
      const handleManualInput = () => {
        const lt = parseFloat(latInput.value);
        const lg = parseFloat(lonInput.value);
        if (!isNaN(lt) && !isNaN(lg)) {
          map.setView([lt, lg]);
          updateCoords(lt, lg, false);
        }
      };
      latInput.addEventListener("change", handleManualInput);
      lonInput.addEventListener("change", handleManualInput);
    }

    if (radiusInput) {
      radiusInput.addEventListener("input", function () {
        const r = parseInt(radiusInput.value, 10) || 100;
        circle.setRadius(r);
      });
    }

    return {
      map,
      marker,
      circle,
      updateCoords,
      setRadius: function (r) {
        if (radiusInput) radiusInput.value = r;
        circle.setRadius(r);
      },
      invalidateSize: function () {
        setTimeout(() => map.invalidateSize(), 200);
      },
    };
  }

  window.initMapPicker = initMapPicker;
})(window);
