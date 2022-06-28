function receiveRemoteComponents() {
  cy.window().then(($window) => {
    const message = {
      pluginMessage: {
        type: 'remotecomponents',
        values: {
          remotes: []
        },
      },
    };
    $window.postMessage(message, '*');
  });
}

const fillTokenForm = ({
  name,
  value
}) => {
  cy.get('input[name=name]').type(name);
  cy.get('input[name=value]').type(value);
  cy.get('input[name=value]').type('{enter}');
};

const fillInput = ({
  submit = false,
  input,
  value
}) => {
  cy.get(`input[name=${input}]`).type(`{selectall} ${value}`);

  if (submit) {
    cy.get(`input[name=${input}]`).type('{enter}');
  }
};

const fillInputNth = ({
  submit = false,
  input,
  value,
  nth,
}) => {
  cy.get(`input[name=${input}]`).eq(nth).type(`{selectall}${value}`);

  if (submit) {
    cy.get(`input[name=${input}]`).eq(nth).type('{enter}');
  }
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
    cy.receiveStorageTypeLocal();
    cy.get('[data-cy=tokenlisting-sizing] [data-cy=button-add-new-token]').click({ timeout: 1000 });
    fillTokenForm({
      name: 'sizing.sm',
      value: '4',
    });
    cy.get('@postMessage').should('be.calledTwice');
    receiveRemoteComponents();
    cy.get('[data-cy=tokenlisting-sizing] [data-cy=button-add-new-token]').click({ timeout: 1000 });
    fillTokenForm({
      name: 'sizing.md',
      value: '$sizing.sm * 2',
    });
  });

  it('can add a new shadow token', () => {
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
    cy.receiveStorageTypeLocal();
    cy.get('[data-cy=tokenlisting-boxShadow] [data-cy=button-add-new-token]').click({ timeout: 1000 });
    fillInput({
      input: 'name',
      value: 'boxshadow.regular',
    });
    fillInput({
      input: 'x',
      value: '4',
    });
    fillInput({
      input: 'y',
      value: '4',
    });
    fillInput({
      input: 'spread',
      value: '0',
    });
    fillInput({
      input: 'color',
      value: '#ff0000',
    });
    fillInput({
      input: 'blur',
      value: '0',
      submit: true,
    });

    cy.get('@postMessage').should('be.calledTwice');
    receiveRemoteComponents();
  });

  it('can add multiple shadow tokens', () => {
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
    cy.receiveStorageTypeLocal();
    cy.get('[data-cy=tokenlisting-boxShadow] [data-cy=button-add-new-token]').click({ timeout: 1000 });
    fillInput({
      input: 'name',
      value: 'boxshadow.large',
    });
    fillInput({
      input: 'x',
      value: '4',
    });
    fillInput({
      input: 'y',
      value: '4',
    });
    fillInput({
      input: 'spread',
      value: '0',
    });
    fillInput({
      input: 'color',
      value: '#ff0000',
    });
    fillInput({
      input: 'blur',
      value: '0',
    });
    cy.get('[data-cy=button-shadow-add-multiple]').click({ timeout: 1000 });
    fillInputNth({
      input: 'x',
      value: '4',
      nth: 1,
    });
    fillInputNth({
      input: 'y',
      value: '8',
      nth: 1,
      submit: true,
    });
    cy.get('@postMessage').should('be.calledTwice');
    receiveRemoteComponents();
  });

  it('can add a new typography token', () => {
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
    cy.receiveStorageTypeLocal();
    cy.get('[data-cy=tokenlisting-typography] [data-cy=button-add-new-token]').click({ timeout: 1000 });
    fillInput({
      input: 'name',
      value: 'typography.regular',
    });
    fillInput({
      input: 'fontFamily',
      value: 'Inter',
    });
    fillInput({
      input: 'fontWeight',
      value: 'Bold',
    });
    fillInput({
      input: 'lineHeight',
      value: '100%',
    });
    fillInput({
      input: 'fontSize',
      value: '14',
    });
    fillInput({
      input: 'letterSpacing',
      value: '0',
    });
    fillInput({
      input: 'paragraphSpacing',
      value: '0',
      submit: true,
    });
    cy.get('@postMessage').should('be.calledTwice');
    receiveRemoteComponents();
  });

  it('can add a new typography token by alias using autocomplete', () => {
    cy.receiveSetTokens({
      version: '5',
      values: {
        options: [{
            name: 'sizing.xs',
            value: 4,
            type: 'sizing'
          }, {
            name: 'typography.heading',
            value: {
              fontFamily: "Arial",
              fontSize: "12px",
              fontWeight: "bold",
              letterSpacing: "1",
              lineHeight: "1",
              paragraphSpacing: "1",
              textCase: "none",
              textDecoration: "underline",
            },
            type: 'typography'
          },
          {
            name: 'typography.label',
            value: {
              fontFamily: "Helvetica",
              fontSize: "24px",
              fontWeight: "light",
              letterSpacing: "2",
              lineHeight: "2",
              paragraphSpacing: "2",
              textCase: "none",
              textDecoration: "none",
            },
            type: 'typography'
          }
        ],
        global: [{
          name: 'sizing.xs',
          value: 4,
          type: 'sizing'
        }],
      },
    });
    cy.receiveStorageTypeLocal();
    cy.get('[data-cy=tokenlisting-typography] [data-cy=button-add-new-token]').click({
      timeout: 1000
    });
    cy.get('[data-cy=mode-change-button]').click();
    fillInput({
      input: 'name',
      value: 'typography.alias',
    });
    cy.get(`input[name=value]`).type('$typography.hea');
    cy.get('[data-cy=downshift-input-item]').click();
    cy.get(`input[name=value]`).type('{enter}');
    cy.get('@postMessage').should('be.calledTwice');
    receiveRemoteComponents();
  });

  it('can add a new token in group', () => {
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
    cy.receiveStorageTypeLocal();
    cy.get(
      '[data-cy=tokenlisting-sizing] [data-cy=token-group-sizing] [data-cy=button-add-new-token-in-group]',
    ).click({ timeout: 1000 });
    fillTokenForm({
      name: 'lg',
      value: '8',
    });
    cy.get('@postMessage').should('be.calledTwice');
    receiveRemoteComponents();
  });

  it('token listing stays collapsed after creating a new token', () => {
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
    cy.receiveStorageTypeLocal();
    cy.get('[data-cy=tokenlisting-header-sizing]').click({ timeout: 1000 });
    cy.get('[data-cy=tokenlisting-opacity] [data-cy=button-add-new-token]').click({ timeout: 1000 });
    fillTokenForm({
      name: 'sizing.sm',
      value: '4',
    });
    cy.get('[data-cy=tokenlisting-sizing-content]').should('have.class', 'hidden');
  });

  it('can add a new composition token', () => {
    cy.receiveSetTokens({
      version: '5',
      values: {
        options: [{
          name: 'sizing.xs',
          value: 4,
          type: 'sizing'
        }, {
          name: 'opacity.30',
          value: '30%',
          type: 'opacity'
        }, {
          name: 'font-size.4',
          value: '4px',
          type: 'fontSizes'
        }],
        global: [{
          name: 'sizing.xs',
          value: 4,
          type: 'sizing'
        }],
      },
    });
    cy.receiveStorageTypeLocal();
    cy.get('[data-cy=tokenlisting-composition] [data-cy=button-add-new-token]').click({ timeout: 1000 });
    fillInput({
      input: 'name',
      value: 'composition.regular',
    });
    cy.get('[data-cy=composition-token-dropdown]').click();
    cy.get('[data-cy=property-dropdown-menu-element-sizing]').click();
    fillInput({
      input: 'value',
      value: '$sizing.xs',
    });
    cy.get('[data-cy=button-style-add-multiple]').click();

    cy.get('[data-cy=composition-token-dropdown]').eq(1).click();
    cy.get('[data-cy=property-dropdown-menu-element-opacity]').click();
    fillInputNth({
      input: 'value',
      value: '$opacity.30',
      nth: 1,
    });

    cy.get('[data-cy=button-style-add-multiple]').click();
    cy.get('[data-cy=composition-token-dropdown]').eq(2).click();
    cy.get('[data-cy=property-dropdown-menu-element-fontSizes]').click();
    fillInputNth({
      input: 'value',
      value: '$font-size.4',
      nth: 2,
      submit: true,
    });
    cy.get('@postMessage').should('be.calledTwice');
    receiveRemoteComponents();
  });
});