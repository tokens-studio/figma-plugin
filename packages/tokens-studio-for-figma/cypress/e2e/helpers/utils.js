
export const fillTokenForm = ({
  name, value
}) => {
  cy.get('input[name=name]').type(name);
  cy.get('[data-testid=mention-input-value]').type(value);
  cy.get('[data-testid=mention-input-value]').type('{enter}');
};export const fillInputNth = ({
  submit = false, input, value, nth,
}) => {
  cy.get(`[data-testid=mention-input-${input}]`).eq(nth).type(`{selectall}${value}`);

  if (submit) {
    cy.get(`[data-testid=mention-input-${input}]`).eq(nth).type('{enter}');
  }
};
export const fillValueInput = ({
  submit = false, input, value
}) => {
  cy.get(`[data-testid=mention-input-${input}]`).type(`{selectall} ${value}`);

  if (submit) {
    cy.get(`[data-testid=mention-input-${input}]`).type('{enter}');
  }
};
export const fillInput = ({
  submit = false, input, value
}) => {
  cy.get(`input[name=${input}]`).type(`{selectall} ${value}`);

  if (submit) {
    cy.get(`input[name=${input}]`).type('{enter}');
  }
};

