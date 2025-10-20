import { test, expect } from '@playwright/test';

test.describe('Appointment Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display providers and allow booking', async ({ page }) => {
    // Wait for providers to load
    await expect(page.locator('[data-testid="provider-card"]').first()).toBeVisible();
    
    // Check that providers are displayed
    const providerCards = page.locator('[data-testid="provider-card"]');
    await expect(providerCards).toHaveCountGreaterThan(0);
    
    // Click on first provider
    await providerCards.first().click();
    
    // Check that time slots are displayed
    await expect(page.locator('[data-testid="time-slot"]').first()).toBeVisible();
  });

  test('should handle appointment booking form', async ({ page }) => {
    // Navigate to providers page
    await page.goto('/providers');
    
    // Wait for providers to load
    await expect(page.locator('[data-testid="provider-card"]').first()).toBeVisible();
    
    // Click on first provider
    await page.locator('[data-testid="provider-card"]').first().click();
    
    // Click on first available time slot
    await page.locator('[data-testid="time-slot"]').first().click();
    
    // Check that booking form appears
    await expect(page.locator('[data-testid="booking-form"]')).toBeVisible();
    
    // Fill out the form
    await page.fill('[data-testid="patient-name"]', 'John Doe');
    await page.fill('[data-testid="patient-email"]', 'john@example.com');
    await page.fill('[data-testid="patient-phone"]', '555-123-4567');
    
    // Submit the form
    await page.click('[data-testid="book-appointment"]');
    
    // Check for success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('should handle appointment cancellation', async ({ page }) => {
    // Navigate to appointments page
    await page.goto('/appointments');
    
    // Wait for appointments to load
    await page.waitForLoadState('networkidle');
    
    // Look for cancel button
    const cancelButton = page.locator('[data-testid="cancel-appointment"]').first();
    
    if (await cancelButton.isVisible()) {
      await cancelButton.click();
      
      // Check for confirmation dialog
      await expect(page.locator('[data-testid="cancel-confirmation"]')).toBeVisible();
      
      // Confirm cancellation
      await page.click('[data-testid="confirm-cancel"]');
      
      // Check for success message
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    }
  });

  test('should handle mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to dashboard
    await page.goto('/');
    
    // Check that mobile menu is visible
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
    
    // Open mobile menu
    await page.click('[data-testid="mobile-menu-button"]');
    
    // Check that navigation is visible
    await expect(page.locator('[data-testid="mobile-navigation"]')).toBeVisible();
  });
});

test.describe('AI Chat Integration', () => {
  test('should handle AI chat interactions', async ({ page }) => {
    await page.goto('/chat');
    
    // Wait for chat interface to load
    await expect(page.locator('[data-testid="chat-input"]')).toBeVisible();
    
    // Type a message
    await page.fill('[data-testid="chat-input"]', 'Book an appointment');
    await page.click('[data-testid="send-message"]');
    
    // Wait for AI response
    await expect(page.locator('[data-testid="ai-response"]')).toBeVisible();
  });
});
