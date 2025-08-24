import { test } from '@playwright/test';

test('should load the application without an infinite loop', async ({ page }) => {
  await page.goto('/');
  // Wait for a short period to observe if an infinite loop occurs
  // A more robust test would check for specific UI elements or network activity
  await page.waitForTimeout(5000); // Wait for 5 seconds
  // You can add assertions here if needed, e.g., checking for a specific element
  // await expect(page.locator('#some-element')).toBeVisible();
});