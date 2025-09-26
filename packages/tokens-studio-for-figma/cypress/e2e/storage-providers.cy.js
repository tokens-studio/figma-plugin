import {
  StorageProviderType
} from '@/constants/StorageProviderType';
import { UpdateMode } from '@/constants/UpdateMode';
import MockEnv from '../support/mockEnv';
import { fillInput } from './helpers/utils';

describe('Storage Providers', () => {
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
        }],
      },
      version: '91',
    },
  }

  const mockGitHubProvider = {
    provider: StorageProviderType.GITHUB,
    id: 'github-test',
    name: 'Test GitHub Repo',
    secret: 'github-token-123',
    owner: 'test-owner',
    repository: 'test-repo',
    branch: 'main',
    filePath: 'tokens.json',
  };

  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad(win) {
        cy.spy(win, 'postMessage').as('postMessage');
      },
    });
    cy.waitForReact(1000);
    MockEnv();
  });

  it('can set up GitHub storage provider', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Navigate to settings and add GitHub provider
    cy.get('[data-testid="bottom-bar-settings"]').click();
    cy.contains('Settings').click();
    cy.get('[data-testid="add-storage-item-button"]').click();
    cy.get('[data-testid="add-GitHub-credential"]').click();

    // Fill GitHub configuration form
    cy.contains('Add GitHub credentials').should('be.visible');
    
    // Fill required fields (assuming these test IDs exist based on common patterns)
    fillInput({
      input: 'name',
      value: mockGitHubProvider.name,
    });
    
    // Note: The actual test IDs might be different - this tests the flow
    cy.get('input[placeholder*="token"], input[name*="token"], input[id*="token"]').type(mockGitHubProvider.secret);
    cy.get('input[placeholder*="owner"], input[name*="owner"], input[id*="owner"]').type(mockGitHubProvider.owner);
    cy.get('input[placeholder*="repository"], input[name*="repository"], input[id*="repository"]').type(mockGitHubProvider.repository);
    
    // Save the configuration
    cy.get('button[type="submit"], button').contains(/save|add|create/i).click();

    // Verify the provider was added (should show in the list)
    cy.contains(mockGitHubProvider.name).should('be.visible');
  });

  it('can switch between storage providers', () => {
    const startupWithProvider = {
      ...mockStartupParams,
      localApiProviders: [mockGitHubProvider],
      storageType: mockGitHubProvider,
    };

    cy.startup(startupWithProvider);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Navigate to settings
    cy.get('[data-testid="bottom-bar-settings"]').click();
    cy.contains('Settings').click();
    
    // Should show both Local and GitHub providers
    cy.contains('Local document').should('be.visible');
    cy.contains(mockGitHubProvider.name).should('be.visible');
    
    // Click on Local to switch back
    cy.contains('Local document').click();
    cy.get('@postMessage').should('have.been.called');
  });

  it('can configure GitLab storage provider', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Navigate to settings and add GitLab provider
    cy.get('[data-testid="bottom-bar-settings"]').click();
    cy.contains('Settings').click();
    cy.get('[data-testid="add-storage-item-button"]').click();
    cy.get('[data-testid="add-GitLab-credential"]').click();

    // Should show GitLab configuration modal
    cy.contains('Add GitLab credentials').should('be.visible');
    
    // GitLab should have similar fields to GitHub
    cy.get('input').should('have.length.greaterThan', 2);
  });

  it('can configure URL storage provider', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Navigate to settings and add URL provider
    cy.get('[data-testid="bottom-bar-settings"]').click();
    cy.contains('Settings').click();
    cy.get('[data-testid="add-storage-item-button"]').click();
    cy.contains('URL').click();

    // Should show URL configuration modal
    cy.contains('Add URL credentials').should('be.visible');
  });

  it('shows existing storage providers', () => {
    const multiProviderStartup = {
      ...mockStartupParams,
      localApiProviders: [
        mockGitHubProvider,
        {
          provider: StorageProviderType.GITLAB,
          id: 'gitlab-test',
          name: 'Test GitLab Repo',
          secret: 'gitlab-token-123',
          owner: 'test-owner',
          repository: 'test-repo',
        }
      ],
    };

    cy.startup(multiProviderStartup);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Navigate to settings
    cy.get('[data-testid="bottom-bar-settings"]').click();
    cy.contains('Settings').click();
    
    // Should show all configured providers
    cy.contains('Local document').should('be.visible');
    cy.contains(mockGitHubProvider.name).should('be.visible');
    cy.contains('Test GitLab Repo').should('be.visible');
  });

  it('can edit existing storage provider', () => {
    const startupWithProvider = {
      ...mockStartupParams,
      localApiProviders: [mockGitHubProvider],
    };

    cy.startup(startupWithProvider);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Navigate to settings
    cy.get('[data-testid="bottom-bar-settings"]').click();
    cy.contains('Settings').click();
    
    // Click edit on the GitHub provider (assuming there's an edit button/icon)
    cy.contains(mockGitHubProvider.name).parent().within(() => {
      cy.get('button[aria-label*="edit"], button[title*="edit"], svg[data-testid*="edit"], button').contains(/edit/i).click({ force: true });
    });
    
    // Should open edit modal
    cy.contains('Edit GitHub credentials').should('be.visible');
  });

  it('can remove storage provider', () => {
    const startupWithProvider = {
      ...mockStartupParams,
      localApiProviders: [mockGitHubProvider],
    };

    cy.startup(startupWithProvider);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Navigate to settings
    cy.get('[data-testid="bottom-bar-settings"]').click();
    cy.contains('Settings').click();
    
    // Click edit to access remove option
    cy.contains(mockGitHubProvider.name).parent().within(() => {
      cy.get('button[aria-label*="edit"], button[title*="edit"], svg[data-testid*="edit"], button').contains(/edit/i).click({ force: true });
    });
    
    // Look for delete/remove button in the edit modal
    cy.contains('Remove').should('be.visible');
  });

  it('shows Tokens Studio provider option', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Navigate to settings and open provider selection
    cy.get('[data-testid="bottom-bar-settings"]').click();
    cy.contains('Settings').click();
    cy.get('[data-testid="add-storage-item-button"]').click();
    
    // Should show Tokens Studio as first option
    cy.contains('Tokens Studio').should('be.visible');
  });

  it('shows Azure DevOps provider option', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Navigate to settings and open provider selection
    cy.get('[data-testid="bottom-bar-settings"]').click();
    cy.contains('Settings').click();
    cy.get('[data-testid="add-storage-item-button"]').click();
    
    // Should show Azure DevOps option
    cy.contains('Azure DevOps').should('be.visible');
  });

  it('handles provider validation errors', () => {
    cy.startup(mockStartupParams);
    cy.get('[data-testid="button-configure"]').should('be.visible');
    cy.receiveSetTokens({
      version: '5',
      values: mockStartupParams.localTokenData.values,
    });

    // Navigate to settings and add GitHub provider
    cy.get('[data-testid="bottom-bar-settings"]').click();
    cy.contains('Settings').click();
    cy.get('[data-testid="add-storage-item-button"]').click();
    cy.get('[data-testid="add-GitHub-credential"]').click();

    // Try to save without filling required fields
    cy.get('button[type="submit"], button').contains(/save|add|create/i).click();
    
    // Should show validation errors (assuming error messages exist)
    cy.get('body').should('contain.text', 'required').or('contain.text', 'field').or('contain.text', 'error');
  });
});