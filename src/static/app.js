document.addEventListener("DOMContentLoaded", () => {
  const capabilitiesList = document.getElementById("capabilities-list");
  const capabilitySelect = document.getElementById("capability");
  const registerForm = document.getElementById("register-form");
  const messageDiv = document.getElementById("message");
  const authStatus = document.getElementById("auth-status");
  const openLoginButton = document.getElementById("open-login-btn");
  const logoutButton = document.getElementById("logout-btn");
  const loginModal = document.getElementById("login-modal");
  const closeLoginButton = document.getElementById("close-login-btn");
  const loginForm = document.getElementById("login-form");
  const loginMessage = document.getElementById("login-message");

  let currentUser = null;

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

  // Function to fetch capabilities from API
  async function fetchCapabilities() {
    try {
      const response = await fetch("/capabilities");
      const capabilities = await response.json();

      // Clear loading message
      capabilitiesList.innerHTML = "";
      capabilitySelect.innerHTML = '<option value="">-- Select a capability --</option>';

      // Populate capabilities list
      Object.entries(capabilities).forEach(([name, details]) => {
        const capabilityCard = document.createElement("div");
        capabilityCard.className = "capability-card";

        const availableCapacity = details.capacity || 0;
        const currentConsultants = details.consultants ? details.consultants.length : 0;

        // Create consultants HTML with delete icons
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
          <p><strong>Industry Verticals:</strong> ${details.industry_verticals ? details.industry_verticals.join(', ') : 'Not specified'}</p>
          <p><strong>Capacity:</strong> ${availableCapacity} hours/week available</p>
          <p><strong>Current Team:</strong> ${currentConsultants} consultants</p>
          ${managementNote}
          <div class="consultants-container">
            ${consultantsHTML}
          </div>
        `;

        capabilitiesList.appendChild(capabilityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        capabilitySelect.appendChild(option);
      });

      // Add event listeners to delete buttons
      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", handleUnregister);
      });
    } catch (error) {
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
        fetchCapabilities();
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
        fetchCapabilities();
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
      fetchCapabilities();
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
      fetchCapabilities();
      showMessage(messageDiv, result.message, "info");
    } catch (error) {
      showMessage(messageDiv, "Unable to sign out right now.", "error");
      console.error("Error signing out:", error);
    }
  });

  loginModal.addEventListener("click", (event) => {
    if (event.target === loginModal) {
      closeLoginModal();
    }
  });

  // Initialize app
  async function initializeApp() {
    await refreshAuthSession();
    await fetchCapabilities();
  }

  initializeApp();
});
