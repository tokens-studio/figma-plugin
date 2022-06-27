const MockEnv = () => {
    cy.intercept('GET', 'https://api.github.com/repos/122//branches', [{
            name: 'main'
        },
        {
            name: 'development'
        },
    ], ).as('getBranch');

    cy.intercept('GET', 'https://api.github.com/repos/122//git/ref/heads%2Fmain', {
        object: {
            sha: 'main-sha',
        },
    }).as('getRef');

    cy.intercept('POST', 'https://api.github.com/repos/122//git/refs', {
        ref: 'development',
    }).as('createRef');

    
};

export default MockEnv