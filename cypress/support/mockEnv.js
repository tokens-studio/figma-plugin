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

  cy.intercept('GET', 'http://localhost:5000/six7/repos/122/figma-tokens/contents/tokens.json?ref=main', {
    name: "tokens.json",
    path: "data/tokens.json",
    sha: "c0963ec8774877260d20e6a94f3ba8244c0828d9",
    size: 163635,
    url: "https://api.github.com/repos/LiamMartens/figma-tokens-sandbox/contents/data/tokens.json?ref=master",
    html_url: "https://github.com/LiamMartens/figma-tokens-sandbox/blob/master/data/tokens.json",
    git_url: "https://api.github.com/repos/LiamMartens/figma-tokens-sandbox/git/blobs/c0963ec8774877260d20e6a94f3ba8244c0828d9",
    download_url: "https://raw.githubusercontent.com/LiamMartens/figma-tokens-sandbox/master/data/tokens.json?token=ABIFPLETS3MM24U5DGYQ6YDC4HJLA",
    type: "file",
    content: "ewogICJnbG9iYWwiOiB7CiAgICAicmVkIjogewogICAgICAidHlwZSI6ICJjb2xvciIsCiAgICAgICJuYW1lIjogInJlZCIsCiAgICAgICJ2YWx1ZSI6ICIjZmYwMDAwIgogICAgfSwKICAgICJibGFjayI6IHsKICAgICAgInR5cGUiOiAiY29sb3IiLAogICAgICAibmFtZSI6ICJibGFjayIsCiAgICAgICJ2YWx1ZSI6ICIjMDAwMDAwIgogICAgfQogIH0sCiAgIiR0aGVtZXMiOiBbCiAgICB7CiAgICAgICJpZCI6ICJsaWdodCIsCiAgICAgICJuYW1lIjogIkxpZ2h0IiwKICAgICAgInNlbGVjdGVkVG9rZW5TZXRzIjogewogICAgICAgICJnbG9iYWwiOiAiZW5hYmxlZCIKICAgICAgfQogICAgfQogIF0KfQ==",
    encoding: "base64",
    _links: {
      self: "https://api.github.com/repos/LiamMartens/figma-tokens-sandbox/contents/data/tokens.json?ref=master",
      git: "https://api.github.com/repos/LiamMartens/figma-tokens-sandbox/git/blobs/c0963ec8774877260d20e6a94f3ba8244c0828d9",
      html: "https://github.com/LiamMartens/figma-tokens-sandbox/blob/master/data/tokens.json"
    }
  }).as('getContent');

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
