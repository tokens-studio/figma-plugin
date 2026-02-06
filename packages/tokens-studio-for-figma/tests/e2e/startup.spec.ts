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
  licenseKey: null,
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
    values: {},
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

// Helper function to send tokens to the app
async function sendTokensMessage(page, tokens) {
  await page.evaluate((tokenValues) => {
    const message = {
      pluginMessage: {
        type: 'SET_TOKENS',
        values: tokenValues,
      },
    };
    window.postMessage(message, '*');
  }, tokens);
}

test.describe('Plugin Startup', () => {
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
  });

  test('successfully loads when tokens are given', async ({ page }) => {
    // Send startup message with tokens
    const paramsWithTokens = {
      ...mockStartupParams,
      localTokenData: {
        ...mockStartupParams.localTokenData,
        values: {
          global: [
            {
              type: TokenTypes.COLOR,
              name: 'colors.red',
              value: '#ff0000',
            },
          ],
        },
      },
    };

    await sendStartupMessage(page, paramsWithTokens);

    // Wait for the token listing to appear
    await expect(page.locator('[data-testid=tokenlisting-sizing]')).toBeVisible();
  });

  test('shows welcome page when no token values are given', async ({ page }) => {
    // Send startup message with empty tokens
    await sendStartupMessage(page, mockStartupParams);

    // Wait for welcome message to appear
    await expect(page.locator("text=Found an issue? We're on GitHub!")).toBeVisible();
  });

  test('can navigate between tabs', async ({ page }) => {
    // Send startup message with tokens to get past welcome screen
    const paramsWithTokens = {
      ...mockStartupParams,
      localTokenData: {
        ...mockStartupParams.localTokenData,
        values: {
          global: [
            {
              type: TokenTypes.COLOR,
              name: 'colors.red',
              value: '#ff0000',
            },
          ],
        },
      },
    };

    await sendStartupMessage(page, paramsWithTokens);

    // Wait for tokens tab to be active
    await expect(page.locator('[data-testid=tokenlisting-sizing]')).toBeVisible();

    // Navigate to inspector tab (if it exists)
    const inspectorTab = page.locator('[data-testid=navbar-inspector]');
    if (await inspectorTab.isVisible()) {
      await inspectorTab.click();
      await expect(page.locator('[data-testid=inspector]')).toBeVisible();
    }

    // Navigate to settings tab
    const settingsTab = page.locator('[data-testid=navbar-settings]');
    if (await settingsTab.isVisible()) {
      await settingsTab.click();
      // Wait for settings content to be visible
      await expect(page.locator('text=Settings')).toBeVisible();
    }
  });

  test('shows loading state during startup', async ({ page }) => {
    // Initially should show loading state
    await expect(page.locator('[data-testid=figma-loading]')).toBeVisible({
      timeout: 5000,
    });

    // Send startup message
    await sendStartupMessage(page, mockStartupParams);

    // Loading should disappear after startup
    await expect(page.locator('[data-testid=figma-loading]')).not.toBeVisible({
      timeout: 10000,
    });
  });
});