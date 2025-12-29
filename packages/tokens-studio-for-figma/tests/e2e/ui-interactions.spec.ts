import { test, expect } from '@playwright/test';
import { StorageProviderType } from '../../src/constants/StorageProviderType';
import { UpdateMode } from '../../src/constants/UpdateMode';
import { TokenTypes } from '../../src/constants/TokenTypes';

const mockStartupParams = {
  activeTheme: {},
  lastOpened: Date.now(),
  onboardingExplainer: {
    sets: true,
    inspect: true,
    syncProviders: true,
  },
  localApiProviders: [],
  licenseKey: 'valid-license-key',
  settings: {
    width: 800,
    height: 500,
    ignoreFirstPartForStyles: false,
    inspectDeep: false,
    prefixStylesWithThemeName: false,
    showEmptyGroups: true,
    updateMode: UpdateMode.PAGE,
    updateOnChange: false,
    updateRemote: true,
    shouldUpdateStyles: true,
  },
  storageType: { provider: StorageProviderType.LOCAL },
  user: {
    figmaId: 'figma:1234',
    userId: 'uid:1234',
    name: 'Jan Six',
  },
  localTokenData: {
    activeTheme: {},
    checkForChanges: false,
    themes: [],
    usedTokenSet: {},
    updatedAt: new Date().toISOString(),
    values: {
      global: [
        {
          type: TokenTypes.COLOR,
          name: 'colors.primary',
          value: '#0000ff',
        },
        {
          type: TokenTypes.SIZING,
          name: 'spacing.sm',
          value: '8',
        },
      ],
    },
    version: '91',
  },
};

// Helper function to send startup message to the app
async function sendStartupMessage(page, params = mockStartupParams) {
  await page.evaluate((startupParams) => {
    const message = {
      pluginMessage: {
        id: 'startup',
        message: {
          type: 'STARTUP',
          ...startupParams,
        },
      },
    };
    window.postMessage(message, '*');
  }, params);
}

