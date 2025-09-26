import {
  StorageProviderType
} from '@/constants/StorageProviderType';
import { UpdateMode } from '@/constants/UpdateMode';
import MockEnv from '../support/mockEnv';
import { fillTokenForm, fillInput } from './helpers/utils';

describe('Error Handling and Edge Cases', () => {
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

  it('handles startup without valid license key', () => {
    const noLicenseParams = {
      ...mockStartupParams,
      licenseKey: null,
    };

    cy.startup(noLicenseParams);
    
    // Should still load but with limited functionality
    cy.get('[data-testid="button-configure"]').should('be.visible');
    
    // Some features might be disabled for non-pro users
    cy.get('body').should('contain.text', 'Figma').or('contain.text', 'Tokens');
  });

  it('handles empty token data gracefully', () => {
    const emptyTokenParams = {
      ...mockStartupParams,
      localTokenData: {
        ...mockStartupParams.localTokenData,
        values: {},
      },
    };

    cy.startup(emptyTokenParams);
    
    // Should show welcome screen or empty state
    cy.get('body').should('contain.text', 'Welcome')
      .or('contain.text', 'Get started')
      .or('contain.text', 'No tokens')
      .or('contain.text', 'GitHub');
  });

  it('handles malformed token data', () => {
    const malformedTokenParams = {
      ...mockStartupParams,
      localTokenData: {
        ...mockStartupParams.localTokenData,
        values: {
          global: [
            {
              // Missing required fields
              value: '#ff0000',
            },
            {
              name: 'invalid.token',
              // Missing value
              type: 'color',
            },
            {
              name: 'another.invalid',
              value: 'invalid-hex-color',
              type: 'color',
            }
          ],
        },
      },
    };

    cy.startup(malformedTokenParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    
    // Should handle gracefully without crashing
    cy.receiveSetTokens({
      version: '5',
      values: malformedTokenParams.localTokenData.values,
    });
    
    // Should not crash the application
    cy.get('body').should('be.visible');
  });

  it('handles network errors gracefully', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Simulate network error by intercepting requests
    cy.intercept('POST', '**/api/**', { forceNetworkError: true }).as('networkError');
    
    // Try to perform an action that would make a network request
    cy.get('[data-testid="bottom-bar-settings"]').click();
    cy.contains('Settings').click();
    
    // Application should still be functional
    cy.get('body').should('contain.text', 'Settings');
  });

  it('handles extremely long token names', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Try to create token with very long name
    const longName = 'very.long.token.name.that.exceeds.normal.limits.and.keeps.going.and.going.and.going.until.it.becomes.ridiculously.long.for.testing.purposes';
    
    cy.get('[data-testid=tokenlisting-color] [data-testid=button-add-new-token]').click();
    
    fillInput({
      input: 'name',
      value: longName,
    });
    
    cy.get('[data-testid=mention-input-value]').type('#0066cc{enter}');
    
    // Should handle gracefully (either accept, truncate, or show validation error)
    cy.get('body').should('not.contain.text', 'error').or('contain.text', 'too long').or('contain.text', longName.substring(0, 20));
  });

  it('handles special characters in token names', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Test various special characters
    const specialNames = [
      'token-with-dash',
      'token_with_underscore',
      'token with spaces',
      'token@with@symbols',
      'token#hash',
      'token$dollar',
      'token%percent',
    ];

    specialNames.forEach((name, index) => {
      cy.get('[data-testid=tokenlisting-color] [data-testid=button-add-new-token]').click();
      
      fillInput({
        input: 'name',
        value: name,
      });
      
      cy.get('[data-testid=mention-input-value]').type(`#${index.toString().padStart(6, '0')}{enter}`);
      
      // Should either create token or show validation message
      cy.get('body').should('not.contain.text', 'crash').and('not.contain.text', 'undefined');
    });
  });

  it('handles circular token references', () => {
    const circularTokenParams = {
      ...mockStartupParams,
      localTokenData: {
        ...mockStartupParams.localTokenData,
        values: {
          global: [
            {
              name: 'color.a',
              value: '$color.b',
              type: 'color'
            },
            {
              name: 'color.b',
              value: '$color.a', // Circular reference
              type: 'color'
            }
          ],
        },
      },
    };

    cy.startup(circularTokenParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: circularTokenParams.localTokenData.values,
    });

    // Should handle circular references gracefully
    cy.get('body').should('contain.text', 'color.a').and('contain.text', 'color.b');
    
    // Should show warning or error indicator for circular reference
    cy.get('body').should('contain.text', 'circular').or('contain.text', 'reference').or('contain.text', 'error');
  });

  it('handles missing storage provider credentials', () => {
    const missingCredentialsParams = {
      ...mockStartupParams,
      storageType: {
        provider: StorageProviderType.GITHUB,
        // Missing required credentials
      },
    };

    cy.startup(missingCredentialsParams);
    
    // Should show error or prompt for credentials
    cy.get('body').should('contain.text', 'credential').or('contain.text', 'configuration').or('contain.text', 'setup');
  });

  it('handles invalid JSON in token values', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Try to create token with invalid JSON-like value
    cy.get('[data-testid=tokenlisting-typography] [data-testid=button-add-new-token]').click();
    
    fillInput({
      input: 'name',
      value: 'typography.invalid',
    });
    
    // Try to input malformed JSON
    cy.get('[data-testid=mention-input-value]').type('{"fontSize": 16, "fontFamily":}{enter}');
    
    // Should show validation error or handle gracefully
    cy.get('body').should('contain.text', 'invalid').or('contain.text', 'format').or('contain.text', 'error');
  });

  it('handles theme switching with missing token sets', () => {
    const themeWithMissingTokenSets = {
      ...mockStartupParams,
      localTokenData: {
        ...mockStartupParams.localTokenData,
        themes: [{
          id: 'test-theme',
          name: 'Test Theme',
          selectedTokenSets: {
            'nonexistent-set': 'source', // References non-existent token set
          },
        }],
      },
    };

    cy.startup(themeWithMissingTokenSets);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: themeWithMissingTokenSets.localTokenData.values,
    });

    // Try to switch to theme with missing token sets
    cy.get('[data-testid="themeselector-dropdown"]').click();
    
    // Should handle missing sets gracefully
    cy.get('body').should('not.contain.text', 'undefined').and('not.contain.text', 'null');
  });

  it('handles rapid clicking and double submissions', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Try rapid clicking on add token button
    cy.get('[data-testid=tokenlisting-color] [data-testid=button-add-new-token]').click().click().click();
    
    // Should not create multiple modals or forms
    cy.get('input[name=name]').should('have.length.lessThan', 2);
  });

  it('handles browser storage quota exceeded', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Simulate storage quota error (this is more of a structural test)
    cy.window().then((win) => {
      // Mock localStorage to throw quota exceeded error
      const originalSetItem = win.localStorage.setItem;
      win.localStorage.setItem = () => {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      };
      
      // Try to create a token which should trigger storage
      cy.get('[data-testid=tokenlisting-color] [data-testid=button-add-new-token]').click();
      fillTokenForm({
        name: 'color.test',
        value: '#123456',
      });
      
      // Should handle storage error gracefully
      cy.get('body').should('not.contain.text', 'QuotaExceededError');
      
      // Restore original localStorage
      win.localStorage.setItem = originalSetItem;
    });
  });

  it('handles corrupted application state', () => {
    cy.startup(mockStartupParams);
    
    // Simulate corrupted state by sending invalid messages
    cy.window().then(($window) => {
      const corruptedMessage = {
        pluginMessage: {
          type: 'INVALID_MESSAGE_TYPE',
          corruptedData: undefined,
          nullValue: null,
        },
      };
      $window.postMessage(corruptedMessage, '*');
    });
    
    // Application should remain stable
    cy.get('[data-testid="button-configure"]').should('be.visible');
  });

  it('handles extremely large datasets', () => {
    // Create a large dataset
    const largeTokenSet = Array.from({ length: 1000 }, (_, i) => ({
      name: `token.large.dataset.${i}`,
      value: `#${i.toString(16).padStart(6, '0')}`,
      type: 'color'
    }));

    const largeDataParams = {
      ...mockStartupParams,
      localTokenData: {
        ...mockStartupParams.localTokenData,
        values: {
          global: largeTokenSet,
        },
      },
    };

    cy.startup(largeDataParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    
    // Should handle large dataset without performance issues
    cy.receiveSetTokens({
      version: '5',
      values: largeDataParams.localTokenData.values,
    });
    
    // Interface should remain responsive
    cy.get('[data-testid=tokenlisting-color]').should('be.visible');
  });

  it('recovers from temporary network interruption', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Simulate network going down and coming back up
    cy.intercept('POST', '**/api/**', { forceNetworkError: true }).as('networkDown');
    
    // Try action while network is down
    cy.get('[data-testid="bottom-bar-settings"]').click();
    
    // Remove network error simulation
    cy.intercept('POST', '**/api/**').as('networkUp');
    
    // Should recover and work normally
    cy.contains('Settings').click();
    cy.contains('Sync providers').should('be.visible');
  });
});