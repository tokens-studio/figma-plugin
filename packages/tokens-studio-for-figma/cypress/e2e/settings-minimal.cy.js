import {
  StorageProviderType
} from '@/constants/StorageProviderType';
import {
  TokenTypes
} from '@/constants/TokenTypes';
import { UpdateMode } from '@/constants/UpdateMode';
import MockEnv from '../support/mockEnv';

describe('Settings Minimal', () => {
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
            name: 'colors.red',
            value: '#ff0000',
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

  it('loads application with tokens and finds settings button', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid=tokenlisting-sizing]').should('exist');
    
    // Look for settings button
    cy.get('[data-testid="bottom-bar-settings"]').should('be.visible');
  });

  it('can navigate to settings page', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid=tokenlisting-sizing]').should('exist');
    
    // Wait a moment for app to stabilize
    cy.wait(500);
    
    // Click settings dropdown in bottom bar
    cy.get('[data-testid="bottom-bar-settings"]').click({ force: true });
    
    // Click Settings menu item
    cy.contains('Settings').click({ force: true });
    
    // Verify we're on settings page
    cy.contains('Sync providers').should('be.visible');
  });
});