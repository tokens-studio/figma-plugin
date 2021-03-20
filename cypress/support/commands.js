import {MessageFromPluginTypes} from '../../types/messages';
import {StorageProviderType} from '../../types/api';

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })


Cypress.Commands.add("receiveStorageTypeLocal", () => {
    cy.window().then(($window) => {
        const message = {
            pluginMessage: {
                type: MessageFromPluginTypes.RECEIVED_STORAGE_TYPE,
                storageType: {provider: StorageProviderType.LOCAL},
            },
        };
        $window.postMessage(message, '*');
    });
})

Cypress.Commands.add("receiveStorageType", (storageType) => {
    cy.window().then(($window) => {
        const message = {
            pluginMessage: {
                type: MessageFromPluginTypes.RECEIVED_STORAGE_TYPE,
                storageType,
            },
        };
        $window.postMessage(message, '*');
    });
})

Cypress.Commands.add("receiveApiProviders", (providers) => {
    cy.window().then(($window) => {
        const message = {
            pluginMessage: {
                type: MessageFromPluginTypes.API_PROVIDERS,
                providers,
            },
        };
        $window.postMessage(message, '*');
    });
})

Cypress.Commands.add("receiveTokenValues", (values) => {
    cy.window().then(($window) => {
        const message = {
            pluginMessage: {
                type: MessageFromPluginTypes.TOKEN_VALUES,
                values,
            },
        };
        $window.postMessage(message, '*');
    });
})