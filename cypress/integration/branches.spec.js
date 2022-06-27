import { StorageProviderType } from '@/constants/StorageProviderType';
import MockEnv from '../support/mockEnv'

describe('Branch swither', () => {
  const provider = {
    provider: StorageProviderType.GITHUB, id: '122', secret: '456', name: 'dummy 2', branch: 'main'
  };

  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad(win) {
        cy.spy(win, 'postMessage').as('postMessage');
      },
    });
    cy.waitForReact(1000);
    MockEnv();
  });

  it('successfully shows list of branches', () => {
    cy.apiCredentials(provider);
    cy.get('[data-cy=branch-selector-menu-trigger]').click();
    cy.get('[data-cy=branch-switch-menu-radio-element-main]').should('have.length', 1);
    cy.get('[data-cy=branch-switch-menu-radio-element-development]').should('have.length', 1);
  });

  it('successfully create a new branch', () => {
    cy.apiCredentials(provider);
    cy.get('[data-cy=branch-selector-menu-trigger]').click();
    cy.get('[data-cy=branch-selector-create-new-branch-trigger]').click();
    cy.get('[data-cy=branch-selector-create-branch-from-branch-main]').click();
    cy.get('input[name=branch]').type('new-branch');
    cy.get('button[type=submit]').click();
    cy.get('[data-cy=branch-selector-menu-trigger]').click();
    cy.get('[data-cy=branch-switch-menu-radio-element-new-branch]').should('have.length', 1);
  });


});
