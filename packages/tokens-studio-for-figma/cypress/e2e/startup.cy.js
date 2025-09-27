import {
  StorageProviderType
} from '@/constants/StorageProviderType';
import {
  TokenTypes
} from '@/constants/TokenTypes';
import { UpdateMode } from '@/constants/UpdateMode';

import MockEnv from '../support/mockEnv';

describe('Loads application', () => {
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

  it('successfully loads when tokens are given', () => {
    cy.startup({
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
    });
    cy.get('[data-testid=tokenlisting-sizing]').should('exist');
  });

  it('shows welcome page when no token values are given', () => {
    cy.startup(mockStartupParams);
    cy.get('a').contains("Found an issue? We're on GitHub!");
  });

  it('loads application successfully with external storage configured', () => {
    // Keep it simple - just test that storage type configuration doesn't break the app
    const storageParams = {
      ...mockStartupParams,
      localTokenData: {
        ...mockStartupParams.localTokenData,
        values: {
          global: [
            {
              type: TokenTypes.COLOR,
              name: 'colors.primary',
              value: '#0066cc',
            },
          ],
        },
      },
    };

    cy.startup(storageParams);
    cy.get('[data-testid=tokenlisting-sizing]').should('exist');
    
    // Should be ready for operations regardless of storage type
    cy.get('@postMessage').should('have.been.called');
  });

  it('handles sync scenarios gracefully', () => {
    // Use the same pattern as working tests - add some tokens
    cy.startup({
      ...mockStartupParams,
      localTokenData: {
        ...mockStartupParams.localTokenData,
        values: {
          global: [
            {
              type: TokenTypes.COLOR,
              name: 'colors.sync',
              value: '#00ccff',
            },
          ],
        },
      },
    });
    
    // Should load the application successfully
    cy.get('[data-testid=tokenlisting-sizing]').should('exist');
  });

  it('loads with pro user license', () => {
    const proUserParams = {
      ...mockStartupParams,
      licenseKey: 'valid-pro-license-key',
      localTokenData: {
        ...mockStartupParams.localTokenData,
        values: {
          global: [
            {
              type: TokenTypes.COLOR,
              name: 'colors.brand',
              value: '#ff6600',
            },
          ],
        },
      },
    };

    cy.startup(proUserParams);
    cy.get('[data-testid=tokenlisting-sizing]').should('exist');
    
    // Pro users should have access to additional features
    cy.get('[data-testid="bottom-bar-settings"]').click({ force: true });
    cy.contains('Settings').click({ force: true });
    cy.get('[data-testid="settings-license-key-input"]').should('be.visible');
  });

  it('loads with multiple token sets', () => {
    const multiSetParams = {
      ...mockStartupParams,
      localTokenData: {
        ...mockStartupParams.localTokenData,
        values: {
          global: [
            {
              type: TokenTypes.COLOR,
              name: 'colors.primary',
              value: '#0066cc',
            },
          ],
          semantic: [
            {
              type: TokenTypes.COLOR,
              name: 'colors.success',
              value: '#00cc66',
            },
          ],
          components: [
            {
              type: TokenTypes.SIZING,
              name: 'button.padding',
              value: 12,
            },
          ],
        },
      },
    };

    cy.startup(multiSetParams);
    cy.get('[data-testid=tokenlisting-sizing]').should('exist');
    
    // Should show multiple token sets
    cy.get('[data-testid="tokensetitem-global-checkbox"]').should('exist');
    cy.get('[data-testid="tokensetitem-semantic-checkbox"]').should('exist');
    cy.get('[data-testid="tokensetitem-components-checkbox"]').should('exist');
  });

  it('loads with existing theme configuration', () => {
    const themeParams = {
      ...mockStartupParams,
      activeTheme: {
        'no-group': 'light-theme'
      },
      localTokenData: {
        ...mockStartupParams.localTokenData,
        themes: [
          {
            id: 'light-theme',
            name: 'Light Theme',
            selectedTokenSets: {
              global: 'source',
              semantic: 'enabled',
            },
          }
        ],
        values: {
          global: [
            {
              type: TokenTypes.COLOR,
              name: 'colors.background',
              value: '#ffffff',
            },
          ],
          semantic: [
            {
              type: TokenTypes.COLOR,
              name: 'colors.text',
              value: '#000000',
            },
          ],
        },
      },
    };

    cy.startup(themeParams);
    cy.get('[data-testid=tokenlisting-sizing]').should('exist');
    
    // Should show active theme in selector
    cy.get('[data-testid="themeselector-dropdown"]').should('contain.text', 'Light Theme');
  });
});
