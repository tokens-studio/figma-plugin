describe('Loads application', () => {
    it('successfully loads when tokens are given', () => {
        cy.visit('/');

        cy.get('[data-cy=loadingBar]').should('exist');

        cy.window().then(($window) => {
            const message = {
                pluginMessage: {
                    type: 'tokenvalues',
                    values: {version: '5', values: {options: JSON.stringify({sizing: {xs: 4}}, null, 2)}},
                },
            };
            $window.postMessage(message, '*');
        });
        cy.get('[data-cy=loadingBar]').should('not.exist');
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
