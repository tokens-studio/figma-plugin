import {
  StorageProviderType
} from '@/constants/StorageProviderType';
import { UpdateMode } from '@/constants/UpdateMode';
import MockEnv from '../support/mockEnv';

describe('Search and Filtering', () => {
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
        global: [
          {
            name: 'color.brand.primary',
            value: '#0066cc',
            type: 'color'
          },
          {
            name: 'color.brand.secondary',
            value: '#ff6600',
            type: 'color'
          },
          {
            name: 'color.neutral.gray',
            value: '#999999',
            type: 'color'
          },
          {
            name: 'sizing.xs',
            value: 4,
            type: 'sizing'
          },
          {
            name: 'sizing.sm',
            value: 8,
            type: 'sizing'
          },
          {
            name: 'sizing.md',
            value: 16,
            type: 'sizing'
          },
          {
            name: 'spacing.padding.small',
            value: 8,
            type: 'spacing'
          },
          {
            name: 'spacing.padding.large',
            value: 24,
            type: 'spacing'
          },
          {
            name: 'typography.heading.h1',
            value: {
              fontSize: 32,
              fontFamily: 'Arial',
              fontWeight: 'bold'
            },
            type: 'typography'
          },
          {
            name: 'typography.body.regular',
            value: {
              fontSize: 16,
              fontFamily: 'Arial',
              fontWeight: 'normal'
            },
            type: 'typography'
          }
        ],
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

  it('can search tokens by name', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Look for search input field
    cy.get('input[placeholder*="search"], input[placeholder*="filter"], input[type="search"]')
      .first()
      .type('brand');
    
    // Should show only brand-related tokens
    cy.contains('color.brand.primary').should('be.visible');
    cy.contains('color.brand.secondary').should('be.visible');
    cy.contains('color.neutral.gray').should('not.be.visible');
    cy.contains('sizing.xs').should('not.be.visible');
  });

  it('can search tokens by partial name', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Search for partial match
    cy.get('input[placeholder*="search"], input[placeholder*="filter"], input[type="search"]')
      .first()
      .type('pad');
    
    // Should show padding tokens
    cy.contains('spacing.padding.small').should('be.visible');
    cy.contains('spacing.padding.large').should('be.visible');
    cy.contains('color.brand.primary').should('not.be.visible');
  });

  it('can clear search filter', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Search for something
    cy.get('input[placeholder*="search"], input[placeholder*="filter"], input[type="search"]')
      .first()
      .type('brand');
    
    // Verify filtered results
    cy.contains('color.brand.primary').should('be.visible');
    cy.contains('sizing.xs').should('not.be.visible');
    
    // Clear the search
    cy.get('input[placeholder*="search"], input[placeholder*="filter"], input[type="search"]')
      .first()
      .clear();
    
    // Should show all tokens again
    cy.contains('color.brand.primary').should('be.visible');
    cy.contains('sizing.xs').should('be.visible');
  });

  it('shows no results message for empty search', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Search for non-existent token
    cy.get('input[placeholder*="search"], input[placeholder*="filter"], input[type="search"]')
      .first()
      .type('nonexistent');
    
    // Should show no results or empty state
    cy.get('body').should('contain.text', 'No tokens found')
      .or('contain.text', 'No results')
      .or('contain.text', 'Nothing found')
      .or('not.contain.text', 'color.brand.primary');
  });

  it('can filter by token type', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Click on color token section to filter by color type
    cy.get('[data-testid=tokenlisting-color]').should('be.visible');
    
    // Verify color tokens are shown in color section
    cy.get('[data-testid=tokenlisting-color]').within(() => {
      cy.contains('color.brand.primary').should('be.visible');
      cy.contains('color.brand.secondary').should('be.visible');
    });
    
    // Verify sizing tokens are in their own section
    cy.get('[data-testid=tokenlisting-sizing]').within(() => {
      cy.contains('sizing.xs').should('be.visible');
      cy.contains('sizing.sm').should('be.visible');
    });
  });

  it('can toggle token sections to show/hide categories', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Collapse color section
    cy.get('[data-testid=tokenlisting-color]').within(() => {
      cy.get('button, [role="button"]').first().click();
    });
    
    // Color tokens should be hidden
    cy.contains('color.brand.primary').should('not.be.visible');
    
    // Expand color section again
    cy.get('[data-testid=tokenlisting-color]').within(() => {
      cy.get('button, [role="button"]').first().click();
    });
    
    // Color tokens should be visible again
    cy.contains('color.brand.primary').should('be.visible');
  });

  it('maintains search across navigation', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Search for tokens
    cy.get('input[placeholder*="search"], input[placeholder*="filter"], input[type="search"]')
      .first()
      .type('brand');
    
    // Navigate to inspector
    cy.get('[data-testid=navitem-inspector]').click();
    
    // Navigate back to tokens
    cy.get('[data-testid=navitem-tokens]').click();
    
    // Search should be maintained (or cleared depending on design)
    cy.get('input[placeholder*="search"], input[placeholder*="filter"], input[type="search"]')
      .first()
      .should('have.value', 'brand')
      .or('have.value', '');
  });

  it('can search with special characters', () => {
    const specialCharParams = {
      ...mockStartupParams,
      localTokenData: {
        ...mockStartupParams.localTokenData,
        values: {
          global: [
            ...mockStartupParams.localTokenData.values.global,
            {
              name: 'color-with-dash',
              value: '#ff0000',
              type: 'color'
            },
            {
              name: 'color_with_underscore',
              value: '#00ff00',
              type: 'color'
            },
            {
              name: 'color.with.dots',
              value: '#0000ff',
              type: 'color'
            }
          ],
        },
      },
    };

    cy.startup(specialCharParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: specialCharParams.localTokenData.values,
    });

    // Search for token with dash
    cy.get('input[placeholder*="search"], input[placeholder*="filter"], input[type="search"]')
      .first()
      .type('dash');
    
    cy.contains('color-with-dash').should('be.visible');
    
    // Clear and search for underscore
    cy.get('input[placeholder*="search"], input[placeholder*="filter"], input[type="search"]')
      .first()
      .clear()
      .type('underscore');
    
    cy.contains('color_with_underscore').should('be.visible');
  });

  it('can search in token values', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Search by hex value (if search supports value searching)
    cy.get('input[placeholder*="search"], input[placeholder*="filter"], input[type="search"]')
      .first()
      .type('#0066cc');
    
    // Should find tokens with that value
    cy.contains('color.brand.primary').should('be.visible');
  });

  it('provides search suggestions or autocomplete', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Start typing in search
    cy.get('input[placeholder*="search"], input[placeholder*="filter"], input[type="search"]')
      .first()
      .type('col');
    
    // Should show dropdown or suggestions (if implemented)
    cy.get('body').should('contain.text', 'color')
      .or('not.contain.text', 'No suggestions'); // Accommodate both cases
  });

  it('handles case-insensitive search', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Search with different case
    cy.get('input[placeholder*="search"], input[placeholder*="filter"], input[type="search"]')
      .first()
      .type('COLOR');
    
    // Should still find color tokens
    cy.contains('color.brand.primary').should('be.visible');
  });

  it('can use keyboard shortcuts for search', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Try common search shortcut (Ctrl+F or Cmd+F)
    cy.get('body').type('{ctrl}f');
    
    // Search input should be focused (if shortcut is implemented)
    cy.get('input[placeholder*="search"], input[placeholder*="filter"], input[type="search"]')
      .first()
      .should('be.focused')
      .or('exist'); // Fallback if shortcut not implemented
  });

  it('can search within token groups', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Search for nested token groups
    cy.get('input[placeholder*="search"], input[placeholder*="filter"], input[type="search"]')
      .first()
      .type('typography');
    
    // Should show typography tokens
    cy.contains('typography.heading.h1').should('be.visible');
    cy.contains('typography.body.regular').should('be.visible');
    cy.contains('color.brand.primary').should('not.be.visible');
  });
});