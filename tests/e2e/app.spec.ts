import { test, expect } from '@playwright/test';

test.describe('3D House Planner UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the application and render the 3D scene', async ({ page }) => {
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('should switch between view modes', async ({ page }) => {
    // Initial mode is 3D, button shows 3D icon
    await expect(page.getByRole('button', { name: 'Current: 3D view' })).toBeVisible();

    // Expand the FAB
    await page.getByRole('button', { name: 'Current: 3D view' }).click();

    // Switch to 2D
    await page.getByRole('button', { name: 'Switch to 2D view' }).click();
    await expect(page.getByRole('button', { name: 'Current: 2D view' })).toBeVisible();

    // Expand the FAB
    await page.getByRole('button', { name: 'Current: 2D view' }).click();

    // Switch to Hybrid
    await page.getByRole('button', { name: 'Switch to Split view' }).click();
    await expect(page.getByRole('button', { name: 'Current: Split view' })).toBeVisible();
  });

  test('should have camera controls and presets', async ({ page }) => {
    // Check for a control panel that might contain camera presets
    const toolPanel = page.locator('.tool-panel');
    await expect(toolPanel).toBeVisible();

    // Check for buttons that could be presets
    await expect(page.getByRole('button', { name: 'perspective' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'top' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'front' })).toBeVisible();
  });

  test('should have a demo scene creator', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Create Demo Scene' })).toBeVisible();
  });

  test('should create a demo scene', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Demo Scene' }).click();
    // After clicking, we expect to see more elements in the scene.
    // This is a simple check to see if the button has an effect.
    // A more thorough test would check for specific elements.
    await expect(page.locator('mesh')).toHaveCount(10); // Example count, adjust as needed
  });
});
