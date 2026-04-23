describe('OAuth Device Flow Automation', () => {
  const API_BASE = 'https://api-staging.tokens.studio';
  const STUDIO_BASE = 'https://staging.tokens.studio';
  const CLIENT_ID = 'figma_plugin';
  const SCOPE = 'read write';
  const EMAIL = 'akshay@tokens.studio';
  const PASSWORD = 'Test@123';
  const SITE_PWD = 'hymahyma';

  it('automatically authorizes a device code and saves the token', { defaultCommandTimeout: 10000 }, () => {
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

      // 3. Resilient UI Flow Handler
      let stepCount = 0;
      const runStep = () => {
        stepCount++;
        if (stepCount > 30) {
          throw new Error('Too many UI steps without reaching success state');
        }

        cy.log(`UI Step #${stepCount}`);
        cy.wait(2000);
        
        cy.url().then((url) => {
          cy.get('body').then(($body) => {
            const bodyText = $body.text().toLowerCase();
            const normalizedUrl = url.toLowerCase();
            
            // Check for success indicators
            if (bodyText.includes('device connected') || 
                bodyText.includes('authorized') || 
                normalizedUrl.includes('/organizations/') ||
                $body.find('[data-testid="workspace-settings-link"]').length > 0) {
              cy.log('✅ UI Authorization successful or already on Dashboard');
              return;
            }

            // A. Site Password
            const pwdField = $body.find('#pwd');
            if (pwdField.length > 0 && pwdField.is(':visible')) {
              cy.get('#pwd').type(SITE_PWD + '{enter}');
              cy.then(runStep);
              return;
            }

            // B. Login
            const emailField = $body.find('#login-email');
            if (emailField.length > 0 && emailField.is(':visible')) {
              cy.get('#login-email').clear().type(EMAIL);
              cy.get('#login-password').clear().type(PASSWORD + '{enter}');
              cy.then(runStep);
              return;
            }

            // C. Device Code Entry
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

            // Unknown state - wait and retry
            cy.log('Intermediate state, waiting...');
            cy.wait(3000).then(runStep);
          });
        });
      };

      runStep();

      // 4. Token Polling
      const pollToken = (retryCount = 0) => {
        if (retryCount > 60) throw new Error('Polling timed out (5 mins)');
        
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
              cy.log('🚀 SUCCESS: Token acquired!');
            } else {
              cy.log(`Polling (${retryCount}/60)... Status: ${res.status} Body: ${JSON.stringify(res.body)}`);
              cy.wait(5000);
              pollToken(retryCount + 1);
            }
        });
      };

      // Start polling after UI attempts
      cy.then(() => pollToken());
    });
  });
});
