import { AVAILABLE_PROVIDERS } from '@sync-providers/constants';
import { UpdateMode } from '@/constants/UpdateMode';
import MockEnv from '../support/mockEnv'
import { fillTokenForm } from './helpers/utils';

describe('Branch switcher', () => {
  const provider = {
    provider: AVAILABLE_PROVIDERS.GITHUB,
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
      updateStyles: true,
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
    cy.get('[data-testid=branch-switch-menu-radio-element-main]').should('have.length', 1);
    cy.get('[data-testid=branch-switch-menu-radio-element-development]').should('have.length', 1);
  });

  it('successfully create a new branch', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid=branch-selector-menu-trigger]').click();
    cy.get('[data-testid=branch-selector-create-new-branch-trigger]').click();
    cy.get('[data-testid=branch-selector-create-branch-from-branch-main]').click();
    cy.get('input[name=branch]').type('new-branch');
    cy.get('button[type=submit]').click();
    cy.get('[data-testid=branch-selector-menu-trigger]').click();
    cy.get('[data-testid=branch-switch-menu-radio-element-new-branch]').should('have.length', 1);
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
    cy.get('[data-testid=branch-selector-create-new-branch-trigger]').click();
    cy.get('[data-testid=branch-selector-create-new-branch-from-current-change]').click();
    cy.get('input[name=branch]').type('new-branch');
    cy.get('button[type=submit]').click();
    cy.get('[data-testid=push-dialog-commit-message]').type('push changes');
    cy.get('[data-testid=push-dialog-button-push-changes]').click();
    cy.get('[data-testid=push-dialog-success-heading]').should('have.length', 1);
  });

  it('successfully change to an existing branch', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid=branch-selector-menu-trigger]').click();
    cy.get('[data-testid=branch-switch-menu-radio-element-development]').click();
    cy.get('[data-testid=branch-selector-menu-trigger]').click();
    cy.get('[data-testid=branch-switch-menu-radio-element-development] [data-testid=branch-switch-menu-check-icon]').should('have.length', 1);
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
});
