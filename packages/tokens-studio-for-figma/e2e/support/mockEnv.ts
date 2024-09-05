import { test, expect } from '@playwright/test';

const MockEnv = async (context) => {
  await context.route('http://localhost:58630/six7/user', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: {
        type: 'User',
        id: 1000,
        login: 'six7',
        name: 'Jan',
        email: 'example@domain.com',
      },
    });
  });

  await context.route('https://api-eu.mixpanel.com/**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: { success: true },
    });
  });

  await context.route('https://api.storyblok.com/**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: { success: true },
    });
  });

  await context.route('https://app.launchdarkly.com/**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: { success: true },
    });
  });

  await context.route('https://events.launchdarkly.com/**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: { success: true },
    });
  });

  await context.route('**/get-license*', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: { plan: 'pro' },
    });
  });

  await context.route('**/validate-license*', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: { plan: 'pro' },
    });
  });

  await context.route('http://localhost:58630/six7/repos/122/figma-tokens/collaborators/six7/permission', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: {
        permission: 'admin',
        role_name: 'admin',
      },
    });
  });

  await context.route('http://localhost:58630/six7/repos/122/figma-tokens/contents/tokens.json?ref=main', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        global: {
          red: {
            type: 'color',
            name: 'red',
            value: '#ff0000',
          },
          black: {
            type: 'color',
            name: 'black',
            value: '#000000',
          },
        },
        $themes: [
          {
            id: 'light',
            name: 'Light',
            selectedTokenSets: {
              global: 'enabled',
            },
          },
        ],
      }),
    });
  });

  await context.route('http://localhost:58630/six7/repos/122/figma-tokens/branches?per_page=30', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: [
        { name: 'main' },
        { name: 'development' },
      ],
    });
  });

  await context.route('http://localhost:58630/six7/repos/122/figma-tokens/git/ref/heads%2Fmain', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: {
        object: {
          sha: 'main-sha',
        },
      },
    });
  });

  await context.route('http://localhost:58630/six7/repos/122/figma-tokens/git/refs', route => {
    route.fulfill({
      status: 201, // typically POST responses return a 201 for created resources
      contentType: 'application/json',
      json: {
        ref: 'new-branch',
      },
    });
  });

  await context.route('http://localhost:58630/six7/repos/122/figma-tokens/contents/tokens.json?ref=new-branch', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: {},
    });
  });

  await context.route('http://localhost:58630/six7/repos/122/figma-tokens/git/ref/heads%2Fnew-branch', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: {
        object: {
          sha: 'new-branch-sha',
        },
      },
    });
  });

  await context.route('http://localhost:58630/six7/repos/122/figma-tokens/git/blobs', route => {
    route.fulfill({
      status: 201,
      contentType: 'application/json',
      json: { content: {} },
    });
  });

  await context.route('http://localhost:58630/six7/repos/122/figma-tokens/git/trees', route => {
    route.fulfill({
      status: 201,
      contentType: 'application/json',
      json: { content: {} },
    });
  });

  await context.route('http://localhost:58630/six7/repos/122/figma-tokens/git/commits', route => {
    route.fulfill({
      status: 201,
      contentType: 'application/json',
      json: { content: {} },
    });
  });

  await context.route('http://localhost:58630/six7/repos/122/figma-tokens/git/refs/heads%2Fnew-branch', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: { content: {} },
    });
  });

  await context.route('http://localhost:58630/six7/repos/122/figma-tokens/git/refs/heads%2Fmain', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: { content: {} },
    });
  });
};

export default MockEnv;
