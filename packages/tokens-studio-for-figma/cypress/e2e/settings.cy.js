import {
  StorageProviderType
} from '@/constants/StorageProviderType';
import {
  TokenTypes
} from '@/constants/TokenTypes';
import { UpdateMode } from '@/constants/UpdateMode';
import MockEnv from '../support/mockEnv';
import { fillInput } from './helpers/utils';

describe('Settings', () => {
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

  it('successfully navigates to settings page', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid=tokenlisting-sizing]').should('exist');
    
    // Wait a moment for app to stabilize
    cy.wait(500);
    
    // Open settings dropdown
    cy.get('[data-testid="bottom-bar-settings"]').click({ force: true });
    cy.contains('Settings').click({ force: true });
    
    // Verify we're on the settings page
    cy.contains('Settings').should('be.visible');
    cy.contains('Sync providers').should('be.visible');
  });

  it('can reset onboarding', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid=tokenlisting-sizing]').should('exist');
    cy.wait(500);

    // Navigate to settings
    cy.get('[data-testid="bottom-bar-settings"]').click({ force: true });
    cy.contains('Settings').click({ force: true });
    
    // Click reset onboarding button
    cy.get('[data-testid="reset-onboarding"]').click();
    
    // Check that postMessage was called (indicating onboarding state was reset)
    cy.get('@postMessage').should('have.been.called');
  });

  it('shows license key section for pro users', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid=tokenlisting-sizing]').should('exist');
    cy.wait(500);

    // Navigate to settings
    cy.get('[data-testid="bottom-bar-settings"]').click({ force: true });
    cy.contains('Settings').click({ force: true });
    
    // Should show license key input for pro users
    cy.get('[data-testid="settings-license-key-input"]').should('be.visible');
  });

  it('shows local storage by default', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid=tokenlisting-sizing]').should('exist');
    cy.wait(500);

    // Navigate to settings
    cy.get('[data-testid="bottom-bar-settings"]').click({ force: true });
    cy.contains('Settings').click({ force: true });
    
    // Should show Local storage option
    cy.contains('Local document').should('be.visible');
  });

  it('can access language settings', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid=tokenlisting-sizing]').should('exist');
    cy.wait(500);

    // Navigate to settings
    cy.get('[data-testid="bottom-bar-settings"]').click({ force: true });
    cy.contains('Settings').click({ force: true });
    
    // Should show language selector
    cy.contains('Language').should('be.visible');
  });

  it('displays available storage providers in modal', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid=tokenlisting-sizing]').should('exist');
    cy.wait(500);

    // Navigate to settings
    cy.get('[data-testid="bottom-bar-settings"]').click({ force: true });
    cy.contains('Settings').click({ force: true });
    
    // Open add provider modal
    cy.get('[data-testid="add-storage-item-button"]').click();
    
    // Verify all major providers are listed
    const expectedProviders = ['Tokens Studio', 'GitHub', 'GitLab', 'Azure DevOps', 'BitBucket', 'Supernova'];
    expectedProviders.forEach(provider => {
      cy.contains(provider).should('be.visible');
    });
    
    // Verify BitBucket shows BETA badge
    cy.contains('BETA').should('be.visible');
  });


});