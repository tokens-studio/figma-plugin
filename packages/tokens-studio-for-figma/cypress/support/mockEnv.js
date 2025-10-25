const MockEnv = () => {
  cy.intercept('GET', 'http://localhost:58630/six7/api/v3/user', {
    type: 'User',
    id: 1000,
    login: 'six7',
    name: 'Jan',
    email: 'example@domain.com',
  }).as('getUser');

  cy.intercept('POST', `https://api-eu.mixpanel.com/**`, {
    success: true
  }).as('mixpanel')

  cy.intercept('GET', `https://api.storyblok.com/**`, {
    success: true
  }).as('storyblok')

  cy.intercept('GET', `https://app.launchdarkly.com/**`, {
    success: true
  }).as('app-launchdarkly')

  cy.intercept('POST', `https://events.launchdarkly.com/**`, {
    success: true
  }).as('events-launchdarkly')

  cy.intercept('GET', `**/get-license*`, {
    plan: 'pro'
  }).as('getLicense')

  cy.intercept('GET', `**/validate-license*`, {
    plan: 'pro'
  }).as('validateLicense')

  cy.intercept('GET', 'http://localhost:58630/six7/api/v3/repos/122/figma-tokens/collaborators/six7/permission', {
    permission: 'admin',
    role_name: 'admin'
  }).as('getPermissions')

  cy.intercept('GET', 'http://localhost:58630/six7/api/v3/repos/122/figma-tokens/contents/tokens.json?ref=main', JSON.stringify({
    "global": {
      "red": {
        "type": "color",
        "name": "red",
        "value": "#ff0000"
      },
      "black": {
        "type": "color",
        "name": "black",
        "value": "#000000"
      }
    },
    "$themes": [
      {
        "id": "light",
        "name": "Light",
        "selectedTokenSets": {
          "global": "enabled"
        }
      }
    ]
  })).as('getContent');

  cy.intercept('GET', '**/repos/122/figma-tokens/branches*', [
    {
      name: 'main',
      commit: {
        sha: 'main-sha',
        url: 'http://localhost:58630/six7/api/v3/repos/122/figma-tokens/commits/main-sha'
      }
    },
    {
      name: 'development',
      commit: {
        sha: 'development-sha',
        url: 'http://localhost:58630/six7/api/v3/repos/122/figma-tokens/commits/development-sha'
      }
    },
  ]).as('getBranches');

  cy.intercept('GET', 'http://localhost:58630/six7/api/v3/repos/122/figma-tokens/git/ref/heads%2Fmain', {
    object: {
      sha: 'main-sha',
    },
  }).as('getMainRef');

  cy.intercept('POST', 'http://localhost:58630/six7/api/v3/repos/122/figma-tokens/git/refs', {
    ref: 'new-branch',
  }).as('createRef');

  cy.intercept('GET', 'http://localhost:58630/six7/api/v3/repos/122/figma-tokens/contents/tokens.json?ref=new-branch', {}).as(
    'getContentNewBranch'
  );

  cy.intercept('GET', 'http://localhost:58630/six7/api/v3/repos/122/figma-tokens/git/ref/heads%2Fnew-branch', {
    object: {
      sha: 'new-branch-sha',
    },
  }).as('getNewBranchRef');

  cy.intercept('POST', 'http://localhost:58630/six7/api/v3/repos/122/figma-tokens/git/blobs', {
    content: {},
  }).as('blob');

  cy.intercept('POST', 'http://localhost:58630/six7/api/v3/repos/122/figma-tokens/git/trees', {
    content: {},
  }).as('trees');

  cy.intercept('POST', 'http://localhost:58630/six7/api/v3/repos/122/figma-tokens/git/commits', {
    content: {},
  }).as('commit');

  cy.intercept('PATCH', 'http://localhost:58630/six7/api/v3/repos/122/figma-tokens/git/refs/heads%2Fnew-branch', {
    content: {},
  }).as('newBranchPatch');

  cy.intercept('PATCH', 'http://localhost:58630/six7/api/v3/repos/122/figma-tokens/git/refs/heads%2Fmain', {
    content: {},
  }).as('mainPatch');
};

export default MockEnv;
