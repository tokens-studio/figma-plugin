describe('OAuth Device Flow Automation', () => {
  const API_BASE = 'https://api-staging.tokens.studio';
  const STUDIO_BASE = 'https://staging.tokens.studio';
  const CLIENT_ID = 'figma_plugin';
  const SCOPE = 'read write';
  const EMAIL = 'akshay@tokens.studio';
  const PASSWORD = 'Test@123';
  const SITE_PWD = 'hymahyma';

  it('automatically authorizes a device code and saves the token', () => {
    // 1. Get Device Code
    cy.request({
      method: 'POST',
      url: `${API_BASE}/oauth/authorize_device`,
      form: true,
      body: {
        client_id: CLIENT_ID,
        scope: SCOPE
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      const { device_code, user_code, verification_uri_complete } = response.body;

      // 2. Visit Staging
      cy.visit(verification_uri_complete || `${STUDIO_BASE}/device`);

      // 3. Resilient Flow Handler
      let stepCount = 0;
      const runStep = () => {
        stepCount++;
        if (stepCount > 15) {
          cy.log('Too many steps, stopping.');
          return;
        }

        cy.wait(2000);
        cy.get('body').then(($body) => {
          // A. Handle Site Password
          const pwdField = $body.find('#pwd');
          if (pwdField.length > 0 && pwdField.is(':visible')) {
            cy.get('#pwd').type(SITE_PWD + '{enter}');
            cy.then(runStep);
            return;
          }

          // B. Handle Login
          const emailField = $body.find('#login-email');
          if (emailField.length > 0 && emailField.is(':visible')) {
            cy.get('#login-email').clear().type(EMAIL);
            cy.get('#login-password').clear().type(PASSWORD + '{enter}');
            cy.then(runStep);
            return;
          }

          // C. Handle Device Code Entry
          const codeField = $body.find('#user_code');
          if (codeField.length > 0 && codeField.is(':visible')) {
            cy.get('#user_code').then(($el) => {
              if (!$el.val()) {
                cy.get('#user_code').type(user_code);
              }
            });
            cy.contains('button', 'Connect Device').click();
            cy.then(runStep);
            return;
          }

          // D. Success Check
          if ($body.text().includes('Device connected') || $body.text().includes('Authorized')) {
            cy.log('Authorization successful!');
            return;
          }

          // If no known field, just wait and retry
          cy.log('No known fields found, waiting...');
          cy.wait(2000).then(runStep);
        });
      };

      runStep();

      // 6. Poll for Token
      const pollToken = (retryCount = 0) => {
        if (retryCount > 60) throw new Error('Polling timed out');
        
        cy.request({
          method: 'POST',
          url: `${API_BASE}/oauth/token`,
          form: true,
          body: {
            client_id: CLIENT_ID,
            grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
            device_code: device_code
          },
          failOnStatusCode: false
        }).then((res) => {
          if (res.status === 200) {
            cy.writeFile('scripts/.test-token.json', res.body);
            cy.log('Token saved!');
          } else {
            cy.log(`Poll Status: ${res.status} - ${JSON.stringify(res.body)}`);
            cy.wait(5000);
            pollToken(retryCount + 1);
          }
        });
      };

      pollToken();
    });
  });
});
