import {
  StorageProviderType
} from '@/constants/StorageProviderType';
import { UpdateMode } from '@/constants/UpdateMode';

const fillTokenForm = ({
  name,
  value
}) => {
  cy.get('input[name=name]').type(name);
  cy.get('[data-cy=mention-input-value]').type(value);
  cy.get('input[name=name]').type('{enter}');
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

const fillValueInput = ({
  submit = false,
  input,
  value
}) => {
  cy.get(`[data-cy=mention-input-${input}]`).type(`{selectall} ${value}`);

  if (submit) {
    cy.get(`[data-cy=mention-input-${input}]`).type('{enter}');
  }
};

const fillInputNth = ({
  submit = false,
  input,
  value,
  nth,
}) => {
  cy.get(`[data-cy=mention-input-${input}]`).eq(nth).type(`{selectall}${value}`);

  if (submit) {
    cy.get(`[data-cy=mention-input-${input}]`).eq(nth).type('{enter}');
  }
};

describe('TokenListing', () => {
  const mockStartupParams = {
    activeTheme: {},
    lastOpened: Date.now(),
    onboardingExplainer: {
      sets: true,
      inspect: true,
      syncProviders: true,
    },
    localApiProviders: [],
    licenseKey: null,
    settings: {
      width: 800,
      height: 500,
      ignoreFirstPartForStyles: false,
      inspectDeep: false,
      prefixStylesWithThemeName: false,
      showEmptyGroups: true,
      updateMode: UpdateMode.PAGE,
      updateOnChange: false,
      updateRemote: true,
      updateStyles: true,
    },
    storageType: { provider: StorageProviderType.LOCAL },
    user: {
      figmaId: 'figma:1234',
      userId: 'uid:1234',
      name: 'Jan Six',
    },
    localTokenData: {
      activeTheme: {},
      checkForChanges: false,
      themes: [],
      usedTokenSet: {},
      updatedAt: new Date().toISOString(),
      values: {
      },
      version: '91',
    },
  }

  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad(win) {
        cy.spy(win, 'postMessage').as('postMessage');
      },
    });
    cy.waitForReact(1000);
  });

  it('can add a new token', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-cy="button-configure"]').should('be.visible')
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
    cy.get('[data-cy=tokenlisting-sizing] [data-cy=button-add-new-token]').click({
      timeout: 1000
    });
    fillTokenForm({
      name: 'sizing.sm',
      value: '4',
    });
    cy.get('@postMessage').should('be.calledTwice');
    cy.get('[data-cy=tokenlisting-sizing] [data-cy=button-add-new-token]').click({
      timeout: 1000
    });
    fillTokenForm({
      name: 'sizing.md',
      value: '$sizing.sm * 2',
    });
  });

  it('can add a new shadow token', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-cy="button-configure"]').should('be.visible')
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
    cy.get('[data-cy=tokenlisting-boxShadow] [data-cy=button-add-new-token]').click({
      timeout: 1000
    });
    fillInput({
      input: 'name',
      value: 'boxshadow.regular',
    });
    fillValueInput({
      input: 'x',
      value: '4',
    });
    fillValueInput({
      input: 'y',
      value: '4',
    });
    fillValueInput({
      input: 'spread',
      value: '0',
    });
    fillValueInput({
      input: 'color',
      value: '#ff0000',
    });
    fillValueInput({
      input: 'blur',
      value: '0',
      submit: true,
    });

    cy.get('@postMessage').should('be.calledTwice');
  });

  it('can add multiple shadow tokens', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-cy="button-configure"]').should('be.visible')
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
    cy.get('[data-cy=tokenlisting-boxShadow] [data-cy=button-add-new-token]').click({
      timeout: 1000
    });
    fillInput({
      input: 'name',
      value: 'boxshadow.large',
    });
    fillValueInput({
      input: 'x',
      value: '4',
    });
    fillValueInput({
      input: 'y',
      value: '4',
    });
    fillValueInput({
      input: 'spread',
      value: '0',
    });
    fillValueInput({
      input: 'color',
      value: '#ff0000',
    });
    fillValueInput({
      input: 'blur',
      value: '0',
    });
    cy.get('[data-cy=button-shadow-add-multiple]').click({
      timeout: 1000
    });
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
  });

  it('can add a new typography token', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-cy="button-configure"]').should('be.visible')
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
    cy.get('[data-cy=tokenlisting-typography] [data-cy=button-add-new-token]').click({
      timeout: 1000
    });
    fillInput({
      input: 'name',
      value: 'typography.regular',
    });
    fillValueInput({
      input: 'fontFamily',
      value: 'Inter',
    });
    fillValueInput({
      input: 'fontWeight',
      value: 'Bold',
    });
    fillValueInput({
      input: 'lineHeight',
      value: '100%',
    });
    fillValueInput({
      input: 'fontSize',
      value: '14',
    });
    fillValueInput({
      input: 'letterSpacing',
      value: '0',
    });
    fillValueInput({
      input: 'paragraphSpacing',
      value: '0',
      submit: true,
    });
    cy.get('@postMessage').should('be.calledTwice');
  });


  it('can add a new token in group', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-cy="button-configure"]').should('be.visible')
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
    cy.get(
      '[data-cy=tokenlisting-sizing] [data-cy=token-group-sizing] [data-cy=button-add-new-token-in-group]',
    ).click({
      timeout: 1000
    });
    fillTokenForm({
      name: 'lg',
      value: '8',
    });
    cy.get('@postMessage').should('be.calledTwice');
  });

  it('token listing stays collapsed after creating a new token', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-cy="button-configure"]').should('be.visible')
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
    cy.get('[data-cy=tokenlisting-header-sizing]').click({
      timeout: 1000
    });
    cy.get('[data-cy=tokenlisting-opacity] [data-cy=button-add-new-token]').click({
      timeout: 1000
    });
    fillTokenForm({
      name: 'sizing.sm',
      value: '4',
    });
    cy.get('[data-cy=tokenlisting-sizing-content]').should('be.hidden');
  });

  it('can add a new composition token', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-cy="button-configure"]').should('be.visible')
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
    cy.get('[data-cy=tokenlisting-composition] [data-cy=button-add-new-token]').click({
      timeout: 1000
    });
    fillInput({
      input: 'name',
      value: 'composition.regular',
    });
    cy.get('[data-cy=composition-token-dropdown]').click();
    cy.get('[data-cy=item-dropdown-menu-element-sizing]').click();
    fillValueInput({
      input: 'value',
      value: '$sizing.xs',
    });
    cy.get('[data-cy=button-style-add-multiple]').click();

    cy.get('[data-cy=composition-token-dropdown]').eq(1).click();
    cy.get('[data-cy=item-dropdown-menu-element-opacity]').click();
    fillInputNth({
      input: 'value',
      value: '$opacity.30',
      nth: 1,
    });

    cy.get('[data-cy=button-style-add-multiple]').click();
    cy.get('[data-cy=composition-token-dropdown]').eq(2).click();
    cy.get('[data-cy=item-dropdown-menu-element-fontSizes]').click();
    fillInputNth({
      input: 'value',
      value: '$font-size.4',
      nth: 2,
      submit: true,
    });
    cy.get('@postMessage').should('be.calledTwice');
  });
});