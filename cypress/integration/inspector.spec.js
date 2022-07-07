describe('Inspector tokens', () => {
  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad(win) {
        cy.spy(win, 'postMessage').as('postMessage');
      },
    });
    cy.waitForReact(1000);
  });

  it('successfully shows tokens applied on the node', () => {
    cy.receiveSetTokens({
      version: '5',
      values: {
        options: [{
            name: 'sizing.xs',
            value: 4,
            type: 'sizing'
          },
          {
            name: 'opacity.50',
            value: '50%',
            type: 'opacity'
          },
          {
            name: 'font-size.12',
            value: '12px',
            type: 'fontSizes'
          }
        ],
        global: [{
          name: 'sizing.xs',
          value: 4,
          type: 'sizing'
        }],
      },
    });
    cy.receiveSelectionValues();
    cy.get('[data-cy=navitem-inspector]').click();
    cy.contains('sizing');
    cy.contains('opacity');
    cy.contains('fontSizes');
  });

});