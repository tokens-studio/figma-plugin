import {StorageProviderType} from '../../types/api';

// const fillProviderForm = ({name, id, secret}) => {
//     cy.get('input[name=name]').type(name);
//     cy.get('input[name=secret]').type(secret);
//     cy.get('input[name=id]').type(id).type('{enter}');
// };

// describe('With empty data at start', () => {
//     it('returns error when wrong api data is entered', () => {
//         cy.visit('/');

//         cy.receiveTokenValues({
//             version: '5',
//             values: {
//                 options: JSON.stringify({sizing: {xs: 4}}, null, 2),
//             },
//         });
//         cy.get('[data-cy=navitem-syncsettings]').click();
//         cy.get('[data-cy=provider-arcade]').click();
//         cy.get('[data-cy=button-add-new-credentials]').click();
//         fillProviderForm({
//             name: 'dummy',
//             id: 'some_arcade_id',
//             secret: 'some_arcade_secret',
//         });
//         cy.get('[data-cy=provider-modal-error]').should('exist');
//     });
// });

describe('When starting with stored api data', () => {
    it('shows remote storage callout when api data is stored on document and lets user set sync settings', () => {
        cy.visit('/');
        cy.receiveTokenValues();
        cy.receiveStorageType({
            provider: StorageProviderType.ARCADE,
            id: '12345',
            name: 'My secret project',
        });
        cy.get('[data-cy=callout-action-setupsync]').click();
        cy.get('[data-cy=modal-edit-storage-item]').should('exist');
    });
});

describe.only('When starting with api providers', () => {
    it('shows remote storage callout when api data is stored on document and lets user set sync settings', () => {
        cy.visit('/');
        cy.receiveTokenValues();
        cy.receiveStorageTypeLocal();
        cy.receiveApiProviders([
            {
                id: '1234',
                secret: 'supersecret',
                provider: StorageProviderType.ARCADE,
                name: 'dummy',
            },
        ]);
        cy.get('[data-cy=button-configure]').click();
        cy.get('[data-cy=navitem-syncsettings]').click();
        cy.get('[data-cy=provider-arcade]').click();
        cy.get('[data-cy=summary-arcade]').click();
        cy.get('[data-cy=storageitem-arcade-1234] [data-cy=button-storageitem-edit').click()
        cy.get('[data-cy=modal-edit-storage-item]').should('exist');
        cy.get('[data-cy=modal-edit-storage-item] input[name=name]').should('have.value', 'dummy');
    });
});
