describe('TokenListing', () => {
    it('can add a new token', () => {
        cy.visit('/', {
            onBeforeLoad(win) {
                // start spying
                cy.spy(win, 'postMessage').as('postMessage');
            },
        });
        cy.waitForReact();
        cy.window().then(($window) => {
            const message = {
                pluginMessage: {
                    type: 'tokenvalues',
                    values: {version: '5', values: {options: JSON.stringify({sizing: {xs: 4}}, null, 2)}},
                },
            };
            $window.postMessage(message, '*');
        });
        cy.get('[data-cy=tokenlisting-sizing] [data-cy=add-button]').click();
        cy.get('input[name=name]').type('xs');
        cy.get('input[name=value]').type('4');
        cy.get('input[name=value]').type('{enter}');
        cy.get('@postMessage').should('be.calledOnce');
        cy.window().then(($window) => {
            const message = {
                pluginMessage: {
                    type: 'remotecomponents',
                    values: {remotes: []},
                },
            };
            $window.postMessage(message, '*');
        });
        cy.get('[data-cy=button-modal-add]').click();
        cy.get('input[name=name]').type('sm');
        cy.get('input[name=value]').type('$sizing.xs * 2');
        cy.get('input[name=value]').type('{enter}');
        cy.window().then(($window) => {
            const message = {
                pluginMessage: {
                    type: 'remotecomponents',
                    values: {remotes: []},
                },
            };
            $window.postMessage(message, '*');
        });
    });
});
