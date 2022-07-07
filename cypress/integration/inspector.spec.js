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
    cy.receiveSelectionValues({
      selectionValues: [{
          category: "sizing",
          type: "sizing",
          value: "sizing.xs",
          nodes: [{
            id: "3425:3",
            name: "Rectangle 2",
            type: "RECTANGLE",
          }],
        },
        {
          category: "opacity",
          type: "opacity",
          value: "opacity.50",
          nodes: [{
            id: "3425:3",
            name: "Rectangle 2",
            type: "RECTANGLE",
          }],
        },
        {
          category: "fontSizes",
          type: "fontSizes",
          value: "font-size.12",
          nodes: [{
            id: "3425:3",
            name: "Rectangle 2",
            type: "RECTANGLE",
          }],
        },
      ],
      selectedNodes: 1,
      mainNodeSelectionValues: {
        sizing: "sizing.xs",
        opacity: "opacity.50",
        fontSizes: "font-size.12",
      }
    });
    cy.get('[data-cy=navitem-inspector]').click();
    cy.get('[data-cy=inspector-token-single-sizing]').should('have.length', 1);
    cy.get('[data-cy=inspector-token-single-opacity]').should('have.length', 1);
    cy.get('[data-cy=inspector-token-single-fontSizes]').should('have.length', 1);
  });

  it('successfully remap a token', () => {
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
            name: 'opacity.100',
            value: '100%',
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
    cy.receiveSelectionValues({
      selectionValues: [{
          category: "sizing",
          type: "sizing",
          value: "sizing.xs",
          nodes: [{
            id: "3425:3",
            name: "Rectangle 2",
            type: "RECTANGLE",
          }],
        },
        {
          category: "opacity",
          type: "opacity",
          value: "opacity.50",
          nodes: [{
            id: "3425:3",
            name: "Rectangle 2",
            type: "RECTANGLE",
          }],
        },
        {
          category: "fontSizes",
          type: "fontSizes",
          value: "font-size.12",
          nodes: [{
            id: "3425:3",
            name: "Rectangle 2",
            type: "RECTANGLE",
          }],
        },
      ],
      selectedNodes: 1,
      mainNodeSelectionValues: {
        sizing: "sizing.xs",
        opacity: "opacity.50",
        fontSizes: "font-size.12",
      }
    });
    cy.get('[data-cy=navitem-inspector]').click({
      timeout: 1000
    });
    cy.get('[data-cy=inspector-token-single-opacity] [data-cy=button-token-remap]').click();
    cy.get(`input[name=value]`).type('$opacity.100').type('{enter}');
    cy.receiveSelectionValues({
      selectionValues: [{
          category: "sizing",
          type: "sizing",
          value: "sizing.xs",
          nodes: [{
            id: "3425:3",
            name: "Rectangle 2",
            type: "RECTANGLE",
          }],
        },
        {
          category: "opacity",
          type: "opacity",
          value: "opacity.100",
          nodes: [{
            id: "3425:3",
            name: "Rectangle 2",
            type: "RECTANGLE",
          }],
        },
        {
          category: "fontSizes",
          type: "fontSizes",
          value: "font-size.12",
          nodes: [{
            id: "3425:3",
            name: "Rectangle 2",
            type: "RECTANGLE",
          }],
        },
      ],
      selectedNodes: 1,
      mainNodeSelectionValues: {
        sizing: "sizing.xs",
        opacity: "opacity.100",
        fontSizes: "font-size.12",
      }
    });

    cy.contains('opacity.50').should('not.exist');
    cy.contains('opacity.100');
  });
});