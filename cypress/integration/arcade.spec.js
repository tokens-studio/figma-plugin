describe('Arcade', () => {
    it('lets user choose arcade as a remote storage', () => {
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
        cy.get('[data-cy=navitem-syncsettings]').click();
        cy.get('[data-cy=provider-arcade]').click();
        cy.get('[data-cy=button-add-new-credentials]').click();
    });
});
