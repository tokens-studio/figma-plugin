import { AVAILABLE_PROVIDERS } from '@sync-providers/constants';
import { UpdateMode } from '@/constants/UpdateMode';
import MockEnv from '../support/mockEnv';
import { fillTokenForm, fillInputNth, fillValueInput, fillInput } from './helpers/utils';

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
    licenseKey: 'valid-license-key',
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
    storageType: { provider: AVAILABLE_PROVIDERS.LOCAL },
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
    MockEnv();
  });

  it('can add a new token', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible')
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
    cy.get('[data-testid=tokenlisting-sizing] [data-testid=button-add-new-token]').click({
      timeout: 1000
    });
    fillTokenForm({
      name: 'sizing.sm',
      value: '4',
    });
    cy.get('@postMessage').should('be.calledThrice');
    cy.get('[data-testid=tokenlisting-sizing] [data-testid=button-add-new-token]').click({
      timeout: 1000
    });
    fillTokenForm({
      name: 'sizing.md',
      value: '$sizing.sm * 2',
    });
  });

  it('can add a new shadow token', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible')
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
    cy.get('[data-testid=tokenlisting-boxShadow] [data-testid=button-add-new-token]').click({
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

    cy.get('@postMessage').should('be.calledThrice');
  });

  it('can add multiple shadow tokens', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible')
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
    cy.get('[data-testid=tokenlisting-boxShadow] [data-testid=button-add-new-token]').click({
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
    cy.get('[data-testid=button-shadow-add-multiple]').click({
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
    cy.get('@postMessage').should('be.calledThrice');
  });

  it('can add a new typography token', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible')
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
    cy.get('[data-testid=tokenlisting-typography] [data-testid=button-add-new-token]').click({
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
    cy.get('@postMessage').should('be.calledThrice');
  });


  it('can add a new token in group', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible')
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
      '[data-testid=tokenlisting-sizing] [data-testid=token-group-sizing] [data-testid=button-add-new-token-in-group]',
    ).click({
      timeout: 1000
    });
    fillTokenForm({
      name: 'lg',
      value: '8',
    });
    cy.get('@postMessage').should('be.calledThrice');
  });

  it('token listing stays collapsed after creating a new token', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible')
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
    cy.get('[data-testid=tokenlisting-sizing-collapse-button]').click({
      timeout: 1000
    });
    cy.get('[data-testid=tokenlisting-opacity] [data-testid=button-add-new-token]').click({
      timeout: 1000
    });
    fillTokenForm({
      name: 'sizing.sm',
      value: '4',
    });
    cy.get('[data-testid=tokenlisting-sizing-content]').should('be.hidden');
  });

  it('can add a new composition token', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible')
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
    cy.get('[data-testid=tokenlisting-composition] [data-testid=button-add-new-token]').click();
    fillInput({
      input: 'name',
      value: 'composition.regular',
    });
    cy.get('[data-testid=composition-token-dropdown]').click();
    cy.get('[data-testid=item-dropdown-menu-element-height]').click();
    fillValueInput({
      input: 'value',
      value: '$sizing.xs',
    });
    cy.get('[data-testid=button-style-add-multiple]').click();

    cy.get('[data-testid=composition-token-dropdown]').eq(1).click();
    cy.get('[data-testid=item-dropdown-menu-element-fontFamilies]').click();
    fillInputNth({
      input: 'value',
      value: '$fontFamilies.aria',
      nth: 1,
      submit: true,
    });
    cy.get('@postMessage').should('be.calledThrice');
  });
  it('click outside modify select color create modal doesn’t close modal', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible')
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
    cy.get('[data-testid=tokenlisting-color] [data-testid=button-add-new-token]').click();

    fillInput({
      input: 'name',
      value: 'modifyToken',
    });

    cy.get('[data-testid=button-add-new-modify]').click();
    cy.get('[data-testid=colortokenform-operation-button]').click();

    cy.get('span:contains("darken")').parent().should('be.visible');
    cy.get('span:contains("darken")').click();
    cy.get('[data-testid=colortokenform-operation-button]').click();
    cy.get('span:contains("darken")').parent().should('be.visible');

    cy.get('body').type('{esc}');

    cy.get('span:contains("alpha")').should('not.exist');
    cy.get('[data-testid="colortokenform-operation-button"]').should('be.visible');

    fillInputNth({
      input: 'value',
      value: '#000000',
      nth: 0,
    });
    fillInputNth({
      input: 'value',
      value: '0.5',
      nth: 1,
      submit: true,
    });
    cy.get('@postMessage').should('be.calledThrice');
  });
  it('click outside select in composition create modal doesn’t close modal', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible')
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
    cy.get('[data-testid=tokenlisting-composition] [data-testid=button-add-new-token]').click();

    fillInput({
      input: 'name',
      value: 'compositionToken',
    });

    cy.get('[data-testid="composition-token-dropdown"]').click();

    cy.get('span:contains("minWidth")').parent().should('be.visible');
    cy.get('span:contains("minWidth")').parent().click();
    cy.get('[data-testid="composition-token-dropdown"]').click();


    cy.get('body').type('{esc}');

    cy.get('span:contains("darken")').should('not.exist');
    cy.get('[data-testid="composition-token-dropdown"]').should('be.visible');

    fillInputNth({
      input: 'value',
      value: '#000000',
      nth: 0,
      submit: true,
    });
    cy.get('@postMessage').should('be.calledThrice');
  });

  it('can delete duplicate tokens with duplicate resolve modal', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible')
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
        }, {
          name: 'buttons.default',
          value: '#0af',
          type: 'color'
        }, {
          name: 'buttons.default',
          value: '#0fa',
          type: 'color'
        }],
        global: [{
          name: 'sizing.xs',
          value: 4,
          type: 'sizing'
        }, {
          name: 'buttons.default',
          value: '#0fa',
          type: 'color'
        }, {
          name: 'buttons.default',
          value: 4,
          type: 'sizing'
        }],
      },
    });
    cy.get('[data-testid=resolve-duplicate-modal-open-button]').click();

    cy.get('[role="radiogroup"] [value="global:buttons.default:1"]').click();

    cy.get('#resolveDuplicateTokenGroup').submit();
    cy.get('#confirmDeleteDuplicates').submit();

    cy.get('@postMessage').should('be.calledThrice');

    cy.get('[data-testid=resolve-duplicate-modal-open-button]').should('not.exist');

    // Verify duplicates were correctly deleted
    cy.window().its('store').invoke('getState').its('tokenState').its('tokens').should('deep.equal', {
      "options": [
        {
          "name": "sizing.xs",
          "value": 4,
          "type": "sizing"
        },
        {
          "name": "opacity.30",
          "value": "30%",
          "type": "opacity"
        },
        {
          "name": "font-size.4",
          "value": "4px",
          "type": "fontSizes"
        },
        {
          "name": "buttons.default",
          "value": "#0af",
          "type": "color"
        }
      ],
      "global": [
        {
          "name": "sizing.xs",
          "value": 4,
          "type": "sizing"
        },
        {
          "name": "buttons.default",
          "value": 4,
          "type": "sizing"
        }
      ]
    })
  });
});
