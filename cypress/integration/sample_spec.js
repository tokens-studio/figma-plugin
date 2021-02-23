describe('My First Test', () => {
    it('Does not do much!', () => {
        expect(true).to.equal(true);
    });

    it('successfully loads', () => {
        cy.visit('/');

        cy.get('.text-xxs').should('include', 'Hold on');
        cy.window() // get a reference to application's `window`
            .then(($window) => {
                const message = {
                    data: {
                        pluginMessage: {
                            type: 'tokenvalues',
                            values: {version: '5', values: {options: JSON.stringify({sizing: {xs: 4}}, null, 2)}},
                        },
                    },
                };
                $window.postMessage(message, '*');
            });
        cy.get('.text-xxs').should('not.include', 'Hold on');
    });
});
