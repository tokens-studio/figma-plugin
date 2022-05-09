describe('Loads application', () => {
  it('successfully loads when tokens are given', () => {
    cy.visit('/');

    cy.window().then(($window) => {
      const message = {
        pluginMessage: {
          type: 'tokenvalues',
          values: {
            version: '5',
            themes: [],
            activeTheme: null,
            values: {
              options: [
                {
                  name: 'sizing.xs',
                  value: 4,
                },
              ],
            },
            global: [
              {
                name: 'size',
                value: '11',
                type: 'sizing'
              }
            ],
          },
        },
      };
      $window.postMessage(message, '*');
    });
    cy.get('[data-cy=tokenlisting-sizing]').should('exist');
  });

  it('shows welcome page when no token values are given', () => {
    cy.visit('/');

    cy.window().then(($window) => {
      const message = {
        pluginMessage: {
          type: 'tokenvalues',
        },
      };
      $window.postMessage(message, '*');
    });
    cy.get('p').contains('Welcome to Figma Tokens');
  });
});
