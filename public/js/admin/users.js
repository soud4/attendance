/**
 * Admin Users & Coordinators - Client Interactivity
 */
(function (window) {
  let activeUserRoleFilter = "ALL";
  let activeUserOrder = "DESC"; // DESC = recientes primero, ASC = antiguos primero

  function lockBodyScroll() {
    document.documentElement.classList.add("overflow-hidden");
    document.body.classList.add("overflow-hidden");
  }

  function unlockBodyScroll() {
    document.documentElement.classList.remove("overflow-hidden");
    document.body.classList.remove("overflow-hidden");
  }

  window.openCreateUserModal = function () {
    const m = document.getElementById("userCreateModal");
    if (m) m.classList.remove("hidden");
    lockBodyScroll();
    const inp = document.getElementById("create_identifier");
    if (inp) inp.focus();
  };

  window.closeCreateUserModal = function () {
    const m = document.getElementById("userCreateModal");
    if (m) m.classList.add("hidden");
    unlockBodyScroll();
  };

  window.openEditUserModal = function (user) {
    const m = document.getElementById("userEditModal");
    if (!m) return;
    lockBodyScroll();
    const form = document.getElementById("editCoordinatorForm");
    if (form) form.action = "/admin/users/" + user.id + "/edit";

    const dniEl = document.getElementById("edit_identifier");
    const dniBadge = document.getElementById("editUserDniBadge");
    const nameEl = document.getElementById("edit_full_name");
    const roleEl = document.getElementById("edit_role");
    const passEl = document.getElementById("edit_password");
    const roleWarn = document.getElementById("editRoleWarning");

    if (dniEl) dniEl.value = user.identifier;
    if (dniBadge) dniBadge.textContent = "DNI: " + user.identifier;
    if (nameEl) nameEl.value = user.full_name;
    if (roleEl) {
      roleEl.value = user.role;
      if (user.isSuperAdmin) {
        roleEl.disabled = true;
        if (roleWarn) roleWarn.classList.remove("hidden");
      } else {
        roleEl.disabled = false;
        if (roleWarn) roleWarn.classList.add("hidden");
      }
    }
    if (passEl) passEl.value = "";

    m.classList.remove("hidden");
  };

  window.closeEditUserModal = function () {
    const m = document.getElementById("userEditModal");
    if (m) m.classList.add("hidden");
    unlockBodyScroll();
  };

  window.openDeleteUserModal = function (id, encodedName) {
    const m = document.getElementById("userDeleteModal");
    if (!m) return;
    lockBodyScroll();
    const form = document.getElementById("deleteUserForm");
    if (form) form.action = "/admin/users/" + id + "/delete";
    const nameEl = document.getElementById("deleteUserName");
    if (nameEl) nameEl.textContent = decodeURIComponent(encodedName);
    m.classList.remove("hidden");
  };

  window.closeDeleteUserModal = function () {
    const m = document.getElementById("userDeleteModal");
    if (m) m.classList.add("hidden");
    unlockBodyScroll();
  };

  // Modal escape listener
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      window.closeCreateUserModal();
      window.closeEditUserModal();
      window.closeDeleteUserModal();
    }
  });

  // Role Filter Tabs
  window.setUserRoleFilter = function (role) {
    activeUserRoleFilter = role;
    document.querySelectorAll(".user-role-tab").forEach(function (btn) {
      if (btn.getAttribute("data-role") === role) {
        btn.className = "user-role-tab flex-1 py-1 text-[11px] font-semibold rounded-lg bg-neutral-700 text-white shadow-sm transition-all cursor-pointer text-center";
      } else {
        btn.className = "user-role-tab flex-1 py-1 text-[11px] font-semibold rounded-lg text-neutral-400 hover:text-neutral-200 transition-all cursor-pointer text-center";
      }
    });
    window.filterUsers();
  };

  // Order Toggle
  window.toggleUserOrder = function () {
    activeUserOrder = activeUserOrder === "DESC" ? "ASC" : "DESC";
    const descIcon = document.getElementById("orderDescIcon");
    const ascIcon = document.getElementById("orderAscIcon");
    const label = document.getElementById("orderLabelText");

    if (activeUserOrder === "DESC") {
      if (descIcon) descIcon.classList.remove("hidden");
      if (ascIcon) ascIcon.classList.add("hidden");
      if (label) label.textContent = "Recientes";
    } else {
      if (descIcon) descIcon.classList.add("hidden");
      if (ascIcon) ascIcon.classList.remove("hidden");
      if (label) label.textContent = "Antiguos";
    }
    window.sortAndFilterUsers();
  };

  window.clearUserSearchInput = function () {
    const inp = document.getElementById("userSearchInput");
    if (inp) inp.value = "";
    const clr = document.getElementById("clearUserSearch");
    if (clr) clr.classList.add("hidden");
    window.filterUsers();
  };

  window.resetUserFilters = function () {
    const search = document.getElementById("userSearchInput");
    const date = document.getElementById("userDateFilter");
    if (search) search.value = "";
    if (date) date.value = "";
    const clr = document.getElementById("clearUserSearch");
    if (clr) clr.classList.add("hidden");
    activeUserOrder = "DESC";
    window.setUserRoleFilter("ALL");
  };

  // Core Filter Engine
  window.filterUsers = function () {
    const searchInput = document.getElementById("userSearchInput");
    const dateInput = document.getElementById("userDateFilter");
    const clr = document.getElementById("clearUserSearch");

    const query = (searchInput ? searchInput.value : "").trim().toLowerCase();
    const dateFilter = dateInput ? dateInput.value : "";

    if (clr) {
      if (query.length > 0) clr.classList.remove("hidden");
      else clr.classList.add("hidden");
    }

    const items = document.querySelectorAll(".user-item");
    let visibleCount = 0;

    items.forEach(function (item) {
      const dni = (item.getAttribute("data-dni") || "").toLowerCase();
      const name = (item.getAttribute("data-name") || "").toLowerCase();
      const role = item.getAttribute("data-role") || "";
      const date = item.getAttribute("data-date") || "";

      const matchSearch = !query || dni.includes(query) || name.includes(query);
      const matchRole = activeUserRoleFilter === "ALL" || role === activeUserRoleFilter;
      const matchDate = !dateFilter || date === dateFilter;

      const isVisible = matchSearch && matchRole && matchDate;
      if (isVisible) {
        item.style.display = "";
        visibleCount++;
      } else {
        item.style.display = "none";
      }
    });

    const isDesktop = window.innerWidth >= 768;
    const finalCount = isDesktop
      ? document.querySelectorAll("#userTableBody .user-item:not([style*='display: none'])").length
      : document.querySelectorAll("#userMobileContainer .user-item:not([style*='display: none'])").length;

    const countEl = document.getElementById("userVisibleCount");
    if (countEl) countEl.textContent = finalCount;

    const emptyMsg = document.getElementById("userEmptyFilterMessage");
    if (emptyMsg) {
      if (finalCount === 0) emptyMsg.classList.remove("hidden");
      else emptyMsg.classList.add("hidden");
    }
  };

  window.sortAndFilterUsers = function () {
    const mobileContainer = document.getElementById("userMobileContainer");
    const tableBody = document.getElementById("userTableBody");

    function sortElements(container) {
      if (!container) return;
      const rows = Array.from(container.children).filter((el) => el.classList.contains("user-item"));
      rows.sort(function (a, b) {
        const idA = parseInt(a.getAttribute("data-id") || "0", 10);
        const idB = parseInt(b.getAttribute("data-id") || "0", 10);
        return activeUserOrder === "DESC" ? idB - idA : idA - idB;
      });
      rows.forEach((r) => container.appendChild(r));
    }

    sortElements(mobileContainer);
    sortElements(tableBody);
    window.filterUsers();
  };
})(window);
