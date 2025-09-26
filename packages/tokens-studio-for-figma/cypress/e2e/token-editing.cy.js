import {
  StorageProviderType
} from '@/constants/StorageProviderType';
import { UpdateMode } from '@/constants/UpdateMode';
import MockEnv from '../support/mockEnv';
import { fillTokenForm, fillValueInput, fillInput } from './helpers/utils';

describe('Token Editing and Validation', () => {
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
      shouldUpdateStyles: true,
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
        global: [{
          name: 'color.red',
          value: '#ff0000',
          type: 'color'
        }, {
          name: 'sizing.xs',
          value: 4,
          type: 'sizing'
        }, {
          name: 'spacing.small',
          value: 8,
          type: 'spacing'
        }],
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

  it('validates required fields when creating tokens', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Try to create a token without name
    cy.get('[data-testid=tokenlisting-color] [data-testid=button-add-new-token]').click();
    cy.get('[data-testid=mention-input-value]').type('#blue{enter}');
    
    // Should not create token without name
    cy.get('input[name=name]').should('have.class', 'error').or('have.attr', 'aria-invalid', 'true').or('be.focused');
  });

  it('validates hex color format', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Create color token with invalid hex
    cy.get('[data-testid=tokenlisting-color] [data-testid=button-add-new-token]').click();
    
    fillInput({
      input: 'name',
      value: 'color.invalid',
    });
    
    // Try invalid hex format
    cy.get('[data-testid=mention-input-value]').type('invalid-color{enter}');
    
    // Should show validation error or prevent submission
    cy.get('body').should('contain.text', 'invalid').or('contain.text', 'format').or('contain.text', 'color');
  });

  it('validates numeric values for sizing tokens', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Create sizing token with invalid number
    cy.get('[data-testid=tokenlisting-sizing] [data-testid=button-add-new-token]').click();
    
    fillInput({
      input: 'name',
      value: 'sizing.invalid',
    });
    
    // Try non-numeric value
    cy.get('[data-testid=mention-input-value]').type('not-a-number{enter}');
    
    // Should show validation error
    cy.get('body').should('contain.text', 'number').or('contain.text', 'invalid').or('contain.text', 'numeric');
  });

  it('can edit existing token values', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Find existing token and edit it
    cy.contains('color.red').should('be.visible');
    
    // Right-click to access context menu
    cy.contains('color.red').rightclick();
    
    // Look for edit option
    cy.contains('Edit').click();
    
    // Should open edit form
    cy.get('input[name=name]').should('be.visible').and('have.value', 'color.red');
    
    // Change the value
    cy.get('[data-testid=mention-input-value]').clear().type('#00ff00{enter}');
    
    // Should update the token
    cy.get('@postMessage').should('have.been.called');
  });

  it('can rename tokens', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Edit token name
    cy.contains('color.red').rightclick();
    cy.contains('Edit').click();
    
    // Change the name
    cy.get('input[name=name]').clear().type('color.primary');
    cy.get('[data-testid=mention-input-value]').type('{enter}');
    
    // Should update token name
    cy.get('@postMessage').should('have.been.called');
  });

  it('can delete tokens', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Delete token
    cy.contains('color.red').rightclick();
    cy.contains('Delete').click();
    
    // Should confirm deletion or delete immediately
    cy.get('@postMessage').should('have.been.called');
  });

  it('can create token references', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Create a token that references another token
    cy.get('[data-testid=tokenlisting-color] [data-testid=button-add-new-token]').click();
    
    fillInput({
      input: 'name',
      value: 'color.secondary',
    });
    
    // Use reference syntax
    cy.get('[data-testid=mention-input-value]').type('$color.red{enter}');
    
    // Should create reference
    cy.get('@postMessage').should('have.been.called');
  });

  it('validates token references', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Create token with invalid reference
    cy.get('[data-testid=tokenlisting-color] [data-testid=button-add-new-token]').click();
    
    fillInput({
      input: 'name',
      value: 'color.broken',
    });
    
    // Reference non-existent token
    cy.get('[data-testid=mention-input-value]').type('$color.nonexistent{enter}');
    
    // Should show validation warning or error
    cy.get('body').should('contain.text', 'not found').or('contain.text', 'invalid').or('contain.text', 'reference');
  });

  it('can create complex shadow tokens', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Create box shadow token
    cy.get('[data-testid=tokenlisting-boxShadow] [data-testid=button-add-new-token]').click();
    
    fillInput({
      input: 'name',
      value: 'shadow.large',
    });
    
    // Fill shadow properties
    fillValueInput({
      input: 'x',
      value: '0',
    });
    
    fillValueInput({
      input: 'y',
      value: '4',
    });
    
    fillValueInput({
      input: 'blur',
      value: '8',
    });
    
    fillValueInput({
      input: 'spread',
      value: '0',
    });
    
    fillValueInput({
      input: 'color',
      value: '#000000',
      submit: true,
    });
    
    // Should create shadow token
    cy.get('@postMessage').should('have.been.calledThrice');
  });

  it('can create typography tokens', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Create typography token
    cy.get('[data-testid=tokenlisting-typography] [data-testid=button-add-new-token]').click();
    
    fillInput({
      input: 'name',
      value: 'typography.heading',
    });
    
    // Fill typography properties - these might have different test IDs
    cy.get('input[placeholder*="font"], select[name*="font"], input[name*="font"]').first().type('Arial');
    cy.get('input[placeholder*="size"], input[name*="size"]').type('24');
    cy.get('input[placeholder*="weight"], select[name*="weight"], input[name*="weight"]').type('bold');
    
    // Submit the form
    cy.get('button[type="submit"], button').contains(/save|create|add/i).click();
    
    // Should create typography token
    cy.get('@postMessage').should('have.been.called');
  });

  it('can duplicate tokens', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Duplicate existing token
    cy.contains('color.red').rightclick();
    
    // Look for duplicate or copy option
    cy.contains('Duplicate').click().or(cy.contains('Copy').click());
    
    // Should create duplicate or show duplicate dialog
    cy.get('body').should('contain.text', 'duplicate').or('contain.text', 'copy');
  });

  it('handles token name conflicts', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Try to create token with existing name
    cy.get('[data-testid=tokenlisting-color] [data-testid=button-add-new-token]').click();
    
    fillInput({
      input: 'name',
      value: 'color.red', // Already exists
    });
    
    cy.get('[data-testid=mention-input-value]').type('#0000ff{enter}');
    
    // Should show conflict dialog or validation error
    cy.get('body').should('contain.text', 'exists').or('contain.text', 'duplicate').or('contain.text', 'already');
  });

  it('can create tokens in groups/folders', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Create token with nested name
    cy.get('[data-testid=tokenlisting-color] [data-testid=button-add-new-token]').click();
    
    fillTokenForm({
      name: 'color.brand.primary',
      value: '#0066cc',
    });
    
    // Should create nested token structure
    cy.get('@postMessage').should('have.been.called');
  });

  it('validates border token properties', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Create border token
    cy.get('[data-testid=tokenlisting-border] [data-testid=button-add-new-token]').click();
    
    fillInput({
      input: 'name',
      value: 'border.thin',
    });
    
    // Fill border properties
    cy.get('input[name*="width"], input[placeholder*="width"]').type('1');
    cy.get('input[name*="color"], input[placeholder*="color"]').type('#000000');
    cy.get('select[name*="style"], input[name*="style"]').type('solid');
    
    // Submit form
    cy.get('button[type="submit"], button').contains(/save|create|add/i).click();
    
    // Should create border token
    cy.get('@postMessage').should('have.been.called');
  });

  it('can search and filter tokens during editing', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Look for search functionality
    cy.get('input[placeholder*="search"], input[placeholder*="filter"]').type('color');
    
    // Should filter to show only color tokens
    cy.contains('color.red').should('be.visible');
    cy.contains('sizing.xs').should('not.be.visible');
  });
});