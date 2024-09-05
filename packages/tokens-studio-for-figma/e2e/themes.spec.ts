import { test, expect } from '@playwright/test';
import MockEnv from './support/mockEnv';
import startup from './support/commands';

test.describe('has title', () => {
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
      updateMode: 'PAGE',
      updateOnChange: false,
      updateRemote: true,
      updateStyles: true,
    },
    storageType: { provider: 'LOCAL' },
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
      version: '91',
    },
  };

  test.beforeEach(async ({ page, context }) => {
    // await page.route('**/*', route => {
    //   route.continue();
    // });
    await page.goto('http://127.0.0.1:58630/#fullscreen=true');
    await MockEnv(context);
  });

  test('Can create a new theme', async ({ page }) => {
    await startup(page, mockStartupParams);
    console.log(123);

    // await page.goto('/#fullscreen=true');

    // Interacting with the dropdown and clicking through the UI
    await page.locator('[data-testid="themeselector-dropdown"]').click();
    await page.locator('[data-testid="themeselector-managethemes"]').click();
    await page.locator('[data-testid="button-manage-themes-modal-new-theme"]').click();
    await page.locator('[data-testid="button-manage-themes-modal-new-group"]').click();
  
    // Typing into input fields
    await page.locator('[data-testid="create-or-edit-theme-form--group--name"]').fill('GroupA');
    await page.locator('[data-testid="create-or-edit-theme-form--input--name"]').fill('My first theme');
  
    // Interacting with a toggle or checkbox
    await page.locator('[data-testid="tokensettheme-item--ToggleGroup-content--global--source"]').click();
  
    // Saving the theme
    await page.locator('[data-testid="button-manage-themes-modal-save-theme"]').click();
  
    // Assertion to check the number of theme entries
    const themeEntries = page.locator('[data-testid="singlethemeentry"]');
    await expect(themeEntries).toHaveCount(1);
  
  });

  // await page.goto('/#theme=system&fullscreen=true');

  // // Expect a title "to contain" a substring.
  // await expect(page).toHaveTitle(/Preview/);
});

// test('get started link', async ({ page }) => {
//   await page.goto('https://playwright.dev/');

//   // Click the get started link.
//   await page.getByRole('link', { name: 'Get started' }).click();

//   // Expects page to have a heading with the name of Installation.
//   await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
// });
