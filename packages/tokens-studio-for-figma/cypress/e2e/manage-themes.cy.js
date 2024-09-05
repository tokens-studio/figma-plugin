import { AVAILABLE_PROVIDERS } from '@sync-providers/constants';
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
      updateStyles: true,
    },
    storageType: { provider: AVAILABLE_PROVIDERS.LOCAL },
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
});
