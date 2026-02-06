import { test, expect } from '@playwright/test';
import { StorageProviderType } from '../../src/constants/StorageProviderType';
import { UpdateMode } from '../../src/constants/UpdateMode';

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
    values: {},
    version: '91',
  },
};

// Helper functions
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

async function fillTokenForm(page, { name, value }) {
  await page.fill('input[name=name]', name);
  await page.fill('[data-testid=mention-input-value]', value);
  await page.press('[data-testid=mention-input-value]', 'Enter');
}

async function fillInput(page, { input, value, submit = false }) {
  await page.fill(`input[name=${input}]`, value);
  if (submit) {
    await page.press(`input[name=${input}]`, 'Enter');
  }
}

async function fillValueInput(page, { input, value, submit = false }) {
  await page.fill(`[data-testid=mention-input-${input}]`, value);
  if (submit) {
    await page.press(`[data-testid=mention-input-${input}]`, 'Enter');
  }
}

test.describe('Token Management', () => {
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

  test('can add a new sizing token', async ({ page }) => {
    // Start the plugin
    await sendStartupMessage(page, mockStartupParams);
    
    // Wait for configure button to be visible
    await expect(page.locator('[data-testid="button-configure"]')).toBeVisible();
    
    // Send initial tokens
    await sendTokensMessage(page, {
      version: '5',
      values: {
        options: [{
          name: 'sizing.xs',
          value: 4,
          type: 'sizing'
        }],
        global: [{
          name: 'sizing.xs',
          value: 4,
          type: 'sizing'
        }],
      },
    });

    // Wait for token listing to appear
    await expect(page.locator('[data-testid=tokenlisting-sizing]')).toBeVisible();

    // Click add new token button for sizing tokens
    await page.click('[data-testid=tokenlisting-sizing] [data-testid=button-add-new-token]');

    // Fill in the token form
    await fillTokenForm(page, {
      name: 'sizing.sm',
      value: '8',
    });

    // Verify the token was added (you might need to check for specific UI indicators)
    await expect(page.locator('text=sizing.sm')).toBeVisible();
  });

  test('can add a new color token', async ({ page }) => {
    // Start the plugin
    await sendStartupMessage(page, mockStartupParams);
    
    // Wait for configure button to be visible
    await expect(page.locator('[data-testid="button-configure"]')).toBeVisible();
    
    // Send initial tokens
    await sendTokensMessage(page, {
      version: '5',
      values: {
        options: [],
        global: [{
          name: 'colors.primary',
          value: '#0000ff',
          type: 'color'
        }],
      },
    });

    // Wait for token listing to appear
    await expect(page.locator('[data-testid=tokenlisting-color]')).toBeVisible();

    // Click add new token button for color tokens
    await page.click('[data-testid=tokenlisting-color] [data-testid=button-add-new-token]');

    // Fill in the token form
    await fillTokenForm(page, {
      name: 'colors.secondary',
      value: '#ff0000',
    });

    // Verify the token was added
    await expect(page.locator('text=colors.secondary')).toBeVisible();
  });

  test('can add a shadow token', async ({ page }) => {
    // Start the plugin
    await sendStartupMessage(page, mockStartupParams);
    
    // Wait for configure button to be visible
    await expect(page.locator('[data-testid="button-configure"]')).toBeVisible();
    
    // Send initial tokens
    await sendTokensMessage(page, {
      version: '5',
      values: {
        options: [],
        global: [],
      },
    });

    // Click add new token button for shadow tokens
    await page.click('[data-testid=tokenlisting-boxShadow] [data-testid=button-add-new-token]');

    // Fill in the shadow token form
    await fillInput(page, {
      input: 'name',
      value: 'boxshadow.regular',
    });

    await fillValueInput(page, { input: 'x', value: '4' });
    await fillValueInput(page, { input: 'y', value: '4' });
    await fillValueInput(page, { input: 'spread', value: '0' });
    await fillValueInput(page, { input: 'color', value: '#ff0000' });
    await fillValueInput(page, { input: 'blur', value: '0', submit: true });

    // Verify the token was added
    await expect(page.locator('text=boxshadow.regular')).toBeVisible();
  });

  test('can add a typography token', async ({ page }) => {
    // Start the plugin
    await sendStartupMessage(page, mockStartupParams);
    
    // Wait for configure button to be visible
    await expect(page.locator('[data-testid="button-configure"]')).toBeVisible();
    
    // Send initial tokens
    await sendTokensMessage(page, {
      version: '5',
      values: {
        options: [],
        global: [],
      },
    });

    // Click add new token button for typography tokens
    await page.click('[data-testid=tokenlisting-typography] [data-testid=button-add-new-token]');

    // Fill in the typography token form
    await fillInput(page, {
      input: 'name',
      value: 'typography.regular',
    });

    await fillValueInput(page, { input: 'fontFamily', value: 'Inter' });
    await fillValueInput(page, { input: 'fontWeight', value: 'Bold' });
    await fillValueInput(page, { input: 'lineHeight', value: '100%' });
    await fillValueInput(page, { input: 'fontSize', value: '14' });
    await fillValueInput(page, { input: 'letterSpacing', value: '0' });
    await fillValueInput(page, { input: 'paragraphSpacing', value: '0', submit: true });

    // Verify the token was added
    await expect(page.locator('text=typography.regular')).toBeVisible();
  });

  test('token listing stays collapsed after creating a new token', async ({ page }) => {
    // Start the plugin
    await sendStartupMessage(page, mockStartupParams);
    
    // Wait for configure button to be visible
    await expect(page.locator('[data-testid="button-configure"]')).toBeVisible();
    
    // Send initial tokens
    await sendTokensMessage(page, {
      version: '5',
      values: {
        options: [{
          name: 'sizing.xs',
          value: 4,
          type: 'sizing'
        }],
        global: [{
          name: 'sizing.xs',
          value: 4,
          type: 'sizing'
        }],
      },
    });

    // Collapse the sizing token group
    await page.click('[data-testid=tokenlisting-sizing-collapse-button]');

    // Verify it's collapsed
    await expect(page.locator('[data-testid=tokenlisting-sizing-content]')).not.toBeVisible();

    // Add a new opacity token (different category)
    await page.click('[data-testid=tokenlisting-opacity] [data-testid=button-add-new-token]');

    await fillTokenForm(page, {
      name: 'opacity.half',
      value: '50%',
    });

    // Verify sizing group is still collapsed
    await expect(page.locator('[data-testid=tokenlisting-sizing-content]')).not.toBeVisible();
  });

  test('can expand and collapse token groups', async ({ page }) => {
    // Start the plugin
    await sendStartupMessage(page, mockStartupParams);
    
    // Wait for configure button to be visible
    await expect(page.locator('[data-testid="button-configure"]')).toBeVisible();
    
    // Send initial tokens
    await sendTokensMessage(page, {
      version: '5',
      values: {
        options: [],
        global: [{
          name: 'sizing.xs',
          value: 4,
          type: 'sizing'
        }],
      },
    });

    // Initially, content should be visible
    await expect(page.locator('[data-testid=tokenlisting-sizing-content]')).toBeVisible();

    // Click collapse button
    await page.click('[data-testid=tokenlisting-sizing-collapse-button]');

    // Content should be hidden
    await expect(page.locator('[data-testid=tokenlisting-sizing-content]')).not.toBeVisible();

    // Click collapse button again to expand
    await page.click('[data-testid=tokenlisting-sizing-collapse-button]');

    // Content should be visible again
    await expect(page.locator('[data-testid=tokenlisting-sizing-content]')).toBeVisible();
  });
});