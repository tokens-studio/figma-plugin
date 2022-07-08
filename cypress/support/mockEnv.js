const MockEnv = () => {
    cy.intercept('GET', 'http://localhost:5000/six7/repos/122/figma-tokens/branches', [{
            name: 'main'
        },
        {
            name: 'development'
        },
    ], ).as('getBranch');

    cy.intercept('GET', 'http://localhost:5000/six7/repos/122/figma-tokens/git/ref/heads%2Fmain', {
        object: {
            sha: 'main-sha',
        },
    }).as('getMainRef');

    cy.intercept('POST', 'http://localhost:5000/six7/repos/122/figma-tokens/git/refs', {
        ref: 'new-branch',
    }).as('createRef');

    cy.intercept('GET', 'http://localhost:5000/six7/repos/122/figma-tokens/contents/tokens.json?ref=new-branch', {}).as('getContent');

    cy.intercept('GET', 'http://localhost:5000/six7/repos/122/figma-tokens/git/ref/heads%2Fnew-branch', {
        object: {
            sha: 'new-branch-sha',
        },
    }).as('getNewBranchRef');

    cy.intercept('POST', 'http://localhost:5000/six7/repos/122/figma-tokens/git/blobs', {
        content: {}
    }).as('blob');

    cy.intercept('POST', 'http://localhost:5000/six7/repos/122/figma-tokens/git/trees', {
        content: {}
    }).as('trees');

    cy.intercept('POST', 'http://localhost:5000/six7/repos/122/figma-tokens/git/commits', {
        content: {}
    }).as('commit');
        
    cy.intercept('PATCH', 'http://localhost:5000/six7/repos/122/figma-tokens/git/refs/heads%2Fnew-branch', {
        content: {}
    }).as('newBranchPatch');

    cy.intercept('PATCH', 'http://localhost:5000/six7/repos/122/figma-tokens/git/refs/heads%2Fmain', {
        content: {}
    }).as('mainPatch');
};

export default MockEnv;