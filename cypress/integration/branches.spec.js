import { StorageProviderType } from '@/constants/StorageProviderType';

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
  });

  it('successfully shows list of branches', () => {
    cy.apiCredentials(provider);
    cy.intercept('GET', 'https://api.github.com/repos/122//branches', [
          { name: 'main' },
          { name: 'development' },
        ],
    );
    cy.get('[data-cy=branch-switch-dropdown]').click();
    cy.get('[data-cy=branch-switch-dropdown-menu-element]').should('have.length', 2).and('have.contain', 'main').and('have.contain', 'development');
  });

});
