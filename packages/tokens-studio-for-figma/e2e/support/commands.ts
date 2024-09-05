import { Page } from '@playwright/test';

async function startup(page, params) {
  await page.evaluate((params) => {
    const message = {
      pluginMessage: {
        id: 'startup',
        message: {
          type: 'AsyncMessageTypes.STARTUP',  // Replace with the actual string value of AsyncMessageTypes.STARTUP if needed
          ...params,
        },
      },
    };
    window.postMessage(message, '*');
  }, params);
}

export default startup;
