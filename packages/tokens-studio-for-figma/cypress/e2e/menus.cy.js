import { StorageProviderType } from '@/constants/StorageProviderType';
import { UpdateMode } from '@/constants/UpdateMode';
import MockEnv from '../support/mockEnv';

// Measures the check mark and label of a checked menu item, relative to the item's left edge
function measureCheckedItem($item) {
  const item = $item[0].getBoundingClientRect();
  const icon = $item[0].querySelector('svg').getBoundingClientRect();
  const label = [...$item[0].childNodes].find((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
  const range = document.createRange();
  range.selectNodeContents(label);
  return {
    iconLeft: Math.round(icon.left - item.left),
    iconWidth: Math.round(icon.width),
    labelLeft: Math.round(range.getBoundingClientRect().left - item.left),
  };
}

describe('Menus', () => {
  const mockStartupParams = {
    activeTheme: { mode: 'light' },
    lastOpened: Date.now(),
    onboardingExplainer: {
      sets: false,
      inspect: false,
      syncProviders: false,
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
      shouldSwapFigmaModes: false,
    },
    storageType: { provider: StorageProviderType.LOCAL },
    user: {
      figmaId: 'figma:1234',
      userId: 'uid:1234',
      name: 'Jan Six',
    },
    localTokenData: {
      activeTheme: { mode: 'light' },
      checkForChanges: false,
      themes: [
        {
          id: 'light', name: 'Light', group: 'mode', selectedTokenSets: { global: 'enabled' },
        },
        {
          id: 'dark', name: 'Dark', group: 'mode', selectedTokenSets: { global: 'enabled' },
        },
      ],
      usedTokenSet: { global: 'enabled' },
      updatedAt: new Date().toISOString(),
      values: {
        global: [{
          name: 'color.primary',
          value: '#ff0000',
          type: 'color',
        }],
      },
      version: '91',
    },
  };

  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad(win) {
        cy.spy(win, 'postMessage').as('postMessage');
      },
    });
    cy.waitForReact(1000);
    MockEnv();
  });

  it('places check marks the same way in dropdown and context menus', () => {
    cy.startup(mockStartupParams);

    // Dropdown menu: the active theme is checked
    cy.get('[data-testid="themeselector-dropdown"]').click();
    cy.get('[data-testid="themeselector--themeoptions--light"]').then(($item) => {
      const dropdown = measureCheckedItem($item);
      // Leave room between the check mark and the label
      expect(dropdown.labelLeft).to.be.greaterThan(dropdown.iconLeft + dropdown.iconWidth);
      cy.wrap(dropdown).as('dropdown');
    });
    cy.get('body').type('{esc}');

    // Context menu: the token is applied as fill on the selected layer
    cy.window().then(($window) => {
      $window.postMessage({
        pluginMessage: {
          type: 'selection',
          selectedNodes: 1,
          selectionValues: [],
          mainNodeSelectionValues: [{ fill: 'color.primary' }],
        },
      }, '*');
    });
    cy.get('[id="color.primary-button}"]').rightclick();
    cy.get('[role="menuitemcheckbox"][data-state="checked"]').contains('Fill').then(($item) => {
      const contextMenu = measureCheckedItem($item);
      cy.get('@dropdown').should('deep.equal', contextMenu);
    });
  });
});
