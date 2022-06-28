import {
  StorageProviderType
} from '@/constants/StorageProviderType';
import MockEnv from '../support/mockEnv'

describe('Branch switcher', () => {
  const provider = {
    provider: StorageProviderType.GITHUB,
    id: '122/figma-tokens',
    secret: '456',
    name: 'dummy 2',
    baseUrl: 'six7',
    branch: 'main',
    filePath: 'tokens.json'
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

  it('successfully create a new branch from current change', () => {
    cy.apiCredentials(provider);
    cy.receiveSetTokens({
      version: '5',
      values: {
        options: [{
          name: 'sizing.xs',
          value: 4,
          type: 'sizing'
        }],
        global: [{
          name: 'sizing.xs',
          value: 4,
          type: 'sizing'
        }],
      },
    });
    cy.get('[data-cy=branch-selector-menu-trigger]').click();
    cy.get('[data-cy=branch-selector-create-new-branch-trigger]').click();
    cy.get('[data-cy=branch-selector-create-new-branch-from-current-change]').click();
    cy.get('input[name=branch]').type('new-branch');
    cy.get('button[type=submit]').click();
    cy.get('[name="commitMessage"]').type('push changes');
    cy.get('button[type=submit]').click();
    cy.get('[data-cy=push-dialog-success-heading]').should('have.length', 1);
  });

  it('successfully change to an existing branch', () => {
    cy.apiCredentials(provider);
    cy.get('[data-cy=branch-selector-menu-trigger]').click();
    cy.get('[data-cy=branch-switch-menu-radio-element-development]').click();
    cy.get('[data-cy=branch-selector-menu-trigger]').click();
    cy.get('[data-cy=branch-switch-menu-radio-element-development] [data-cy=branch-switch-menu-check-icon]').should('have.length', 1);
  });

  it('successfully push change', () => {
    cy.apiCredentials(provider);
    cy.receiveSetTokens({
      version: '5',
      values: {
        options: [{
          name: 'sizing.xs',
          value: 4,
          type: 'sizing'
        }],
        global: [{
          name: 'sizing.xs',
          value: 4,
          type: 'sizing'
        }],
      },
    });
    cy.get('[data-cy=footer-push-button]').click();
    cy.get('[name="commitMessage"]').type('push changes');
    cy.get('button[type=submit]').click();
    cy.get('[data-cy=push-dialog-success-heading]').should('have.length', 1);
  });

});