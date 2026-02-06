import { test, expect } from '@playwright/test';

test.describe('Basic App Loading', () => {
  test('page loads successfully', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the app root to be present
    await expect(page.locator('#app')).toBeVisible();
    
    // Take a screenshot for verification
    await page.screenshot({ path: 'test-results/basic-load.png' });
  });

  test('app container is present', async ({ page }) => {
    await page.goto('/');
    
    // Check if the app container is present
    await expect(page.locator('#app')).toBeVisible();
    
    // Check if there's some content in the app
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });
});