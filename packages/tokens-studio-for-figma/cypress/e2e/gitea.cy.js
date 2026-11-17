import { StorageProviderType } from '@/constants/StorageProviderType';
import { UpdateMode } from '@/constants/UpdateMode';
import MockEnv from '../support/mockEnv';

// Mocked API coverage; this suite does not establish server CORS compatibility.
describe('Gitea sync provider', () => {
  const provider = {
    provider: StorageProviderType.GITEA,
    internalId: 'gitea-test', name: 'Gitea test', id: 'owner/repo', secret: 'test-only',
    baseUrl: 'https://git.example.test/gitea', branch: 'main', filePath: 'tokens.json',
  };
  const tokenData = { global: { red: { type: 'color', value: '#ff0000' } }, $themes: [] };
  const startup = {
    activeTheme: {}, lastOpened: Date.now(),
    onboardingExplainer: { sets: true, inspect: true, syncProviders: true },
    localApiProviders: [provider], licenseKey: null,
    settings: {
      width: 800, height: 500, ignoreFirstPartForStyles: false, inspectDeep: false,
      prefixStylesWithThemeName: false, showEmptyGroups: true, updateMode: UpdateMode.PAGE,
      updateOnChange: false, updateRemote: true, shouldUpdateStyles: true, shouldSwapFigmaModes: false,
    },
    storageType: provider,
    user: { figmaId: 'figma:1234', userId: 'uid:1234', name: 'Test' },
    localTokenData: {
      activeTheme: {}, checkForChanges: false, themes: [], usedTokenSet: {},
      updatedAt: new Date().toISOString(), values: {}, version: '91',
    },
  };

  beforeEach(() => {
    cy.visit('/');
    cy.waitForReact(1000);
    MockEnv();
    const api = `${provider.baseUrl}/api/v1/repos/owner/repo`;
    cy.intercept('GET', api, { default_branch: 'main', empty: false, permissions: { push: true } });
    cy.intercept('GET', `${api}/branches?*`, (req) => {
      req.reply(new URL(req.url).searchParams.get('page') === '1' ? [{ name: 'main' }] : []);
    });
    cy.intercept('GET', `${api}/branches/main`, { name: 'main', commit: { id: 'commit-one' } });
    cy.intercept('GET', `${api}/contents/tokens.json?*`, {
      type: 'file', path: 'tokens.json', sha: 'blob-one', encoding: 'base64',
      content: btoa(JSON.stringify(tokenData)),
    }).as('giteaContent');
  });

  it('pulls on startup and allows editing the configured provider', () => {
    cy.startup(startup);
    cy.wait('@giteaContent');
    cy.get('[data-testid=footer-pull-button]').should('be.visible');
    cy.get('[data-testid=navitem-settings]').click();
    cy.get('[data-testid=storage-item-tools-dropdown]').first().click();
    cy.contains('Edit').click();
    cy.get('input[name=secret]').should('have.attr', 'type', 'password');
    cy.get('input[name=baseUrl]').should('have.value', provider.baseUrl);
    cy.contains('Self-hosted Gitea requires CORS configuration').should('be.visible');
    cy.screenshot('gitea-edit-provider');
  });

  it('offers Gitea setup without assuming a public server', () => {
    cy.startup(startup);
    cy.wait('@giteaContent');
    cy.get('[data-testid=navitem-settings]').click();
    cy.get('[data-testid=add-storage-item-button]').click();
    cy.get('[data-testid=add-Gitea-credential]').click();
    cy.get('input[name=baseUrl]').should('have.value', '').and('have.attr', 'required');
    cy.get('input[name=secret]').should('have.attr', 'type', 'password');
    cy.contains('View Gitea administrator setup instructions.').should('have.attr', 'href')
      .and('equal', 'https://docs.tokens.studio/token-storage/remote/sync-git-gitea?ref=addprovider');
    cy.screenshot('gitea-create-provider');
  });
});
