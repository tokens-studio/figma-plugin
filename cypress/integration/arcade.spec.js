const fillProviderForm = ({name, id, secret}) => {
    cy.get('input[name=name]').type(name);
    cy.get('input[name=secret]').type(secret);
    cy.get('input[name=id]').type(id).type('{enter}');
};

describe('Arcade', () => {
    it('returns error when wrong api data is entered', () => {
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
        fillProviderForm({
            name: 'dummy',
            id: 'some_arcade_id',
            secret: 'some_arcade_secret',
        });
        cy.get('[data-cy=provider-modal-error]').should('exist');
    });
});
