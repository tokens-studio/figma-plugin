import {
  StorageProviderType
} from '@/constants/StorageProviderType';
import { UpdateMode } from '@/constants/UpdateMode';
import MockEnv from '../support/mockEnv'
import { fillTokenForm } from './helpers/utils';

describe('Branch switcher', () => {
  const provider = {
    provider: StorageProviderType.GITHUB,
    id: '122/figma-tokens',
    secret: '456',
    name: 'dummy 2',
    baseUrl: 'six7',
    branch: 'main',
    filePath: 'tokens.json'
  };

  const mockStartupParams = {
    activeTheme: {},
    lastOpened: Date.now(),
    onboardingExplainer: {
      sets: true,
      inspect: true,
      syncProviders: true,
    },
    localApiProviders: [provider],
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
      shouldSwapFigmaModes: false,
    },
    storageType: provider,
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

  it('successfully shows list of branches', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid=branch-selector-menu-trigger]').click();
    cy.get('[data-testid=popover-item-main]').should('have.length', 1);
    cy.get('[data-testid=popover-item-development]').should('have.length', 1);
  });

  it('successfully create a new branch', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid=branch-selector-menu-trigger]').click();
    // Click "Create new" icon button to switch to create mode
    cy.get('button[aria-label*="Create new"], button[title*="Create new"]').first().click();
    // Click on main branch to create from it
    cy.get('[data-testid=popover-item-main]').click();
    // Should now show the create branch modal
    cy.get('input[name=branch]').type('new-branch');
    cy.get('button[type=submit]').click();
    // Verify the new branch appears in the list
    cy.get('[data-testid=branch-selector-menu-trigger]').click();
    cy.get('[data-testid=popover-item-new-branch]').should('have.length', 1);
  });

  it('successfully create a new branch from current change', () => {
    cy.startup(mockStartupParams);

    cy.get('[data-testid=branch-selector-menu-trigger]').should('be.visible')
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
    cy.get('[data-testid=tokenlisting-sizing] [data-testid=button-add-new-token]').click({
      timeout: 1000
    });
    fillTokenForm({
      name: 'sizing.sm',
      value: '4',
    });
    cy.get('[data-testid=branch-selector-menu-trigger]').click();
    // Click the create new branch icon button to switch to create mode
    cy.get('button[aria-label*="Create new"], button[title*="Create new"]').first().click();
    // Click on "Current changes" option
    cy.contains('Current changes').click();
    // Should now show the create branch modal
    cy.get('input[name=branch]').type('new-branch');
    cy.get('button[type=submit]').click();
    cy.get('[data-testid=push-dialog-commit-message]').type('push changes');
    cy.get('[data-testid=push-dialog-button-push-changes]').click();
    cy.get('[data-testid=push-dialog-success-heading]').should('have.length', 1);
  });

  it('successfully change to an existing branch', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid=branch-selector-menu-trigger]').click();
    cy.get('[data-testid=popover-item-development]').click();
    
    // Handle the error dialog that appears when GitHub connection fails during branch switching
    // This is expected behavior when GitHub is unreachable in the test environment
    cy.get('#pullDialog-button-cancel', { timeout: 5000 }).should('be.visible').click();
    
    cy.get('[data-testid=branch-selector-menu-trigger]').click();
    // Check that development branch is now selected (has checkmark)
    cy.get('[data-testid=popover-item-development]').should('contain', '✓');
  });

  it('successfully push change', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid=footer-push-button]').should('be.visible');
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
    cy.get('[data-testid=tokenlisting-sizing] [data-testid=button-add-new-token]').click({
      timeout: 1000
    });
    fillTokenForm({
      name: 'sizing.sm',
      value: '4',
    });
    cy.get('[data-testid=footer-push-button]').click();
    cy.get('[data-testid=push-dialog-commit-message]').type('push changes');
    cy.get('[data-testid=push-dialog-button-push-changes]').click();
    cy.get('[data-testid=push-dialog-success-heading]').should('have.length', 1);
  });

  it('shows pro upgrade modal for non-pro users', () => {
    // Set feature flags to disable license bypass
    cy.setFeatureFlags({ bypassLicenseCheck: false });

    // Create a non-pro user setup
    const nonProUserParams = {
      ...mockStartupParams,
      licenseKey: null, // Remove license to make user non-pro
    };

    cy.startup(nonProUserParams);
    cy.get('[data-testid=branch-selector-menu-trigger]').click();

    // Should show pro upgrade modal
    cy.contains('Branching is a feature of the Pro subscription').should('be.visible');
    cy.contains('You can switch branches, create new ones from current changes or any other branch, easily find branches, and collaborate seamlessly with your team. Branching enables powerful version control and team collaboration workflows.').should('be.visible');
  });

  it('allows searching branches', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid=branch-selector-menu-trigger]').click();
    
    // Type in search input
    cy.get('input[placeholder="Search..."]').type('main');
    
    // Should only show main branch
    cy.get('[data-testid=popover-item-main]').should('have.length', 1);
    cy.get('[data-testid=popover-item-development]').should('not.exist');
    
    // Clear search
    cy.get('input[placeholder="Search..."]').clear();
    
    // Should show all branches again
    cy.get('[data-testid=popover-item-main]').should('have.length', 1);
    cy.get('[data-testid=popover-item-development]').should('have.length', 1);
  });
});