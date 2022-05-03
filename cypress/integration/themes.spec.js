describe('Themes', () => {
  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad(win) {
        cy.spy(win, 'postMessage').as('postMessage');
      },
    });
    cy.waitForReact(1000);
  });

  it('Can create a new theme', () => {
    cy.receiveTokenValues({
      version: '5',
      values: {
        global: [],
      },
    });
    cy.receiveStorageTypeLocal();

    cy.get('[data-cy="themeselector-dropdown"]').click();
    cy.get('[data-cy="themeselector-managethemes"]').click();
    cy.get('[data-cy="button-manage-themes-modal-new-theme"]').click();
    cy.get('[data-cy="create-or-edit-theme-form--input--name"]').type('My first theme');
    cy.get('[data-cy="tokensettheme-item--dropdown-trigger--global-set"]').click();
    cy.get('[data-cy="tokensettheme-item--dropdown-content--source"]').click();
    cy.get('[data-cy="button-manage-themes-modal-save-theme"]').click();
    cy.get('[data-cy="singlethemeentry"]').should('have.length', 1)
  });

  it('Can enable a previously created theme', () => {
    cy.receiveTokenValues({
      version: '5',
      values: { global: [] },
      themes: [
        {
          id: 'my-first-theme',
          name: 'My first theme',
          selectedTokenSets: {
            global: 'source',
          },
        }
      ]
    });
    cy.receiveStorageTypeLocal();
    cy.get('[data-cy="themeselector-dropdown"]').click()
    cy.get('[data-cy="themeselector--themeoptions--my-first-theme"]').click()
    cy.get('[data-cy="themeselector-dropdown"]').should('have.text', 'Theme:My first theme')
  });

  it('Can delete a theme', () => {
    cy.receiveTokenValues({
      version: '5',
      values: { global: [] },
      themes: [
        {
          id: 'my-first-theme',
          name: 'My first theme',
          selectedTokenSets: {
            global: 'source',
          },
        }
      ]
    });
    cy.receiveStorageTypeLocal();
    cy.get('[data-cy="themeselector-dropdown"]').click()
    cy.get('[data-cy="themeselector-managethemes"]').click();
    cy.get('[data-cy="singlethemeentry-my-first-theme"]').click();
    cy.get('[data-cy="button-manage-themes-modal-delete-theme"]').click();
    cy.get('[data-cy="singlethemeentry"]').should('have.length', 0)
  });
});