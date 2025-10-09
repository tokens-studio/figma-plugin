import {
  StorageProviderType
} from '@/constants/StorageProviderType';
import { UpdateMode } from '@/constants/UpdateMode';
import MockEnv from '../support/mockEnv';

describe('Error and Edge State Handling', () => {
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
          name: 'sizing.xs',
          value: 4,
          type: 'sizing'
        }],
      },
      version: '91',
    },
  }

  const githubProvider = {
    provider: StorageProviderType.GITHUB,
    id: '122/figma-tokens',
    secret: '456',
    name: 'GitHub Test',
    baseUrl: 'six7',
    branch: 'main',
    filePath: 'tokens.json'
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

  describe('Footer Component', () => {
    it('shows push and pull buttons for GitHub provider', () => {
      cy.startup({
        ...mockStartupParams,
        storageType: githubProvider,
        localApiProviders: [githubProvider],
      });
      cy.get('[data-testid=footer-push-button]').should('exist');
      cy.get('[data-testid=footer-pull-button]').should('exist');
    });

    it('shows push and pull buttons for GitLab provider', () => {
      const gitlabProvider = {
        ...githubProvider,
        provider: StorageProviderType.GITLAB,
        name: 'GitLab Test',
      };
      cy.startup({
        ...mockStartupParams,
        storageType: gitlabProvider,
        localApiProviders: [gitlabProvider],
      });
      cy.get('[data-testid=footer-push-button]').should('exist');
      cy.get('[data-testid=footer-pull-button]').should('exist');
    });

    it('shows push and pull buttons for Bitbucket provider', () => {
      const bitbucketProvider = {
        ...githubProvider,
        provider: StorageProviderType.BITBUCKET,
        name: 'Bitbucket Test',
      };
      cy.startup({
        ...mockStartupParams,
        storageType: bitbucketProvider,
        localApiProviders: [bitbucketProvider],
      });
      cy.get('[data-testid=footer-push-button]').should('exist');
      cy.get('[data-testid=footer-pull-button]').should('exist');
    });

    it('displays version number', () => {
      cy.startup(mockStartupParams);
      cy.contains(/V \d+\.\d+\.\d+/).should('exist');
    });
  });

  describe('PushDialog Component', () => {
    it('shows push dialog with commit message field for GitHub', () => {
      cy.startup({
        ...mockStartupParams,
        storageType: githubProvider,
        localApiProviders: [githubProvider],
      });
      cy.receiveSetTokens({
        version: '5',
        values: {
          global: [{
            name: 'sizing.xs',
            value: 4,
            type: 'sizing'
          }],
        },
      });
      cy.get('[data-testid=tokenlisting-sizing] [data-testid=button-add-new-token]').click();
      cy.get('[data-testid=input-name]').type('sizing.sm');
      cy.get('[data-testid=input-value]').type('8');
      cy.get('[data-testid=button-save]').click();
      cy.get('[data-testid=footer-push-button]').click();
      cy.get('[data-testid=push-dialog-commit-message]').should('exist');
      cy.get('[data-testid=push-dialog-button-push-changes]').should('be.disabled');
    });

    it('enables push button when commit message is entered', () => {
      cy.startup({
        ...mockStartupParams,
        storageType: githubProvider,
        localApiProviders: [githubProvider],
      });
      cy.receiveSetTokens({
        version: '5',
        values: {
          global: [{
            name: 'sizing.xs',
            value: 4,
            type: 'sizing'
          }],
        },
      });
      cy.get('[data-testid=tokenlisting-sizing] [data-testid=button-add-new-token]').click();
      cy.get('[data-testid=input-name]').type('sizing.sm');
      cy.get('[data-testid=input-value]').type('8');
      cy.get('[data-testid=button-save]').click();
      cy.get('[data-testid=footer-push-button]').click();
      cy.get('[data-testid=push-dialog-commit-message]').type('test commit');
      cy.get('[data-testid=push-dialog-button-push-changes]').should('not.be.disabled');
    });

    it('shows loading state when pushing changes', () => {
      cy.startup({
        ...mockStartupParams,
        storageType: githubProvider,
        localApiProviders: [githubProvider],
      });
      cy.receiveSetTokens({
        version: '5',
        values: {
          global: [{
            name: 'sizing.xs',
            value: 4,
            type: 'sizing'
          }],
        },
      });
      cy.get('[data-testid=tokenlisting-sizing] [data-testid=button-add-new-token]').click();
      cy.get('[data-testid=input-name]').type('sizing.sm');
      cy.get('[data-testid=input-value]').type('8');
      cy.get('[data-testid=button-save]').click();
      cy.get('[data-testid=footer-push-button]').click();
      cy.get('[data-testid=push-dialog-commit-message]').type('test commit');
      cy.get('[data-testid=push-dialog-button-push-changes]').click();
      cy.contains(/pushingTo.*GitHub/).should('exist');
    });

    it('shows success state after successful push', () => {
      cy.startup({
        ...mockStartupParams,
        storageType: githubProvider,
        localApiProviders: [githubProvider],
      });
      cy.receiveSetTokens({
        version: '5',
        values: {
          global: [{
            name: 'sizing.xs',
            value: 4,
            type: 'sizing'
          }],
        },
      });
      cy.get('[data-testid=tokenlisting-sizing] [data-testid=button-add-new-token]').click();
      cy.get('[data-testid=input-name]').type('sizing.sm');
      cy.get('[data-testid=input-value]').type('8');
      cy.get('[data-testid=button-save]').click();
      cy.get('[data-testid=footer-push-button]').click();
      cy.get('[data-testid=push-dialog-commit-message]').type('test commit');
      cy.get('[data-testid=push-dialog-button-push-changes]').click();
      cy.get('[data-testid=push-dialog-success-heading]', { timeout: 10000 }).should('exist');
      cy.contains('All done!').should('exist');
    });
  });

  describe('PullDialog Component', () => {
    it('shows pull dialog when clicking pull button', () => {
      cy.startup({
        ...mockStartupParams,
        storageType: githubProvider,
        localApiProviders: [githubProvider],
      });
      cy.get('[data-testid=footer-pull-button]').click();
      cy.contains(/pullFrom/).should('exist');
      cy.contains('cancel').should('exist');
      cy.contains('pullTokens').should('exist');
    });

    it('shows loading state when pulling tokens', () => {
      cy.startup({
        ...mockStartupParams,
        storageType: githubProvider,
        localApiProviders: [githubProvider],
      });
      cy.get('[data-testid=footer-pull-button]').click();
      cy.get('#pullDialog-button-override').click();
      cy.contains(/pullFrom/).should('exist');
    });

    it('handles pull cancellation', () => {
      cy.startup({
        ...mockStartupParams,
        storageType: githubProvider,
        localApiProviders: [githubProvider],
      });
      cy.get('[data-testid=footer-pull-button]').click();
      cy.get('#pullDialog-button-close').click();
      cy.get('#pullDialog-button-close').should('not.exist');
    });
  });

  describe('Branch Selector Edge Cases', () => {
    it('does not show branch selector for local storage', () => {
      cy.startup(mockStartupParams);
      cy.get('[data-testid=branch-selector-menu-trigger]').should('not.exist');
    });

    it('shows branch selector for git providers', () => {
      cy.startup({
        ...mockStartupParams,
        storageType: githubProvider,
        localApiProviders: [githubProvider],
      });
      cy.get('[data-testid=branch-selector-menu-trigger]').should('exist');
    });
  });

  describe('Empty State Handling', () => {
    it('shows welcome screen when no tokens exist', () => {
      cy.startup({
        ...mockStartupParams,
        localTokenData: {
          ...mockStartupParams.localTokenData,
          values: {},
        },
      });
      cy.contains("Found an issue? We're on GitHub!").should('exist');
    });

    it('shows token listing when tokens exist', () => {
      cy.startup(mockStartupParams);
      cy.get('[data-testid=tokenlisting-sizing]').should('exist');
    });
  });

  describe('Provider-Specific Behavior', () => {
    it('shows correct provider name for GitHub', () => {
      cy.startup({
        ...mockStartupParams,
        storageType: githubProvider,
        localApiProviders: [githubProvider],
      });
      cy.receiveSetTokens({
        version: '5',
        values: {
          global: [{
            name: 'sizing.xs',
            value: 4,
            type: 'sizing'
          }],
        },
      });
      cy.get('[data-testid=tokenlisting-sizing] [data-testid=button-add-new-token]').click();
      cy.get('[data-testid=input-name]').type('sizing.sm');
      cy.get('[data-testid=input-value]').type('8');
      cy.get('[data-testid=button-save]').click();
      cy.get('[data-testid=footer-push-button]').click();
      cy.contains(/pushTo.*GitHub/).should('exist');
    });

    it('shows correct provider name for GitLab', () => {
      const gitlabProvider = {
        ...githubProvider,
        provider: StorageProviderType.GITLAB,
        name: 'GitLab Test',
      };
      cy.startup({
        ...mockStartupParams,
        storageType: gitlabProvider,
        localApiProviders: [gitlabProvider],
      });
      cy.receiveSetTokens({
        version: '5',
        values: {
          global: [{
            name: 'sizing.xs',
            value: 4,
            type: 'sizing'
          }],
        },
      });
      cy.get('[data-testid=tokenlisting-sizing] [data-testid=button-add-new-token]').click();
      cy.get('[data-testid=input-name]').type('sizing.sm');
      cy.get('[data-testid=input-value]').type('8');
      cy.get('[data-testid=button-save]').click();
      cy.get('[data-testid=footer-push-button]').click();
      cy.contains(/pushTo.*GitLab/).should('exist');
    });

    it('shows correct provider name for Bitbucket', () => {
      const bitbucketProvider = {
        ...githubProvider,
        provider: StorageProviderType.BITBUCKET,
        name: 'Bitbucket Test',
      };
      cy.startup({
        ...mockStartupParams,
        storageType: bitbucketProvider,
        localApiProviders: [bitbucketProvider],
      });
      cy.receiveSetTokens({
        version: '5',
        values: {
          global: [{
            name: 'sizing.xs',
            value: 4,
            type: 'sizing'
          }],
        },
      });
      cy.get('[data-testid=tokenlisting-sizing] [data-testid=button-add-new-token]').click();
      cy.get('[data-testid=input-name]').type('sizing.sm');
      cy.get('[data-testid=input-value]').type('8');
      cy.get('[data-testid=button-save]').click();
      cy.get('[data-testid=footer-push-button]').click();
      cy.contains(/pushTo.*Bitbucket/).should('exist');
    });
  });
});
