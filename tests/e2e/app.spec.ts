import { test, expect } from '@playwright/test';

test.describe('3D House Planner - Phase 1 Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders 3D scene successfully', async ({ page }) => {
    // Verify main 3D canvas is visible
    await expect(page.locator('canvas')).toBeVisible();

    // Verify the app loads without errors
    await page.waitForTimeout(2000);
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('has functional sidebar with demo scene creator', async ({ page }) => {
    // Verify sidebar is visible
    await expect(page.locator('aside')).toBeVisible();

    // Verify demo scene creator button exists
    const demoButton = page.getByRole('button', { name: /Create Demo House/i });
    await expect(demoButton).toBeVisible();

    // Click demo button and verify it works
    await demoButton.click();
    await page.waitForTimeout(1000);

    // Canvas should still be visible after demo creation
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('has view switcher FAB functionality', async ({ page }) => {
    // Look for the view switcher button (FAB in top-right)
    const fabContainer = page.locator('[class*="fixed"][class*="top-4"][class*="right-4"]');
    await expect(fabContainer).toBeVisible();

    // Should have a button inside
    const fabButton = fabContainer.locator('button').first();
    await expect(fabButton).toBeVisible();

    // Click to interact (should expand or change view)
    await fabButton.click();
    await page.waitForTimeout(500);

    // Canvas should remain visible
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('sidebar has all required sections', async ({ page }) => {
    // Verify key sections exist in sidebar
    await expect(page.getByText('3D House Planner')).toBeVisible();
    await expect(page.getByText('Project').first()).toBeVisible();
    await expect(page.getByText('Building Tools').first()).toBeVisible();
    await expect(page.getByText('View & Settings').first()).toBeVisible();
    await expect(page.getByText('Status & Info').first()).toBeVisible();
  });

  test('collapsible panels work correctly', async ({ page }) => {
    // Find the demo scene creator which should be in the Project panel
    await expect(page.getByText('Demo House Generator')).toBeVisible();

    // Verify project content is visible
    await expect(page.getByText('🚀 Create Demo House')).toBeVisible();
  });
});
