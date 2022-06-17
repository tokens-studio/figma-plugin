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

const createToken = ({ name }) => {
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
    cy.receiveStorageTypeLocal();
    
    createToken({ name: 'token1' });
    createToken({ name: 'token2' });
    createToken({ name: 'token3' });

    cy.get()

    cy.get('@postMessage').should('be.calledTwice');
    receiveRemoteComponents();
  });
  
});
