import { AVAILABLE_PROVIDERS } from '@sync-providers/constants';
import { UpdateMode } from '@/constants/UpdateMode';
import MockEnv from '../support/mockEnv';

describe('Themes', () => {
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

  it('Can create a new theme', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="themeselector-dropdown"]').click();
    cy.get('[data-testid="themeselector-managethemes"]').click();
    cy.get('[data-testid="button-manage-themes-modal-new-theme"]').click();
    cy.get('[data-testid="button-manage-themes-modal-new-group"]').click();
    cy.get('[data-testid="create-or-edit-theme-form--group--name"]').type('GroupA');
    cy.get('[data-testid="create-or-edit-theme-form--input--name"]').type('My first theme');
    cy.get('[data-testid="tokensettheme-item--ToggleGroup-content--global--source"]').click();
    cy.get('[data-testid="button-manage-themes-modal-save-theme"]').click();
    cy.get('[data-testid="singlethemeentry"]').should('have.length', 1)
  });

  it('Can enable a previously created theme', () => {
    cy.startup({
      ...mockStartupParams,
      localTokenData: {
        ...mockStartupParams.localTokenData,
        themes: [
          {
            id: 'my-first-theme',
            name: 'My first theme',
            selectedTokenSets: {
              global: 'source',
            },
          },
        ],
      },
    });
    cy.get('[data-testid="themeselector-dropdown"]').click()
    cy.get('[data-testid="themeselector--themeoptions--my-first-theme"]').click()
    cy.get('[data-testid="themeselector-dropdown"]').should('have.text', 'Theme:My first theme')
  });

  it('Can delete a theme', () => {
    cy.startup({
      ...mockStartupParams,
      localTokenData: {
        ...mockStartupParams.localTokenData,
        themes: [
          {
            id: 'my-first-theme',
            name: 'My first theme',
            selectedTokenSets: {
              global: 'source',
            },
          },
        ],
      },
    });
    cy.get('[data-testid="themeselector-dropdown"]').click()
    cy.get('[data-testid="themeselector-managethemes"]').click();
    cy.get('[data-testid="singlethemeentry-my-first-theme"]').click();
    cy.get('[data-testid="button-manage-themes-modal-delete-theme"]').click();
    cy.get('[data-testid="singlethemeentry"]').should('have.length', 0)
  });
});
