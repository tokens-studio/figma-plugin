describe('Themes', () => {
    beforeEach(() => {
      cy.visit('/', {
        onBeforeLoad(win) {
          cy.spy(win, 'postMessage').as('postMessage');
        },
      });
      cy.waitForReact(1000);
    });  
    it('Can create a new token-set', () => {
      
    });
  });