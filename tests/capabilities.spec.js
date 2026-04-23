import { test, expect } from '@playwright/test';
import { CapabilitiesPage } from './pages/CapabilitiesPage.js';

test.describe('Slalom Capabilities Management - Critical Journeys', () => {
  let capabilitiesPage;

  test.beforeEach(async ({ page }) => {
    capabilitiesPage = new CapabilitiesPage(page);
    await capabilitiesPage.goto();
  });

  test('should load and display capabilities on page load', async () => {
    // Wait for capabilities to load
    await capabilitiesPage.waitForCapabilitiesToLoad();

    // Verify capabilities are displayed
    const cards = await capabilitiesPage.getCapabilityCards();
    expect(cards.length).toBeGreaterThan(0);

    // Verify capability select dropdown is populated
    const options = await capabilitiesPage.getCapabilityOptions();
    expect(options.length).toBeGreaterThan(1); // Should have placeholder + capabilities
    expect(options[0]).toContain('Select a capability');
  });

  test('should register consultant for a capability', async () => {
    // Wait for capabilities to load
    await capabilitiesPage.waitForCapabilitiesToLoad();

    // Get first available capability
    const options = await capabilitiesPage.getCapabilityOptions();
    const firstCapability = options.find(opt => !opt.includes('Select'));

    // Register for capability
    await capabilitiesPage.registerForCapability(
      'test.consultant@slalom.com',
      firstCapability
    );

    // Verify success message
    await capabilitiesPage.waitForMessage('success');
    const message = await capabilitiesPage.getMessageText();
    expect(message).toContain('Registered');
  });

  test('should allow practice lead to sign in', async () => {
    // Open login modal
    await capabilitiesPage.openLoginModal();

    // Note: This test requires PRACTICELEAD_TECH_PASSWORD env var
    // For demo purposes, we'll test the modal opens and form is present
    await expect(capabilitiesPage.loginModal).toBeVisible();
    await expect(capabilitiesPage.usernameInput).toBeVisible();
    await expect(capabilitiesPage.passwordInput).toBeVisible();

    // If credentials are available in environment, attempt login
    const testUsername = 'practice-lead-tech';
    const testPassword = process.env.PRACTICELEAD_TECH_PASSWORD;

    if (testPassword) {
      await capabilitiesPage.login(testUsername, testPassword);
      
      // Verify successful login
      await capabilitiesPage.waitForAuthStatus('Practice Lead');
      await expect(capabilitiesPage.logoutButton).toBeVisible();
      await expect(capabilitiesPage.openLoginButton).toBeHidden();
    }
  });

  test('should allow authenticated practice lead to remove consultant', async ({ page }) => {
    // Skip test if no credentials available
    const testPassword = process.env.PRACTICELEAD_TECH_PASSWORD;
    test.skip(!testPassword, 'Practice lead credentials not available');

    // First register a consultant
    await capabilitiesPage.waitForCapabilitiesToLoad();
    const testEmail = 'removeme@slalom.com';
    const options = await capabilitiesPage.getCapabilityOptions();
    const capabilityName = options.find(opt => !opt.includes('Select'));

    await capabilitiesPage.registerForCapability(testEmail, capabilityName);
    await capabilitiesPage.waitForMessage('success');

    // Login as practice lead
    await capabilitiesPage.openLoginModal();
    await capabilitiesPage.login('practice-lead-tech', testPassword);
    await capabilitiesPage.waitForAuthStatus('Practice Lead');

    // Wait for page to refresh with delete buttons
    await page.waitForLoadState('networkidle');

    // Delete the consultant
    await capabilitiesPage.deleteConsultant(capabilityName, testEmail);

    // Verify consultant was removed (success message should appear)
    await capabilitiesPage.waitForMessage('success');
    const message = await capabilitiesPage.getMessageText();
    expect(message).toContain('Unregistered');
  });

  test('should show error when registering with duplicate email for same capability', async () => {
    // Wait for capabilities to load
    await capabilitiesPage.waitForCapabilitiesToLoad();

    const testEmail = 'duplicate@slalom.com';
    const options = await capabilitiesPage.getCapabilityOptions();
    const capabilityName = options.find(opt => !opt.includes('Select'));

    // Register once (should succeed)
    await capabilitiesPage.registerForCapability(testEmail, capabilityName);
    await capabilitiesPage.waitForMessage('success');

    // Try to register again with same email and capability (should fail)
    await capabilitiesPage.registerForCapability(testEmail, capabilityName);
    await capabilitiesPage.waitForMessage('error');
    
    const errorMessage = await capabilitiesPage.getMessageText();
    expect(errorMessage).toContain('already registered');
  });
});
