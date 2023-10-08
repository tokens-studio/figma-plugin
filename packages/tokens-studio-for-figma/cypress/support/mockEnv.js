const MockEnv = () => {
  cy.intercept('GET', 'http://localhost:5000/six7/user', {
    type: 'User',
    id: 1000,
    login: 'six7',
    name: 'Jan',
    email: 'example@domain.com',
  }).as('getUser');

  cy.intercept('GET', 'http://localhost:5000/six7/repos/122/figma-tokens/collaborators/six7/permission', {
    permission: 'admin',
    role_name: 'admin'
  }).as('getPermissions')

  cy.intercept('GET', 'http://localhost:5000/six7/repos/122/figma-tokens/contents/tokens.json?ref=main', JSON.stringify({
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

  cy.intercept('GET', 'http://localhost:5000/six7six7/repos/122/figma-tokens/branches?per_page=30', [
    {
      name: 'main',
    },
    {
      name: 'development',
    },
  ]).as('getBranch');

  cy.intercept('GET', 'http://localhost:5000/six7/repos/122/figma-tokens/git/ref/heads%2Fmain', {
    object: {
      sha: 'main-sha',
    },
  }).as('getMainRef');

  cy.intercept('POST', 'http://localhost:5000/six7/repos/122/figma-tokens/git/refs', {
    ref: 'new-branch',
  }).as('createRef');

  cy.intercept('GET', 'http://localhost:5000/six7/repos/122/figma-tokens/contents/tokens.json?ref=new-branch', {}).as(
    'getContent'
  );

  cy.intercept('GET', 'http://localhost:5000/six7/repos/122/figma-tokens/git/ref/heads%2Fnew-branch', {
    object: {
      sha: 'new-branch-sha',
    },
  }).as('getNewBranchRef');

  cy.intercept('POST', 'http://localhost:5000/six7/repos/122/figma-tokens/git/blobs', {
    content: {},
  }).as('blob');

  cy.intercept('POST', 'http://localhost:5000/six7/repos/122/figma-tokens/git/trees', {
    content: {},
  }).as('trees');

  cy.intercept('POST', 'http://localhost:5000/six7/repos/122/figma-tokens/git/commits', {
    content: {},
  }).as('commit');

  cy.intercept('PATCH', 'http://localhost:5000/six7/repos/122/figma-tokens/git/refs/heads%2Fnew-branch', {
    content: {},
  }).as('newBranchPatch');

  cy.intercept('PATCH', 'http://localhost:5000/six7/repos/122/figma-tokens/git/refs/heads%2Fmain', {
    content: {},
  }).as('mainPatch');
};

export default MockEnv;
