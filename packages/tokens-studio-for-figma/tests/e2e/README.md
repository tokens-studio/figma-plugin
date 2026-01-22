# Playwright E2E Tests

This directory contains end-to-end tests for the Tokens Studio Figma plugin using Playwright.

## Overview

The Playwright tests are designed to test the plugin UI in browser preview mode, ensuring that the functionality and user experience work as expected across different scenarios.

## Test Structure

- `basic.spec.ts` - Basic app loading and initialization tests
- `startup.spec.ts` - Plugin startup scenarios with different configurations
- `tokens.spec.ts` - Token management functionality (creating, editing tokens)
- `ui-interactions.spec.ts` - UI interactions, navigation, and responsive design tests

## Running Tests

### Prerequisites

1. Build the preview version of the app:
   ```bash
   yarn build:preview
   ```

2. Install Playwright (if not already installed):
   ```bash
   yarn add -D @playwright/test
   ```

### Running Tests

```bash
# Run all E2E tests
yarn playwright:test

# Run tests with browser UI visible
yarn playwright:test:headed

# Run tests in debug mode
yarn playwright:test:debug

# Run specific test file
npx playwright test tests/e2e/startup.spec.ts

# Run tests for specific browser
npx playwright test --project=chromium
```

### Viewing Results

```bash
# View test report
yarn playwright:report

# View traces for failed tests
npx playwright show-trace test-results/path-to-trace.zip
```

## Test Configuration

The tests are configured in `playwright.config.ts` and use:

- **Base URL**: `http://localhost:58630` (preview server)
- **Browser**: Chrome/Chromium (primary), Firefox and Safari disabled due to installation constraints
- **Viewport**: Desktop Chrome settings with responsive testing
- **Timeout**: Standard Playwright timeouts with retries on CI

## Test Patterns

### Plugin Startup

Tests simulate the Figma plugin environment by sending postMessage events to the application:

```typescript
async function sendStartupMessage(page, params) {
  await page.evaluate((startupParams) => {
    const message = {
      pluginMessage: {
        id: 'startup',
        message: {
          type: 'STARTUP',
          ...startupParams,
        },
      },
    };
    window.postMessage(message, '*');
  }, params);
}
```

### Mock API Responses

External API calls are mocked to ensure tests run reliably:

```typescript
await page.route('**/api-eu.mixpanel.com/**', (route) => {
  route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
});
```

### Token Management

Tests verify token creation, editing, and management functionality using the plugin's data-testid attributes.

## Maintenance

- Keep test data consistent with the existing Cypress tests for compatibility
- Update mock startup parameters when the plugin API changes
- Add new test scenarios as features are added to the plugin
- Ensure tests remain isolated and don't depend on external services

## Troubleshooting

- If browser installation fails, the tests are configured to use system Chrome with `channel: 'chrome'`
- Build artifacts are ignored in git - run `yarn build:preview` before testing
- The preview server starts automatically when running tests via the `webServer` configuration