let loadEvent = 'not fired';

window.addEventListener('load', function (event) {
    console.log('load event fired!');
    loadEvent = 'fired';
});

describe('Loads application', () => {
    it('displays loading bar on startup', () => {
        cy.visit('/');

        cy.get('.loadingBar').contains('Hold on, updating...');
    });

    it('successfully loads when tokens are given', () => {
        cy.visit('/');

        cy.window().then(($window) => {
            const message = {
                pluginMessage: {
                    type: 'tokenvalues',
                    values: {version: '5', values: {options: JSON.stringify({sizing: {xs: 4}}, null, 2)}},
                },
            };
            $window.postMessage(message, '*');
        });
        cy.get('.loadingBar').should('not.exist');
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
