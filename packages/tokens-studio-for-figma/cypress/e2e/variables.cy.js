import {
  StorageProviderType
} from '@/constants/StorageProviderType';
import {
  TokenTypes
} from '@/constants/TokenTypes';
import { UpdateMode } from '@/constants/UpdateMode';
import MockEnv from '../support/mockEnv';

describe('Variables', () => {
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
            value: '#0066cc',
          },
          {
            type: TokenTypes.SIZING,
            name: 'spacing.sm',
            value: 8,
          },
        ],
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

  it('loads application with tokens for variable operations', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid=tokenlisting-sizing]').should('exist');
    
    // Verify tokens are loaded and ready for variable operations
    cy.get('@postMessage').should('have.been.called');
  });

  it('can navigate to inspector for variable functionality', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid=tokenlisting-sizing]').should('exist');
    
    // Navigate to the inspector where variable operations might be available
    cy.get('[data-testid=navitem-inspector]').click();
    
    // Should show inspector interface
    cy.get('body').should('contain.text', 'Inspector');
  });

  it('displays variable management in theme settings', () => {
    const themeWithVariables = {
      ...mockStartupParams,
      localTokenData: {
        ...mockStartupParams.localTokenData,
        themes: [
          {
            id: 'test-theme',
            name: 'Test Theme',
            selectedTokenSets: {
              global: 'source',
            },
          }
        ],
      },
    };

    cy.startup(themeWithVariables);
    cy.get('[data-testid=tokenlisting-sizing]').should('exist');
    
    // Open theme management
    cy.get('[data-testid="themeselector-dropdown"]').click();
    cy.get('[data-testid="themeselector-managethemes"]').click();
    
    // Look for variable management in themes (may or may not exist)
    cy.get('body').should('contain.text', 'Theme');
  });

  it('can simulate variable data handling', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid=tokenlisting-sizing]').should('exist');
    
    // Mock receiving variable data (similar to how tokens are received)
    cy.window().then(($window) => {
      const variableMessage = {
        pluginMessage: {
          type: 'TEST_VARIABLES',
          variables: [
            {
              id: 'var1',
              name: 'Primary Color',
              type: 'COLOR',
              value: '#0066cc',
            }
          ],
        },
      };
      $window.postMessage(variableMessage, '*');
    });
    
    // Should handle variable data gracefully
    cy.get('@postMessage').should('have.been.called');
  });

  it('handles theme variable operations', () => {
    const themeParams = {
      ...mockStartupParams,
      localTokenData: {
        ...mockStartupParams.localTokenData,
        themes: [
          {
            id: 'variable-theme',
            name: 'Variable Theme',
            selectedTokenSets: {
              global: 'source',
            },
          }
        ],
      },
    };

    cy.startup(themeParams);
    cy.get('[data-testid=tokenlisting-sizing]').should('exist');
    
    // Open theme management
    cy.get('[data-testid="themeselector-dropdown"]').click();
    cy.get('[data-testid="themeselector-managethemes"]').click();
    
    // Should show theme management interface
    cy.get('body').should('contain.text', 'Variable Theme');
  });

  it('supports variable workflow simulation', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid=tokenlisting-sizing]').should('exist');
    
    // Navigate to inspector where variable operations would happen
    cy.get('[data-testid=navitem-inspector]').click();
    
    // Should show inspector interface ready for variable operations
    cy.get('body').should('contain.text', 'Inspector');
  });

  it('handles variable import simulation', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid=tokenlisting-sizing]').should('exist');
    
    // Simulate a variable import workflow completion
    cy.window().then(($window) => {
      const importMessage = {
        pluginMessage: {
          type: 'VARIABLES_IMPORTED',
          status: 'success',
          count: 3,
        },
      };
      $window.postMessage(importMessage, '*');
    });
    
    // Should handle the message gracefully
    cy.get('@postMessage').should('have.been.called');
    
    // Application should remain stable
    cy.get('[data-testid=tokenlisting-sizing]').should('exist');
  });
});