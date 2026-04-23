export class CapabilitiesPage {
  constructor(page) {
    this.page = page;
    
    // Navigation and layout
    this.capabilitiesList = page.locator('#capabilities-list');
    this.registerForm = page.locator('#register-form');
    this.messageDiv = page.locator('#message');
    
    // Registration form elements
    this.emailInput = page.locator('#email');
    this.capabilitySelect = page.locator('#capability');
    this.registerButton = page.getByRole('button', { name: /register/i });
    
    // Authentication elements
    this.authStatus = page.locator('#auth-status');
    this.openLoginButton = page.getByRole('button', { name: /practice lead sign in/i });
    this.logoutButton = page.getByRole('button', { name: /sign out/i });
    this.loginModal = page.locator('#login-modal');
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.loginSubmitButton = this.loginModal.getByRole('button', { name: /sign in/i });
    this.closeLoginButton = page.locator('#close-login-btn');
    this.loginMessage = page.locator('#login-message');
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async waitForCapabilitiesToLoad() {
    await this.capabilitiesList.waitFor({ state: 'visible' });
    await this.page.waitForSelector('.capability-card', { timeout: 10000 });
  }

  async getCapabilityCards() {
    return await this.page.locator('.capability-card').all();
  }

  async registerForCapability(email, capabilityName) {
    await this.emailInput.fill(email);
    await this.capabilitySelect.selectOption(capabilityName);
    await this.registerButton.click();
  }

  async waitForMessage(type) {
    await this.messageDiv.waitFor({ state: 'visible' });
    await this.page.waitForSelector(`#message.${type}`, { timeout: 5000 });
  }

  async getMessageText() {
    return await this.messageDiv.textContent();
  }

  async openLoginModal() {
    await this.openLoginButton.click();
    await this.loginModal.waitFor({ state: 'visible' });
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginSubmitButton.click();
  }

  async waitForAuthStatus(expectedText) {
    await this.page.waitForFunction(
      (text) => document.getElementById('auth-status').textContent.includes(text),
      expectedText,
      { timeout: 5000 }
    );
  }

  async deleteConsultant(capabilityName, email) {
    const deleteButton = this.page.locator(
      `.delete-btn[data-capability="${capabilityName}"][data-email="${email}"]`
    );
    await deleteButton.click();
  }

  async logout() {
    await this.logoutButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async getCapabilityOptions() {
    return await this.capabilitySelect.locator('option').allTextContents();
  }
}