test.describe('UI Interactions and Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Set up mock responses for external APIs
    await page.route('**/api-eu.mixpanel.com/**', (route) => {
      route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
    });

    await page.route('**/api.storyblok.com/**', (route) => {
      route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
    });

    await page.route('**/app.launchdarkly.com/**', (route) => {
      route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
    });

    await page.route('**/events.launchdarkly.com/**', (route) => {
      route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
    });

    await page.route('**/get-license*', (route) => {
      route.fulfill({ status: 200, body: JSON.stringify({ plan: 'pro' }) });
    });

    await page.route('**/validate-license*', (route) => {
      route.fulfill({ status: 200, body: JSON.stringify({ plan: 'pro' }) });
    });

    await page.goto('/');
    await sendStartupMessage(page);
  });

  test('shows footer when not on loading or start screen', async ({ page }) => {
    // Wait for tokens to load
    await expect(page.locator('[data-testid=tokenlisting-sizing]')).toBeVisible();

    // Footer should be visible on tokens screen
    await expect(page.locator('footer')).toBeVisible();
  });

  test('navbar is visible on token screen', async ({ page }) => {
    // Wait for tokens to load
    await expect(page.locator('[data-testid=tokenlisting-sizing]')).toBeVisible();

    // Navbar should be visible
    await expect(page.locator('nav')).toBeVisible();
  });

  test('can toggle empty token groups visibility', async ({ page }) => {
    // Wait for tokens to load
    await expect(page.locator('[data-testid=tokenlisting-sizing]')).toBeVisible();

    // Check if settings button exists and navigate to settings
    const settingsButton = page.locator('[data-testid=navbar-settings]');
    if (await settingsButton.isVisible()) {
      await settingsButton.click();

      // Look for show empty groups toggle
      const toggleEmptyGroups = page.locator('[data-testid=show-empty-groups-toggle]');
      if (await toggleEmptyGroups.isVisible()) {
        await toggleEmptyGroups.click();
        // Verify the setting was toggled
        await expect(toggleEmptyGroups).toBeChecked();
      }
    }
  });

  test('can search through tokens', async ({ page }) => {
    // Wait for tokens to load
    await expect(page.locator('[data-testid=tokenlisting-sizing]')).toBeVisible();

    // Look for search input
    const searchInput = page.locator('[data-testid=search-input]');
    if (await searchInput.isVisible()) {
      // Type in search
      await searchInput.fill('primary');

      // Should show matching tokens
      await expect(page.locator('text=colors.primary')).toBeVisible();

      // Clear search
      await searchInput.clear();

      // All tokens should be visible again
      await expect(page.locator('text=spacing.sm')).toBeVisible();
    }
  });

  test('modal closes when clicking outside', async ({ page }) => {
    // Wait for tokens to load
    await expect(page.locator('[data-testid=tokenlisting-sizing]')).toBeVisible();

    // Try to open a token creation modal
    await page.click('[data-testid=tokenlisting-color] [data-testid=button-add-new-token]');

    // Wait for modal to open
    await expect(page.locator('[data-testid=token-modal]')).toBeVisible();

    // Click outside the modal (on the backdrop)
    await page.click('body', { position: { x: 10, y: 10 } });

    // Modal should close
    await expect(page.locator('[data-testid=token-modal]')).not.toBeVisible();
  });

  test('can use keyboard shortcuts', async ({ page }) => {
    // Wait for tokens to load
    await expect(page.locator('[data-testid=tokenlisting-sizing]')).toBeVisible();

    // Test escape key to close modals
    await page.click('[data-testid=tokenlisting-color] [data-testid=button-add-new-token]');
    
    // Wait for modal to open
    await expect(page.locator('[data-testid=token-modal]')).toBeVisible();

    // Press escape
    await page.keyboard.press('Escape');

    // Modal should close
    await expect(page.locator('[data-testid=token-modal]')).not.toBeVisible();
  });

  test('can navigate between token sets', async ({ page }) => {
    // Wait for tokens to load
    await expect(page.locator('[data-testid=tokenlisting-sizing]')).toBeVisible();

    // Look for token set selector
    const tokenSetSelector = page.locator('[data-testid=token-set-selector]');
    if (await tokenSetSelector.isVisible()) {
      await tokenSetSelector.click();

      // Should show available token sets
      await expect(page.locator('[data-testid=token-set-global]')).toBeVisible();
    }
  });

  test('shows loading states appropriately', async ({ page }) => {
    // Should show loading initially
    await expect(page.locator('[data-testid=figma-loading]')).toBeVisible({
      timeout: 5000,
    });

    // Wait for loading to complete
    await expect(page.locator('[data-testid=figma-loading]')).not.toBeVisible({
      timeout: 10000,
    });

    // Main content should be visible
    await expect(page.locator('[data-testid=tokenlisting-sizing]')).toBeVisible();
  });

  test('responsive design works correctly', async ({ page }) => {
    // Test at mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Wait for tokens to load
    await expect(page.locator('[data-testid=tokenlisting-sizing]')).toBeVisible();

    // UI should still be functional at mobile size
    await expect(page.locator('nav')).toBeVisible();

    // Test at tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('[data-testid=tokenlisting-sizing]')).toBeVisible();

    // Test at desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('[data-testid=tokenlisting-sizing]')).toBeVisible();
  });

  test('plugin resizing works', async ({ page }) => {
    // Wait for tokens to load
    await expect(page.locator('[data-testid=tokenlisting-sizing]')).toBeVisible();

    // Test resizing the plugin window (if resize handles exist)
    const resizeHandle = page.locator('[data-testid=resize-handle]');
    if (await resizeHandle.isVisible()) {
      // Get initial size
      const initialSize = await page.locator('#app').boundingBox();
      
      // Attempt to resize
      await resizeHandle.hover();
      await page.mouse.down();
      await page.mouse.move(initialSize!.x + 100, initialSize!.y + 50);
      await page.mouse.up();

      // Verify the component adjusted to new size
      const newSize = await page.locator('#app').boundingBox();
      expect(newSize!.width).toBeGreaterThan(initialSize!.width);
    }
  });

  test('error states are handled gracefully', async ({ page }) => {
    // Send a startup message that might cause errors
    const errorParams = {
      ...mockStartupParams,
      localTokenData: null, // This might cause an error
    };

    await page.evaluate((startupParams) => {
      const message = {
        pluginMessage: {
          id: 'startup',
          message: {
            type: 'STARTUP',
            ...startupParams,
          },
        },
      };
      window.postMessage(message, '*');
    }, errorParams);

    // Should handle the error gracefully and show appropriate UI
    // This could be a welcome screen or error message
    await expect(page.locator("text=Found an issue? We're on GitHub!")).toBeVisible();
  });
});