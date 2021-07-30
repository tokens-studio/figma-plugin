function receiveRemoteComponents() {
    cy.window().then(($window) => {
        const message = {
            pluginMessage: {
                type: 'remotecomponents',
                values: {remotes: []},
            },
        };
        $window.postMessage(message, '*');
    });
}

const fillTokenForm = ({name, value}) => {
    cy.get('input[name=name]').type(name);
    cy.get('input[name=value]').type(value);
    cy.get('input[name=value]').type('{enter}');
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

    it('can add a new token', () => {
        cy.receiveTokenValues({
            version: '5',
            values: {
                options: [
                    {
                        name: 'sizing.xs',
                        value: 4,
                    },
                ],
            },
        });
        cy.receiveStorageTypeLocal();
        cy.get('[data-cy=tokenlisting-sizing] [data-cy=button-add-new-token]').click({timeout: 1000});
        fillTokenForm({
            name: 'sizing.xs',
            value: '4',
        });
        cy.get('@postMessage').should('be.calledTwice');
        receiveRemoteComponents();
        cy.get('[data-cy=tokenlisting-sizing] [data-cy=button-add-new-token]').click({timeout: 1000});
        fillTokenForm({
            name: 'sizing.sm',
            value: '$sizing.xs * 2',
        });
    });

    it('can add a new token in group', () => {
        cy.receiveTokenValues({
            version: '5',
            values: {
                options: [
                    {
                        name: 'sizing.xs',
                        value: 4,
                    },
                ],
            },
        });
        cy.receiveStorageTypeLocal();
        cy.get(
            '[data-cy=tokenlisting-sizing] [data-cy=token-group-sizing] [data-cy=button-add-new-token-in-group]'
        ).click({timeout: 1000});
        fillTokenForm({
            name: 'lg',
            value: '8',
        });
        cy.get('@postMessage').should('be.calledTwice');
        receiveRemoteComponents();
    });
});
