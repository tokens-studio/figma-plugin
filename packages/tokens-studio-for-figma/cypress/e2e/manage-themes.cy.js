import {
  StorageProviderType
} from '@/constants/StorageProviderType';
import { UpdateMode } from '@/constants/UpdateMode';
import MockEnv from '../support/mockEnv';

const createTokenSet = ({ name }) => {
  cy.get('[data-testid="button-new-token-set"]').click({ timeout: 1000 })
    .get('[data-testid="token-set-input"]')
    .type(name).type('{enter}');
};

describe('TokenListing', () => {
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
  }

  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad(win) {
        cy.spy(win, 'postMessage').as('postMessage');
      },
    });
    cy.waitForReact(1000);
    MockEnv();
  });

  it('create token set', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
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

    createTokenSet({ name: 'token-source' });
    createTokenSet({ name: 'token-enabled' });
    createTokenSet({ name: 'token-disabled' });
  });

  it('Can create a new theme & select theme', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
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

    createTokenSet({ name: 'token-source' });
    createTokenSet({ name: 'token-enabled' });
    createTokenSet({ name: 'token-disabled' });

    cy.get('[data-testid="themeselector-dropdown"]').click();
    cy.get('[data-testid="themeselector-managethemes"]').click();
    cy.get('[data-testid="button-manage-themes-modal-new-theme"]').click();
    cy.get('[data-testid="button-manage-themes-modal-new-group"]').click();
    cy.get('[data-testid="create-or-edit-theme-form--group--name"]').type('GroupA');
    cy.get('[data-testid="create-or-edit-theme-form--input--name"]').type('My first theme');
    cy.get('[data-testid="tokensettheme-item--ToggleGroup-content--token-source--source"]').click();
    cy.get('[data-testid="tokensettheme-item--ToggleGroup-content--token-enabled--enabled"]').click();
    cy.get('[data-testid="tokensettheme-item--ToggleGroup-content--token-disabled--disabled"]').click();
    cy.get('[data-testid="button-manage-themes-modal-save-theme"]').click({ force: true });
    cy.get('[data-testid="close-button"]').click();
    createTokenSet({ name: 'token-extra' });

    cy.get('[data-testid="themeselector-dropdown"]').click();
    cy.contains('My first theme').click({
      force: true,
    });
    cy.get('[data-testid="tokensetitem-options-checkbox"]').should('have.attr', 'aria-checked', 'false');
    cy.get('[data-testid="tokensetitem-global-checkbox"]').should('have.attr', 'aria-checked', 'false');
    cy.get('[data-testid="tokensetitem-token-source-checkbox"]').should('have.attr', 'aria-checked', 'mixed');
    cy.get('[data-testid="tokensetitem-token-enabled-checkbox"]').should('have.attr', 'aria-checked', 'true');
    cy.get('[data-testid="tokensetitem-token-disabled-checkbox"]').should('have.attr', 'aria-checked', 'false');
    cy.get('[data-testid="tokensetitem-token-extra-checkbox"]').should('have.attr', 'aria-checked', 'false');
  });

  it('Can search for token sets in theme creation', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
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

    // Create multiple token sets to search through
    createTokenSet({ name: 'design-tokens' });
    createTokenSet({ name: 'color-palette' });
    createTokenSet({ name: 'spacing-system' });
    createTokenSet({ name: 'typography-scale' });

    // Open manage themes modal and create new theme
    cy.get('[data-testid="themeselector-dropdown"]').click();
    cy.get('[data-testid="themeselector-managethemes"]').click();
    cy.get('[data-testid="button-manage-themes-modal-new-theme"]').click();

    // Verify search toggle button is visible
    cy.get('[data-testid="search-input-with-toggle-button"]').should('be.visible');

    // Click search button to activate search
    cy.get('[data-testid="search-input-with-toggle-button"]').click();

    // Verify search input appears
    cy.get('[data-testid="search-input-with-toggle-input"]').should('be.visible');

    // Search for 'palette' - should show only color-palette set
    cy.get('[data-testid="search-input-with-toggle-input"]').type('palette');
    
    // Wait a moment for the filtering to apply
    cy.wait(500);
    
    // Verify that only matching token set is visible within the token sets area
    cy.get('[data-testid="tokensettheme-item--ToggleGroup-content--color-palette--enabled"]').should('exist');
    cy.get('[data-testid="tokensettheme-item--ToggleGroup-content--design-tokens--enabled"]').should('not.exist');
    cy.get('[data-testid="tokensettheme-item--ToggleGroup-content--spacing-system--enabled"]').should('not.exist');
    cy.get('[data-testid="tokensettheme-item--ToggleGroup-content--typography-scale--enabled"]').should('not.exist');

    // Clear search using the clear button
    cy.get('[data-testid="search-input-with-toggle-clear"]').click();

    // Verify all sets are visible again
    cy.get('[data-testid="tokensettheme-item--ToggleGroup-content--color-palette--enabled"]').should('exist');
    cy.get('[data-testid="tokensettheme-item--ToggleGroup-content--design-tokens--enabled"]').should('exist');
    cy.get('[data-testid="tokensettheme-item--ToggleGroup-content--spacing-system--enabled"]').should('exist');
    cy.get('[data-testid="tokensettheme-item--ToggleGroup-content--typography-scale--enabled"]').should('exist');

    // Test another search term
    cy.get('[data-testid="search-input-with-toggle-button"]').click();
    cy.get('[data-testid="search-input-with-toggle-input"]').type('typography');
    
    // Wait for filtering to apply
    cy.wait(500);
    
    // Should show typography-scale only
    cy.get('[data-testid="tokensettheme-item--ToggleGroup-content--typography-scale--enabled"]').should('exist');
    cy.get('[data-testid="tokensettheme-item--ToggleGroup-content--color-palette--enabled"]').should('not.exist');
    cy.get('[data-testid="tokensettheme-item--ToggleGroup-content--design-tokens--enabled"]').should('not.exist');
    cy.get('[data-testid="tokensettheme-item--ToggleGroup-content--spacing-system--enabled"]').should('not.exist');
  });

  // This test validates that the fix for theme duplication during operations works correctly
  // The bug was caused by using setThemes instead of replaceThemes, which triggered
  // import logic that could cause exponential growth of themes (2 -> 1000+)
  it('Can create themes without duplication', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
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

    // Create multiple token sets for themes to use
    createTokenSet({ name: 'token-set-1' });
    createTokenSet({ name: 'token-set-2' });
    createTokenSet({ name: 'token-set-3' });

    // Open manage themes modal
    cy.get('[data-testid="themeselector-dropdown"]').click();
    cy.get('[data-testid="themeselector-managethemes"]').click();

    // Create first theme
    cy.get('[data-testid="button-manage-themes-modal-new-theme"]').click();
    cy.get('[data-testid="create-or-edit-theme-form--input--name"]').type('Theme A');
    cy.get('[data-testid="tokensettheme-item--ToggleGroup-content--token-set-1--enabled"]').click();
    cy.get('[data-testid="button-manage-themes-modal-save-theme"]').click({ force: true });

    // Create second theme
    cy.get('[data-testid="button-manage-themes-modal-new-theme"]').click();
    cy.get('[data-testid="create-or-edit-theme-form--input--name"]').type('Theme B');
    cy.get('[data-testid="tokensettheme-item--ToggleGroup-content--token-set-2--enabled"]').click();
    cy.get('[data-testid="button-manage-themes-modal-save-theme"]').click({ force: true });

    // Create third theme
    cy.get('[data-testid="button-manage-themes-modal-new-theme"]').click();
    cy.get('[data-testid="create-or-edit-theme-form--input--name"]').type('Theme C');
    cy.get('[data-testid="tokensettheme-item--ToggleGroup-content--token-set-3--enabled"]').click();
    cy.get('[data-testid="button-manage-themes-modal-save-theme"]').click({ force: true });

    // After saving, we should be back to the theme list view
    // Wait a moment for the form to close and return to theme list
    cy.wait(500);

    // Verify initial theme count is exactly 3
    cy.get('[data-testid="manage-themes-modal"]').within(() => {
      cy.get('[data-testid="singlethemeentry"]').should('have.length', 3);
    });

    // Verify initial theme order
    cy.get('[data-testid="manage-themes-modal"]').within(() => {
      cy.get('[data-testid="singlethemeentry"]').eq(0).should('contain', 'Theme A');
      cy.get('[data-testid="singlethemeentry"]').eq(1).should('contain', 'Theme B');
      cy.get('[data-testid="singlethemeentry"]').eq(2).should('contain', 'Theme C');
    });

    // Test that theme count remains stable during multiple operations
    // This validates that the fix prevents the duplication bug
    for (let i = 0; i < 5; i++) {
      // Close and reopen modal to trigger potential state issues
      cy.get('[data-testid="close-button"]').click();
      cy.get('[data-testid="themeselector-dropdown"]').click();
      cy.get('[data-testid="themeselector-managethemes"]').click();

      // Verify theme count is still exactly 3 (no duplication)
      cy.get('[data-testid="manage-themes-modal"]').within(() => {
        cy.get('[data-testid="singlethemeentry"]').should('have.length', 3);
      });

      // Verify all themes are still present
      cy.get('[data-testid="manage-themes-modal"]').within(() => {
        cy.get('[data-testid="singlethemeentry"]').should('contain', 'Theme A');
        cy.get('[data-testid="singlethemeentry"]').should('contain', 'Theme B');
        cy.get('[data-testid="singlethemeentry"]').should('contain', 'Theme C');
      });
    }

    // Final verification that theme count is exactly 3
    cy.get('[data-testid="manage-themes-modal"]').within(() => {
      cy.get('[data-testid="singlethemeentry"]').should('have.length', 3);
    });
  });

  // This test validates that the fix prevents theme duplication during operations
  // and ensures theme count remains stable
  it('Can maintain theme count without duplication', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
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

    // Create multiple token sets for themes to use
    createTokenSet({ name: 'token-set-1' });
    createTokenSet({ name: 'token-set-2' });
    createTokenSet({ name: 'token-set-3' });

    // Open manage themes modal
    cy.get('[data-testid="themeselector-dropdown"]').click();
    cy.get('[data-testid="themeselector-managethemes"]').click();

    // Create first theme
    cy.get('[data-testid="button-manage-themes-modal-new-theme"]').click();
    cy.get('[data-testid="create-or-edit-theme-form--input--name"]').type('Theme A');
    cy.get('[data-testid="tokensettheme-item--ToggleGroup-content--token-set-1--enabled"]').click();
    cy.get('[data-testid="button-manage-themes-modal-save-theme"]').click({ force: true });

    // Create second theme
    cy.get('[data-testid="button-manage-themes-modal-new-theme"]').click();
    cy.get('[data-testid="create-or-edit-theme-form--input--name"]').type('Theme B');
    cy.get('[data-testid="tokensettheme-item--ToggleGroup-content--token-set-2--enabled"]').click();
    cy.get('[data-testid="button-manage-themes-modal-save-theme"]').click({ force: true });

    // Create third theme
    cy.get('[data-testid="button-manage-themes-modal-new-theme"]').click();
    cy.get('[data-testid="create-or-edit-theme-form--input--name"]').type('Theme C');
    cy.get('[data-testid="tokensettheme-item--ToggleGroup-content--token-set-3--enabled"]').click();
    cy.get('[data-testid="button-manage-themes-modal-save-theme"]').click({ force: true });

    // After saving, we should be back to the theme list view
    // Wait a moment for the form to close and return to theme list
    cy.wait(500);

    // Verify initial theme count is exactly 3
    cy.get('[data-testid="manage-themes-modal"]').within(() => {
      cy.get('[data-testid="singlethemeentry"]').should('have.length', 3);
    });

    // Verify initial theme order
    cy.get('[data-testid="manage-themes-modal"]').within(() => {
      cy.get('[data-testid="singlethemeentry"]').eq(0).should('contain', 'Theme A');
      cy.get('[data-testid="singlethemeentry"]').eq(1).should('contain', 'Theme B');
      cy.get('[data-testid="singlethemeentry"]').eq(2).should('contain', 'Theme C');
    });

    // Test that theme count remains stable during multiple operations
    // This validates that the fix prevents the duplication bug
    for (let i = 0; i < 3; i++) {
      // Close and reopen modal to trigger potential state issues
      cy.get('[data-testid="close-button"]').click();
      cy.get('[data-testid="themeselector-dropdown"]').click();
      cy.get('[data-testid="themeselector-managethemes"]').click();

      // Verify theme count is still exactly 3 (no duplication)
      cy.get('[data-testid="manage-themes-modal"]').within(() => {
        cy.get('[data-testid="singlethemeentry"]').should('have.length', 3);
      });

      // Verify all themes are still present
      cy.get('[data-testid="manage-themes-modal"]').within(() => {
        cy.get('[data-testid="singlethemeentry"]').should('contain', 'Theme A');
        cy.get('[data-testid="singlethemeentry"]').should('contain', 'Theme B');
        cy.get('[data-testid="singlethemeentry"]').eq(2).should('contain', 'Theme C');
      });
    }

    // Final verification that theme count is exactly 3
    cy.get('[data-testid="manage-themes-modal"]').within(() => {
      cy.get('[data-testid="singlethemeentry"]').should('have.length', 3);
    });
  });
});
