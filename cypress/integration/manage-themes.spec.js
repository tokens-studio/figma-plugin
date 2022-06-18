function receiveRemoteComponents() {
  cy.window().then(($window) => {
    const message = {
      pluginMessage: {
        type: 'remotecomponents',
        values: { remotes: [] },
      },
    };
    $window.postMessage(message, '*');
  });
}

const createTokenSet = ({ name }) => {
  cy.get('[data-cy="button-new-token-set"]').click({ timeout: 1000 })
      .get('[data-cy="token-set-input"]')
      .type(name).type('{enter}');
};

describe('TokenListing', () => {
  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad(win) {
        cy.spy(win, 'postMessage').as('postMessage');
      },
    });
    cy.waitForReact(1000);
  });

  it('create token set', () => {
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
      themes: [{
        id: 'my-first-theme',
        name: 'My first theme',
        selectedTokenSets: {
          global: 'source',
        },
      }]
    });
    cy.receiveStorageTypeLocal();
    
    createTokenSet({ name: 'token-source' });
    createTokenSet({ name: 'token-enabled' });
    createTokenSet({ name: 'token-disabled' });

    receiveRemoteComponents();
  });
  
  it('Can create a new theme', () => {
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
    cy.receiveStorageTypeLocal();

    createTokenSet({ name: 'token-source' });
    createTokenSet({ name: 'token-enabled' });
    createTokenSet({ name: 'token-disabled' });

    cy.get('[data-cy="themeselector-dropdown"]').click()
      .get('[data-cy="themeselector-managethemes"]').click()
      .get('[data-cy="button-manage-themes-modal-new-theme"]').click()
      .get('[data-cy="create-or-edit-theme-form--input--name"]').type('My first theme')
      .get('[data-cy="tokensettheme-item--dropdown-trigger--token-source-set"]').click()
      .get('[data-cy="tokensettheme-item--dropdown-content--source"]').click()
      .get('[data-cy="tokensettheme-item--dropdown-trigger--token-enabled-set"]').click()
      .get('[data-cy="tokensettheme-item--dropdown-content--source"]').click()
      .get('[data-cy="tokensettheme-item--dropdown-trigger--token-disabled-set"]').click()
      .get('[data-cy="tokensettheme-item--dropdown-content--source"]').click();
  });
});
