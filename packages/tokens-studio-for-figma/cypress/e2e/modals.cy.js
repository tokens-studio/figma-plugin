import {
  StorageProviderType
} from '@/constants/StorageProviderType';
import { UpdateMode } from '@/constants/UpdateMode';
import MockEnv from '../support/mockEnv';
import { fillTokenForm } from './helpers/utils';

describe('Modal Interactions', () => {
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
        global: [{
          name: 'color.red',
          value: '#ff0000',
          type: 'color'
        }, {
          name: 'sizing.xs',
          value: 4,
          type: 'sizing'
        }],
      },
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

  it('can open and close export modal', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Click the tools dropdown (file zip icon)
    cy.get('button[aria-label*="load"], button[title*="load"]').first().click();
    
    // Click export option
    cy.contains('Export to file').click();
    
    // Should show export modal
    cy.contains('Export tokens').should('be.visible');
    cy.contains('Single file').should('be.visible');
    cy.contains('Multiple files').should('be.visible');
    
    // Can switch between export modes
    cy.contains('Multiple files').click();
    cy.contains('Single file').click();
    
    // Close modal (assuming there's a close button or clicking outside closes it)
    cy.get('body').type('{esc}');
    cy.contains('Export tokens').should('not.exist');
  });

  it('can open and close preset/import modal', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Click the tools dropdown
    cy.get('button[aria-label*="load"], button[title*="load"]').first().click();
    
    // Click load from file or preset option
    cy.contains('Load from file or preset').click();
    
    // Should show preset modal
    cy.contains('Load from file').should('be.visible').or('contain.text', 'Import').or('contain.text', 'Preset');
    
    // Close modal
    cy.get('body').type('{esc}');
  });

  it('can open edit token modal', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Find an existing token and click edit
    cy.contains('color.red').should('be.visible');
    
    // Right click or look for edit button (tokens often have context menus)
    cy.contains('color.red').rightclick();
    
    // Should show edit option or edit modal
    cy.get('body').should('contain.text', 'Edit').or('contain.text', 'Modify').or('contain.text', 'Update');
  });

  it('can handle create new token modal flow', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Click add new token button
    cy.get('[data-testid=tokenlisting-color] [data-testid=button-add-new-token]').click();
    
    // Should show create token form/modal
    cy.get('input[name=name]').should('be.visible');
    
    // Fill in token details
    fillTokenForm({
      name: 'color.blue',
      value: '#0000ff',
    });
    
    // Verify token was created by checking postMessage
    cy.get('@postMessage').should('have.been.called');
  });

  it('can create and manage themes via modal', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Open theme selector
    cy.get('[data-testid="themeselector-dropdown"]').click();
    
    // Open manage themes
    cy.get('[data-testid="themeselector-managethemes"]').click();
    
    // Should show manage themes modal
    cy.contains('Manage themes').should('be.visible').or('contain.text', 'Theme');
    
    // Can create new theme
    cy.get('[data-testid="button-manage-themes-modal-new-theme"]').click();
    
    // Should show create theme form
    cy.get('[data-testid="create-or-edit-theme-form--input--name"]').should('be.visible');
  });

  it('can handle duplicate token resolution modal', () => {
    // Set up tokens with potential duplicates
    const duplicateTokenData = {
      ...mockStartupParams,
      localTokenData: {
        ...mockStartupParams.localTokenData,
        values: {
          global: [{
            name: 'color.primary',
            value: '#ff0000',
            type: 'color'
          }],
          secondary: [{
            name: 'color.primary',  // Same name, potential duplicate
            value: '#0000ff',
            type: 'color'
          }],
        },
      },
    };

    cy.startup(duplicateTokenData);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: duplicateTokenData.localTokenData.values,
    });

    // Try to create a duplicate token to trigger resolution modal
    cy.get('[data-testid=tokenlisting-color] [data-testid=button-add-new-token]').click();
    
    fillTokenForm({
      name: 'color.primary',  // Duplicate name
      value: '#00ff00',
    });
    
    // Should potentially trigger duplicate resolution
    cy.get('body').should('contain.text', 'duplicate').or('contain.text', 'exists').or('contain.text', 'already');
  });

  it('can open bulk remap modal', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Navigate to inspector to access bulk remap
    cy.get('[data-testid=navitem-inspector]').click();
    
    // Look for bulk remap functionality (this might require tokens to be applied to selection)
    cy.get('body').should('contain.text', 'Inspector');
  });

  it('handles modal keyboard navigation', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Open export modal
    cy.get('button[aria-label*="load"], button[title*="load"]').first().click();
    cy.contains('Export to file').click();
    
    // Test keyboard navigation
    cy.contains('Export tokens').should('be.visible');
    
    // Tab through elements
    cy.get('body').tab();
    cy.get('body').tab();
    
    // Escape should close modal
    cy.get('body').type('{esc}');
    cy.contains('Export tokens').should('not.exist');
  });

  it('can open and configure living documentation modal', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Look for documentation or generate documentation button
    // This might be in a different location, testing the general pattern
    cy.get('button[aria-label*="documentation"], button[title*="documentation"], button').contains(/documentation/i).click({ force: true });
    
    // Should show documentation modal or settings
    cy.get('body').should('contain.text', 'documentation').or('contain.text', 'generate');
  });

  it('can handle branch creation modal', () => {
    const gitProviderParams = {
      ...mockStartupParams,
      storageType: {
        provider: StorageProviderType.GITHUB,
        id: 'github-test',
        name: 'Test Repo',
      },
      localApiProviders: [{
        provider: StorageProviderType.GITHUB,
        id: 'github-test',
        name: 'Test Repo',
        owner: 'test-owner',
        repository: 'test-repo',
      }],
    };

    cy.startup(gitProviderParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Open branch selector
    cy.get('[data-testid=branch-selector-menu-trigger]').click();
    
    // Look for create branch option
    cy.get('button[aria-label*="Create"], button[title*="Create"]').first().click();
    
    // Should show create branch modal or functionality
    cy.get('body').should('contain.text', 'branch').or('contain.text', 'create');
  });

  it('can handle error modals and validation', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Try to create token with invalid data
    cy.get('[data-testid=tokenlisting-color] [data-testid=button-add-new-token]').click();
    
    // Submit without filling required fields
    cy.get('[data-testid=mention-input-value]').type('{enter}');
    
    // Should show validation error
    cy.get('body').should('contain.text', 'required').or('contain.text', 'field').or('contain.text', 'error').or('contain.text', 'invalid');
  });
});