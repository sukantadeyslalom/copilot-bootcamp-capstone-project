document.addEventListener("DOMContentLoaded", () => {
  const capabilitiesList = document.getElementById("capabilities-list");
  const capabilitySelect = document.getElementById("capability");
  const registerForm = document.getElementById("register-form");
  const messageDiv = document.getElementById("message");
  const lookupForm = document.getElementById("lookup-form");
  const lookupResults = document.getElementById("lookup-results");
  const supportRequestForm = document.getElementById("support-request-form");
  const supportCapabilitySelect = document.getElementById("support-capability");
  const supportMessage = document.getElementById("support-message");
  const adminContainer = document.getElementById("admin-container");
  const adminSummary = document.getElementById("admin-summary");
  const adminCapabilityForm = document.getElementById("admin-capability-form");
  const adminCapabilitySelect = document.getElementById("admin-capability-select");
  const adminCapacityInput = document.getElementById("admin-capacity");
  const adminDescriptionInput = document.getElementById("admin-description");
  const adminCertificationsInput = document.getElementById("admin-certifications");
  const adminIndustriesInput = document.getElementById("admin-industries");
  const adminSkillLevelsInput = document.getElementById("admin-skill-levels");
  const adminMessage = document.getElementById("admin-message");
  const adminActivityList = document.getElementById("admin-activity-list");
  const adminSupportList = document.getElementById("admin-support-list");
  const searchInput = document.getElementById("search-capabilities");
  const practiceFilter = document.getElementById("practice-filter");
  const industryFilter = document.getElementById("industry-filter");
  const certificationFilter = document.getElementById("certification-filter");
  const sortSelect = document.getElementById("sort-capabilities");
  const resetFiltersButton = document.getElementById("reset-filters-btn");
  const resultsSummary = document.getElementById("results-summary");
  const authStatus = document.getElementById("auth-status");
  const openLoginButton = document.getElementById("open-login-btn");
  const logoutButton = document.getElementById("logout-btn");
  const loginModal = document.getElementById("login-modal");
  const closeLoginButton = document.getElementById("close-login-btn");
  const loginForm = document.getElementById("login-form");
  const loginMessage = document.getElementById("login-message");

  let currentUser = null;
  let capabilitiesData = {};

  function showMessage(target, text, type) {
    target.textContent = text;
    target.className = type;
    target.classList.remove("hidden");
  }

  function hideMessage(target) {
    target.classList.add("hidden");
  }

  function canManageCapability(details) {
    if (!currentUser) {
      return false;
    }

    return currentUser.practice_areas.includes("All") ||
      currentUser.practice_areas.includes(details.practice_area);
  }

  function updateAuthUI() {
    if (currentUser) {
      authStatus.textContent = `${currentUser.role}: ${currentUser.username} (${currentUser.practice_areas.join(", ")})`;
      openLoginButton.classList.add("hidden");
      logoutButton.classList.remove("hidden");
    } else {
      authStatus.textContent = "Consultant mode";
      openLoginButton.classList.remove("hidden");
      logoutButton.classList.add("hidden");
    }
  }

  function openLoginModal() {
    hideMessage(loginMessage);
    loginModal.classList.remove("hidden");
  }

  function closeLoginModal() {
    loginModal.classList.add("hidden");
    loginForm.reset();
    hideMessage(loginMessage);
  }

  async function refreshAuthSession() {
    const response = await fetch("/auth/session");
    const result = await response.json();
    currentUser = result.authenticated ? result.user : null;
    updateAuthUI();
  }

  function populateFilterOptions(selectElement, values, allLabel) {
    const previousValue = selectElement.value;
    selectElement.innerHTML = `<option value="">${allLabel}</option>`;

    values.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      selectElement.appendChild(option);
    });

    if (previousValue && values.includes(previousValue)) {
      selectElement.value = previousValue;
    }
  }

  function populateCapabilityOptions(selectElement, capabilityNames, placeholder) {
    const previousValue = selectElement.value;
    selectElement.innerHTML = `<option value="">${placeholder}</option>`;

    capabilityNames.forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      selectElement.appendChild(option);
    });

    if (previousValue && capabilityNames.includes(previousValue)) {
      selectElement.value = previousValue;
    }
  }

  function refreshFilterOptions(capabilities) {
    const practiceAreas = new Set();
    const industries = new Set();
    const certifications = new Set();

    Object.values(capabilities).forEach((details) => {
      if (details.practice_area) {
        practiceAreas.add(details.practice_area);
      }

      (details.industry_verticals || []).forEach((industry) => {
        industries.add(industry);
      });

      (details.certifications || []).forEach((certification) => {
        certifications.add(certification);
      });
    });

    populateFilterOptions(practiceFilter, [...practiceAreas].sort(), "All practice areas");
    populateFilterOptions(industryFilter, [...industries].sort(), "All industries");
    populateFilterOptions(certificationFilter, [...certifications].sort(), "All certifications");
  }

  function getFilteredCapabilities() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedPractice = practiceFilter.value;
    const selectedIndustry = industryFilter.value;
    const selectedCertification = certificationFilter.value;
    const sortBy = sortSelect.value;

    const filteredEntries = Object.entries(capabilitiesData).filter(([name, details]) => {
      const searchMatches =
        !searchTerm ||
        name.toLowerCase().includes(searchTerm) ||
        (details.description || "").toLowerCase().includes(searchTerm);

      const practiceMatches = !selectedPractice || details.practice_area === selectedPractice;
      const industryMatches =
        !selectedIndustry || (details.industry_verticals || []).includes(selectedIndustry);
      const certificationMatches =
        !selectedCertification || (details.certifications || []).includes(selectedCertification);

      return searchMatches && practiceMatches && industryMatches && certificationMatches;
    });

    filteredEntries.sort((leftEntry, rightEntry) => {
      const [leftName, leftDetails] = leftEntry;
      const [rightName, rightDetails] = rightEntry;

      if (sortBy === "capacity") {
        return (rightDetails.capacity || 0) - (leftDetails.capacity || 0) || leftName.localeCompare(rightName);
      }

      if (sortBy === "team") {
        return (rightDetails.consultants?.length || 0) - (leftDetails.consultants?.length || 0) || leftName.localeCompare(rightName);
      }

      return leftName.localeCompare(rightName);
    });

    return filteredEntries;
  }

  function getManagedCapabilityNames() {
    return Object.entries(capabilitiesData)
      .filter(([, details]) => canManageCapability(details))
      .map(([name]) => name)
      .sort((leftName, rightName) => leftName.localeCompare(rightName));
  }

  function refreshCapabilitySelections() {
    const allCapabilityNames = Object.keys(capabilitiesData).sort((leftName, rightName) => leftName.localeCompare(rightName));
    populateCapabilityOptions(capabilitySelect, allCapabilityNames, "-- Select a capability --");
    populateCapabilityOptions(supportCapabilitySelect, allCapabilityNames, "-- Select a capability --");
    populateCapabilityOptions(adminCapabilitySelect, getManagedCapabilityNames(), "-- Select a managed capability --");
  }

  function toCommaSeparatedText(values) {
    return (values || []).join(", ");
  }

  function fillAdminForm(capabilityName) {
    const details = capabilitiesData[capabilityName];

    if (!details) {
      adminCapacityInput.value = "";
      adminDescriptionInput.value = "";
      adminCertificationsInput.value = "";
      adminIndustriesInput.value = "";
      adminSkillLevelsInput.value = "";
      return;
    }

    adminCapacityInput.value = details.capacity || 0;
    adminDescriptionInput.value = details.description || "";
    adminCertificationsInput.value = toCommaSeparatedText(details.certifications);
    adminIndustriesInput.value = toCommaSeparatedText(details.industry_verticals);
    adminSkillLevelsInput.value = toCommaSeparatedText(details.skill_levels);
  }

  function splitCommaSeparatedValues(value) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function formatTimestamp(value) {
    if (!value) {
      return "Recently";
    }

    return new Date(value).toLocaleString();
  }

  function renderAdminOverview(overview) {
    adminContainer.classList.remove("hidden");

    adminSummary.innerHTML = `
      <div class="summary-card">
        <span class="summary-value">${overview.summary.managed_capability_count}</span>
        <span class="summary-label">Managed capabilities</span>
      </div>
      <div class="summary-card">
        <span class="summary-value">${overview.summary.total_consultants}</span>
        <span class="summary-label">Registered consultants</span>
      </div>
      <div class="summary-card">
        <span class="summary-value">${overview.summary.total_capacity}</span>
        <span class="summary-label">Hours of weekly capacity</span>
      </div>
      <div class="summary-card">
        <span class="summary-value">${overview.summary.pending_support_requests}</span>
        <span class="summary-label">Pending support requests</span>
      </div>
    `;

    if (overview.recent_activity.length === 0) {
      adminActivityList.innerHTML = '<p>No recent activity yet.</p>';
    } else {
      adminActivityList.innerHTML = overview.recent_activity
        .map((event) => `
          <div class="timeline-item">
            <p><strong>${event.action.replaceAll("_", " ")}</strong></p>
            <p>${event.actor}${event.capability_name ? ` on ${event.capability_name}` : ""}</p>
            <p class="timestamp-text">${formatTimestamp(event.timestamp)}</p>
          </div>
        `)
        .join("");
    }

    if (overview.support_requests.length === 0) {
      adminSupportList.innerHTML = '<p>No support requests waiting for review.</p>';
    } else {
      adminSupportList.innerHTML = overview.support_requests
        .map((request) => `
          <div class="timeline-item">
            <p><strong>${request.request_type}</strong> for ${request.capability_name}</p>
            <p>${request.email}</p>
            <p>${request.note || "No additional notes provided."}</p>
            <p class="timestamp-text">${formatTimestamp(request.submitted_at)}</p>
          </div>
        `)
        .join("");
    }

    refreshCapabilitySelections();

    if (!adminCapabilitySelect.value) {
      adminCapabilitySelect.value = getManagedCapabilityNames()[0] || "";
    }

    fillAdminForm(adminCapabilitySelect.value);
  }

  async function refreshAdminOverview() {
    if (!currentUser) {
      adminContainer.classList.add("hidden");
      adminSummary.innerHTML = "";
      adminActivityList.innerHTML = "";
      adminSupportList.innerHTML = "";
      adminCapabilityForm.reset();
      return;
    }

    try {
      const response = await fetch("/admin/overview");
      const result = await response.json();

      if (!response.ok) {
        adminContainer.classList.add("hidden");
        return;
      }

      renderAdminOverview(result);
    } catch (error) {
      adminContainer.classList.add("hidden");
      console.error("Error loading admin overview:", error);
    }
  }

  function renderCapabilities() {
    const filteredEntries = getFilteredCapabilities();

    capabilitiesList.innerHTML = "";

    resultsSummary.textContent = `Showing ${filteredEntries.length} of ${Object.keys(capabilitiesData).length} capabilities`;

    if (filteredEntries.length === 0) {
      capabilitiesList.innerHTML = `
        <div class="empty-state">
          <h4>No capabilities match these filters.</h4>
          <p>Try broadening the search or reset the filters to see the full catalog again.</p>
        </div>
      `;
      return;
    }

    filteredEntries.forEach(([name, details]) => {
      const capabilityCard = document.createElement("div");
      capabilityCard.className = "capability-card";

      const availableCapacity = details.capacity || 0;
      const currentConsultants = details.consultants ? details.consultants.length : 0;
      const certifications = (details.certifications || [])
        .map((certification) => `<span class="tag-chip">${certification}</span>`)
        .join("");
      const industries = (details.industry_verticals || [])
        .map((industry) => `<span class="tag-chip tag-chip-muted">${industry}</span>`)
        .join("");

      const consultantsHTML =
        details.consultants && details.consultants.length > 0
          ? `<div class="consultants-section">
              <h5>Registered Consultants:</h5>
              <ul class="consultants-list">
                ${details.consultants
                  .map(
                    (email) =>
                      `<li><span class="consultant-email">${email}</span>${canManageCapability(details) ? `<button class="delete-btn" data-capability="${name}" data-email="${email}">Remove</button>` : ""}</li>`
                  )
                  .join("")}
              </ul>
            </div>`
          : `<p><em>No consultants registered yet</em></p>`;

      const managementNote = canManageCapability(details)
        ? '<p class="management-note">You can manage registrations for this practice area.</p>'
        : '<p class="management-note">Practice lead sign-in is required to remove consultants.</p>';

      capabilityCard.innerHTML = `
        <h4>${name}</h4>
        <p>${details.description}</p>
        <p><strong>Practice Area:</strong> ${details.practice_area}</p>
        <p><strong>Capacity:</strong> ${availableCapacity} hours/week available</p>
        <p><strong>Current Team:</strong> ${currentConsultants} consultants</p>
        ${managementNote}
        <div class="meta-group">
          <span class="meta-label">Industry Verticals</span>
          <div class="tag-row">${industries || '<span class="tag-chip tag-chip-muted">Not specified</span>'}</div>
        </div>
        <div class="meta-group">
          <span class="meta-label">Certifications</span>
          <div class="tag-row">${certifications || '<span class="tag-chip">None listed</span>'}</div>
        </div>
        <div class="consultants-container">
          ${consultantsHTML}
        </div>
      `;

      capabilitiesList.appendChild(capabilityCard);
    });

    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", handleUnregister);
    });
  }

  // Function to fetch capabilities from API
  async function fetchCapabilities() {
    try {
      const response = await fetch("/capabilities");
      capabilitiesData = await response.json();
      refreshFilterOptions(capabilitiesData);
      refreshCapabilitySelections();
      renderCapabilities();
    } catch (error) {
      resultsSummary.textContent = "Unable to load capabilities";
      capabilitiesList.innerHTML =
        "<p>Failed to load capabilities. Please try again later.</p>";
      console.error("Error fetching capabilities:", error);
    }
  }

  // Handle unregister functionality
  async function handleUnregister(event) {
    const button = event.target;
    const capability = button.getAttribute("data-capability");
    const email = button.getAttribute("data-email");

    try {
      const response = await fetch(
        `/capabilities/${encodeURIComponent(
          capability
        )}/unregister?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(messageDiv, result.message, "success");

        // Refresh capabilities list to show updated consultants
        await fetchCapabilities();
        await refreshAdminOverview();
      } else {
        showMessage(messageDiv, result.detail || "An error occurred", "error");
      }

      // Hide message after 5 seconds
      setTimeout(() => {
        hideMessage(messageDiv);
      }, 5000);
    } catch (error) {
      showMessage(messageDiv, "Failed to unregister. Please try again.", "error");
      console.error("Error unregistering:", error);
    }
  }

  // Handle form submission
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const capability = document.getElementById("capability").value;

    try {
      const response = await fetch(
        `/capabilities/${encodeURIComponent(
          capability
        )}/register?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(messageDiv, result.message, "success");
        registerForm.reset();

        // Refresh capabilities list to show updated consultants
        await fetchCapabilities();
        await refreshAdminOverview();
      } else {
        showMessage(messageDiv, result.detail || "An error occurred", "error");
      }

      // Hide message after 5 seconds
      setTimeout(() => {
        hideMessage(messageDiv);
      }, 5000);
    } catch (error) {
      showMessage(messageDiv, "Failed to register. Please try again.", "error");
      console.error("Error registering:", error);
    }
  });

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: document.getElementById("username").value,
          password: document.getElementById("password").value,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        showMessage(loginMessage, result.detail || "Unable to sign in", "error");
        return;
      }

      currentUser = result.user;
      updateAuthUI();
      closeLoginModal();
      showMessage(messageDiv, result.message, "success");
      await fetchCapabilities();
      await refreshAdminOverview();
    } catch (error) {
      showMessage(loginMessage, "Unable to sign in right now.", "error");
      console.error("Error signing in:", error);
    }
  });

  openLoginButton.addEventListener("click", openLoginModal);
  closeLoginButton.addEventListener("click", closeLoginModal);

  logoutButton.addEventListener("click", async () => {
    try {
      const response = await fetch("/auth/logout", {
        method: "POST",
      });
      const result = await response.json();

      if (!response.ok) {
        showMessage(messageDiv, result.detail || "Unable to sign out", "error");
        return;
      }

      currentUser = null;
      updateAuthUI();
      await fetchCapabilities();
      await refreshAdminOverview();
      showMessage(messageDiv, result.message, "info");
    } catch (error) {
      showMessage(messageDiv, "Unable to sign out right now.", "error");
      console.error("Error signing out:", error);
    }
  });

  lookupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("lookup-email").value;

    try {
      const response = await fetch(`/consultants/${encodeURIComponent(email)}/registrations`);
      const result = await response.json();

      if (!response.ok) {
        showMessage(lookupResults, result.detail || "Unable to load registrations", "error");
        return;
      }

      lookupResults.className = "info-card";
      lookupResults.classList.remove("hidden");
      lookupResults.innerHTML = `
        <h4>${result.email}</h4>
        <p>${result.registration_count} capability registrations found.</p>
        <div class="tag-row">${result.registrations.length > 0 ? result.registrations.map((registration) => `<span class="tag-chip">${registration}</span>`).join("") : '<span class="tag-chip tag-chip-muted">No registrations yet</span>'}</div>
      `;
    } catch (error) {
      showMessage(lookupResults, "Unable to load registrations right now.", "error");
      console.error("Error loading registrations:", error);
    }
  });

  supportRequestForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      const capabilityName = supportCapabilitySelect.value;
      const response = await fetch(`/capabilities/${encodeURIComponent(capabilityName)}/support-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: document.getElementById("support-email").value,
          request_type: document.getElementById("support-request-type").value,
          note: document.getElementById("support-note").value,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        showMessage(supportMessage, result.detail || "Unable to submit support request", "error");
        return;
      }

      showMessage(supportMessage, result.message, "success");
      supportRequestForm.reset();
      await refreshAdminOverview();
    } catch (error) {
      showMessage(supportMessage, "Unable to submit support request right now.", "error");
      console.error("Error submitting support request:", error);
    }
  });

  adminCapabilitySelect.addEventListener("change", () => {
    fillAdminForm(adminCapabilitySelect.value);
  });

  adminCapabilityForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      const capabilityName = adminCapabilitySelect.value;
      const response = await fetch(`/capabilities/${encodeURIComponent(capabilityName)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          capacity: Number(adminCapacityInput.value),
          description: adminDescriptionInput.value,
          certifications: splitCommaSeparatedValues(adminCertificationsInput.value),
          industry_verticals: splitCommaSeparatedValues(adminIndustriesInput.value),
          skill_levels: splitCommaSeparatedValues(adminSkillLevelsInput.value),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        showMessage(adminMessage, result.detail || "Unable to update capability", "error");
        return;
      }

      showMessage(adminMessage, result.message, "success");
      await fetchCapabilities();
      await refreshAdminOverview();
      adminCapabilitySelect.value = capabilityName;
      fillAdminForm(capabilityName);
    } catch (error) {
      showMessage(adminMessage, "Unable to update capability right now.", "error");
      console.error("Error updating capability:", error);
    }
  });

  loginModal.addEventListener("click", (event) => {
    if (event.target === loginModal) {
      closeLoginModal();
    }
  });

  [searchInput, practiceFilter, industryFilter, certificationFilter, sortSelect].forEach((control) => {
    control.addEventListener("input", renderCapabilities);
    control.addEventListener("change", renderCapabilities);
  });

  resetFiltersButton.addEventListener("click", () => {
    searchInput.value = "";
    practiceFilter.value = "";
    industryFilter.value = "";
    certificationFilter.value = "";
    sortSelect.value = "name";
    renderCapabilities();
  });

  // Initialize app
  async function initializeApp() {
    await refreshAuthSession();
    await fetchCapabilities();
    await refreshAdminOverview();
  }

  initializeApp();
});
