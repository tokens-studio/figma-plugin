import {
  StorageProviderType
} from '@/constants/StorageProviderType';
import {
  TokenTypes
} from '@/constants/TokenTypes';
import { UpdateMode } from '@/constants/UpdateMode';

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
      updateStyles: true,
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

  it('successfully loads when tokens are given', () => {
    cy.visit('/');
    cy.startup({
      ...mockStartupParams,
      localTokenData: {
        ...mockStartupParams,
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
    cy.get('[data-cy=tokenlisting-sizing]').should('exist');
  });

  it('shows welcome page when no token values are given', () => {
    cy.visit('/');
    cy.startup(mockStartupParams);
    cy.get('a').contains("Found an issue? We're on GitHub!");
  });
});
