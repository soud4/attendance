/**
 * Admin Dashboard - Client Interactivity (Filters, Sorting, Modals, Clipboard)
 */
(function (window) {
  let modalMapInstance = null;
  let activeEventTab = "ALL";
  let activeEventOrder = "DESC";

  function lockBodyScroll() {
    document.documentElement.classList.add("overflow-hidden");
    document.body.classList.add("overflow-hidden");
  }

  function unlockBodyScroll() {
    document.documentElement.classList.remove("overflow-hidden");
    document.body.classList.remove("overflow-hidden");
  }

  // Modal Map & Creation
  window.openQuickCreateModal = function () {
    const modal = document.getElementById("quickCreateModal");
    if (modal) modal.classList.remove("hidden");
    lockBodyScroll();

    if (!modalMapInstance && typeof window.initMapPicker === "function") {
      modalMapInstance = window.initMapPicker({
        containerId: "modalEventMap",
        latInputId: "modal_latitude",
        lonInputId: "modal_longitude",
        radiusInputId: "modal_radius_meters",
        locationNameInputId: "modal_location_name",
        osmStatusId: "modalOsmStatus",
        gmapsBtnId: "modalGmapsBtn",
      });

      const osmBtn = document.getElementById("modalQueryOsmBtn");
      if (osmBtn && modalMapInstance) {
        osmBtn.addEventListener("click", () => {
          const latInput = document.getElementById("modal_latitude");
          const lonInput = document.getElementById("modal_longitude");
          if (latInput && lonInput) {
            modalMapInstance.updateCoords(parseFloat(latInput.value), parseFloat(lonInput.value), true);
          }
        });
      }

      const geoBtn = document.getElementById("modalGeoBtn");
      if (geoBtn && modalMapInstance) {
        geoBtn.addEventListener("click", () => {
          if (!navigator.geolocation) return alert("Geolocalización no soportada por el navegador");
          navigator.geolocation.getCurrentPosition((pos) => {
            modalMapInstance.map.setView([pos.coords.latitude, pos.coords.longitude], 17);
            modalMapInstance.updateCoords(pos.coords.latitude, pos.coords.longitude, true);
          });
        });
      }

      const mForm = document.getElementById("modalCreateEventForm");
      if (mForm) {
        mForm.addEventListener("submit", function () {
          const d = document.getElementById("modal_event_date")?.value;
          const st = document.getElementById("modal_start_time")?.value;
          const et = document.getElementById("modal_end_time")?.value;
          const startsAtEl = document.getElementById("modal_starts_at");
          const endsAtEl = document.getElementById("modal_ends_at");
          if (d && st && startsAtEl) startsAtEl.value = d + "T" + st;
          if (d && et && endsAtEl) endsAtEl.value = d + "T" + et;
        });
      }
    }

    if (modalMapInstance) {
      modalMapInstance.invalidateSize();
    }
  };

  window.closeQuickCreateModal = function () {
    const modal = document.getElementById("quickCreateModal");
    if (modal) modal.classList.add("hidden");
    unlockBodyScroll();
  };

  window.setModalRadius = function (r) {
    if (modalMapInstance) {
      modalMapInstance.setRadius(r);
    } else {
      const radiusInput = document.getElementById("modal_radius_meters");
      if (radiusInput) radiusInput.value = r;
    }
  };

  // Close modal on Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") window.closeQuickCreateModal();
  });

  // Filter & Sorting Logic
  window.setEventStatusTab = function (status) {
    activeEventTab = status;
    document.querySelectorAll(".event-tab-btn").forEach((btn) => {
      if (btn.getAttribute("data-tab") === status) {
        btn.classList.add("bg-neutral-800", "border-neutral-700", "text-white", "shadow-sm");
        btn.classList.remove("border-transparent", "text-neutral-400");
      } else {
        btn.classList.remove("bg-neutral-800", "border-neutral-700", "text-white", "shadow-sm");
        btn.classList.add("border-transparent", "text-neutral-400");
      }
    });
    window.filterAndSortEvents();
  };

  window.clearEventDateFilter = function () {
    const dateInput = document.getElementById("eventDateFilter");
    if (dateInput) dateInput.value = "";
    const clearBtn = document.getElementById("eventDateClearBtn");
    if (clearBtn) clearBtn.classList.add("hidden");
    window.filterAndSortEvents();
  };

  window.toggleEventOrder = function () {
    activeEventOrder = activeEventOrder === "DESC" ? "ASC" : "DESC";
    const label = document.getElementById("eventOrderLabel");
    if (label) label.textContent = activeEventOrder === "DESC" ? "Recientes" : "Antiguos";
    window.filterAndSortEvents();
  };

  window.resetEventFilters = function () {
    const searchInput = document.getElementById("eventSearchInput");
    if (searchInput) searchInput.value = "";
    window.clearEventDateFilter();
    window.setEventStatusTab("ALL");
  };

  window.filterAndSortEvents = function () {
    const searchInput = document.getElementById("eventSearchInput");
    const query = (searchInput ? searchInput.value : "").toLowerCase().trim();

    const dateInput = document.getElementById("eventDateFilter");
    const selectedDate = dateInput ? dateInput.value : "";

    const clearBtn = document.getElementById("eventDateClearBtn");
    if (clearBtn) {
      if (selectedDate) clearBtn.classList.remove("hidden");
      else clearBtn.classList.add("hidden");
    }

    // Sort containers
    const cardsContainer = document.getElementById("eventCardsContainer");
    const mobileContainer = document.getElementById("eventTableMobileContainer");
    const tableBody = document.getElementById("eventTableBody");

    function sortContainer(container) {
      if (!container) return;
      const items = Array.from(container.children).filter((el) => el.classList.contains("event-item"));
      items.sort((a, b) => {
        const idA = parseInt(a.getAttribute("data-id") || "0", 10);
        const idB = parseInt(b.getAttribute("data-id") || "0", 10);
        return activeEventOrder === "DESC" ? idB - idA : idA - idB;
      });
      items.forEach((el) => container.appendChild(el));
    }

    sortContainer(cardsContainer);
    sortContainer(mobileContainer);
    sortContainer(tableBody);

    // Filter items
    const allItems = document.querySelectorAll(".event-item");
    allItems.forEach((item) => {
      const title = (item.getAttribute("data-title") || "").toLowerCase();
      const location = (item.getAttribute("data-location") || "").toLowerCase();
      const code = (item.getAttribute("data-code") || "").toLowerCase();
      const status = item.getAttribute("data-status") || "";
      const date = item.getAttribute("data-date") || "";

      const matchesStatus = activeEventTab === "ALL" || status === activeEventTab;
      const matchesSearch = !query || title.includes(query) || location.includes(query) || code.includes(query);
      const matchesDate = !selectedDate || date === selectedDate || date.startsWith(selectedDate);

      if (matchesStatus && matchesSearch && matchesDate) {
        item.style.display = "";
      } else {
        item.style.display = "none";
      }
    });

    // Calculate visible count
    let visibleCount = 0;
    if (cardsContainer) {
      visibleCount = cardsContainer.querySelectorAll(".event-item:not([style*='display: none'])").length;
    } else if (tableBody) {
      const isDesktop = window.innerWidth >= 768;
      visibleCount = isDesktop
        ? tableBody.querySelectorAll(".event-item:not([style*='display: none'])").length
        : mobileContainer
        ? mobileContainer.querySelectorAll(".event-item:not([style*='display: none'])").length
        : 0;
    }

    const countEl = document.getElementById("eventVisibleCount");
    if (countEl) countEl.textContent = visibleCount;

    const emptyMsg = document.getElementById("eventEmptyFilterMessage");
    if (emptyMsg) {
      if (visibleCount === 0) emptyMsg.classList.remove("hidden");
      else emptyMsg.classList.add("hidden");
    }
  };

  // Clipboard copy
  window.copyLink = function (path, btn) {
    const fullUrl = window.location.origin + path;
    navigator.clipboard.writeText(fullUrl).then(() => {
      const originalText = btn.textContent;
      btn.textContent = "¡Copiado!";
      btn.classList.add("text-emerald-400");
      setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove("text-emerald-400");
      }, 1500);
    });
  };
})(window);
